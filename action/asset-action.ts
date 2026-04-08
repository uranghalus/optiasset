"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recordAssetHistory } from "./asset-history-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/* =======================
   TYPES
 ======================= */
export type AssetArgs = {
  page: number;
  pageSize: number;
};

function isGlobalAccess(role?: string | null) {
  return role === "OWNER" || role === "ADMIN" || role === "ASSET_STAFF";
}

function buildAssetFilter({
  role,
  departmentId,
}: {
  role?: string | null;
  departmentId?: string | null;
}) {
  if (isGlobalAccess(role)) {
    return {}; // 👑 lihat semua
  }

  if (!departmentId) {
    throw new Error("User has no department");
  }

  return {
    departmentId,
  };
}
/* =======================
   GET ALL ASSETS
 ======================= */
export async function getAllAssets({ page, pageSize }: AssetArgs) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const { role } = await auth.api.getActiveMemberRole({
    headers: await headers(),
  });

  const where = buildAssetFilter({
    role,
    departmentId: session.user.departmentId,
  });
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const [data, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        item: {
          select: {
            name: true,
            code: true,
            assetType: true,
          },
        },
      },
    }),
    prisma.asset.count({
      where,
    }),
  ]);

  return {
    data,
    total,
    pageCount: Math.ceil(total / safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}

/* =======================
   GET ITEMS FOR SELECT
 ======================= */
export async function getItemsForSelect() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  return prisma.item.findMany({
    select: { id: true, name: true, code: true, assetType: true },
    orderBy: { name: "asc" },
  });
}

/* =======================
   GET LOCATIONS FOR SELECT
 ======================= */
export async function getLocationsForSelect() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  return prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

/* =======================
   GET DEPARTMENTS FOR ASSET SELECT
 ======================= */
export async function getDepartmentsForAssetSelect() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) return [];

  return prisma.department.findMany({
    where: { organization_id: activeOrgId, deleted_at: null },
    select: {
      id_department: true,
      nama_department: true,
      kode_department: true,
    },
    orderBy: { nama_department: "asc" },
  });
}

/* =======================
   CREATE ASSET
 ======================= */
export async function createAsset(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const departmentId = session.user.departmentId;
  if (!departmentId) throw new Error("User has no department");
  const itemId = formData.get("itemId")?.toString();
  if (!itemId) throw new Error("Item is required");

  const parseDateOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? new Date(val) : null;
  };

  const parseFloatOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? parseFloat(val) : null;
  };

  const asset = await prisma.$transaction(async (tx) => {
    const newAsset = await tx.asset.create({
      data: {
        itemId,
        serialNumber: formData.get("serialNumber")?.toString() || null,
        purchaseDate: parseDateOrNull("purchaseDate"),
        purchasePrice: parseFloatOrNull("purchasePrice"),
        condition: formData.get("condition")?.toString() || null,
        warrantyExpire: parseDateOrNull("warrantyExpire"),
        locationId: formData.get("locationId")?.toString() || null,
        departmentId: departmentId,
        notes: formData.get("notes")?.toString() || null,
        barcode: formData.get("barcode")?.toString() || null,
        brand: formData.get("brand")?.toString() || null,
        model: formData.get("model")?.toString() || null,
        vendorName: formData.get("vendorName")?.toString() || null,
        garansi_exp: parseDateOrNull("garansi_exp"),
      },
    });

    // Sync to Stock table if location is provided
    const locationId = formData.get("locationId")?.toString();
    if (locationId) {
      await tx.stock.upsert({
        where: {
          itemId_locationId: {
            itemId,
            locationId,
          },
        },
        create: {
          itemId,
          locationId,
          quantity: 1,
        },
        update: {
          quantity: { increment: 1 },
        },
      });
    }

    // Record History
    await recordAssetHistory({
      assetId: newAsset.id,
      userId: session.user.id,
      action: "CREATE",
      newValue: JSON.stringify(newAsset),
      tx,
    });

    return newAsset;
  });
  revalidatePath("/assets");
  return asset;
}

/* =======================
   UPDATE ASSET
 ======================= */
