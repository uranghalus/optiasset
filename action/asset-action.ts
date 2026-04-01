"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* =======================
   TYPES
 ======================= */
export type AssetArgs = {
  page: number;
  pageSize: number;
};

/* =======================
   GET ALL ASSETS
 ======================= */
export async function getAllAssets({ page, pageSize }: AssetArgs) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const [data, total] = await Promise.all([
    prisma.asset.findMany({
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
    prisma.asset.count(),
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

  const asset = await prisma.asset.create({
    data: {
      itemId,
      serialNumber: formData.get("serialNumber")?.toString() || null,
      purchaseDate: parseDateOrNull("purchaseDate"),
      purchasePrice: parseFloatOrNull("purchasePrice"),
      condition: formData.get("condition")?.toString() || null,
      warrantyExpire: parseDateOrNull("warrantyExpire"),
      locationId: formData.get("locationId")?.toString() || null,
      departmentId: formData.get("departmentId")?.toString() || null,
      notes: formData.get("notes")?.toString() || null,
      barcode: formData.get("barcode")?.toString() || null,
      brand: formData.get("brand")?.toString() || null,
      model: formData.get("model")?.toString() || null,
      vendorName: formData.get("vendorName")?.toString() || null,
      garansi_exp: parseDateOrNull("garansi_exp"),
    },
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

  const parseDateOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? new Date(val) : null;
  };

  const parseFloatOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? parseFloat(val) : null;
  };

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      itemId: formData.get("itemId")?.toString() ?? asset.itemId,
      serialNumber:
        formData.get("serialNumber")?.toString() || asset.serialNumber,
      purchaseDate: parseDateOrNull("purchaseDate") ?? asset.purchaseDate,
      purchasePrice: parseFloatOrNull("purchasePrice") ?? asset.purchasePrice,
      condition: formData.get("condition")?.toString() || asset.condition,
      warrantyExpire: parseDateOrNull("warrantyExpire") ?? asset.warrantyExpire,
      locationId: formData.get("locationId")?.toString() || asset.locationId,
      departmentId:
        formData.get("departmentId")?.toString() || asset.departmentId,
      notes: formData.get("notes")?.toString() || asset.notes,
      barcode: formData.get("barcode")?.toString() || asset.barcode,
      brand: formData.get("brand")?.toString() || asset.brand,
      model: formData.get("model")?.toString() || asset.model,
      vendorName: formData.get("vendorName")?.toString() || asset.vendorName,
      garansi_exp: parseDateOrNull("garansi_exp") ?? asset.garansi_exp,
      updatedAt: new Date(),
    },
  });
  revalidatePath("/assets");
  return updated;
}

/* =======================
   DELETE ASSET
 ======================= */
export async function deleteAsset(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const asset = await prisma.asset.delete({ where: { id } });
  revalidatePath("/assets");
  return asset;
}