export async function updateAsset(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const asset = await prisma.asset.findFirst({ where: { id } });
  if (!asset) throw new Error("Asset not found");
  const departmentId = session.user.departmentId;
  if (!departmentId) throw new Error("User has no department");
  const parseDateOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? new Date(val) : null;
  };

  const parseFloatOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? parseFloat(val) : null;
  };

  const updated = await prisma.$transaction(async (tx) => {
    const newLocationId = formData.get("locationId")?.toString();
    const oldLocationId = asset.locationId;

    const result = await tx.asset.update({
      where: { id },
      data: {
        itemId: formData.get("itemId")?.toString() ?? asset.itemId,
        serialNumber:
          formData.get("serialNumber")?.toString() || asset.serialNumber,
        purchaseDate: parseDateOrNull("purchaseDate") ?? asset.purchaseDate,
        purchasePrice: parseFloatOrNull("purchasePrice") ?? asset.purchasePrice,
        condition: formData.get("condition")?.toString() || asset.condition,
        warrantyExpire:
          parseDateOrNull("warrantyExpire") ?? asset.warrantyExpire,
        locationId: newLocationId || asset.locationId,
        departmentId: departmentId,
        notes: formData.get("notes")?.toString() || asset.notes,
        barcode: formData.get("barcode")?.toString() || asset.barcode,
        brand: formData.get("brand")?.toString() || asset.brand,
        model: formData.get("model")?.toString() || asset.model,
        vendorName: formData.get("vendorName")?.toString() || asset.vendorName,
        garansi_exp: parseDateOrNull("garansi_exp") ?? asset.garansi_exp,
        updatedAt: new Date(),
      },
    });

    // Handle Stock sync if location changed
    if (newLocationId && newLocationId !== oldLocationId) {
      // 1. Decrement old location
      if (oldLocationId) {
        await tx.stock.updateMany({
          where: {
            itemId: asset.itemId,
            locationId: oldLocationId,
          },
          data: { quantity: { decrement: 1 } },
        });
      }

      // 2. Increment new location
      await tx.stock.upsert({
        where: {
          itemId_locationId: {
            itemId: asset.itemId,
            locationId: newLocationId,
          },
        },
        create: {
          itemId: asset.itemId,
          locationId: newLocationId,
          quantity: 1,
        },
        update: {
          quantity: { increment: 1 },
        },
      });
    }

    // Record History (Check for location change specifically)
    if (newLocationId && newLocationId !== oldLocationId) {
      await recordAssetHistory({
        assetId: id,
        userId: session.user.id,
        action: "TRANSFER",
        field: "locationId",
        oldValue: oldLocationId || "N/A",
        newValue: newLocationId,
        tx,
      });
    }

    await recordAssetHistory({
      assetId: id,
      userId: session.user.id,
      action: "UPDATE",
      newValue: "Asset updated",
      tx,
    });

    return result;
  });
  revalidatePath("/assets");
  return updated;
}

/* =======================
   GET ASSETS BY MANY IDS
 ======================= */
export async function getAssetsByManyIds(ids: string[]) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const assets = await prisma.asset.findMany({
    where: {
      id: { in: ids },
    },
    include: {
      item: {
        select: {
          name: true,
          code: true,
        },
      },
    },
  });
  return assets;
}

/* =======================
   DELETE ASSET
 ======================= */
export async function deleteAsset(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const asset = await prisma.$transaction(async (tx) => {
    const deleted = await tx.asset.delete({ where: { id } });

    // Sync to Stock
    if (deleted.locationId) {
      await tx.stock.updateMany({
        where: {
          itemId: deleted.itemId,
          locationId: deleted.locationId,
        },
        data: { quantity: { decrement: 1 } },
      });
    }

    // Record History (Note: the asset is about to be deleted, so we record it before or use a non-cascade approach)
    // But since we are in a transaction and deletion is happening, we can still record history if it doesn't violate FK
    // However, the history table HAS onDelete: Cascade, so it will be deleted too!
    // If the user wants to KEEP history even after asset is deleted, we should change schema.
    // For now, let's keep it consistent with Cascade.

    await recordAssetHistory({
      assetId: deleted.id,
      userId: session.user.id,
      action: "DELETE",
      oldValue: JSON.stringify(deleted),
      tx,
    });

    return deleted;
  });
  revalidatePath("/assets");
  return asset;
}
