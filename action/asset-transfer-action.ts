"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/logger";

/* =======================
   TYPES
   ======================= */
export type TransferArgs = {
  page: number;
  pageSize: number;
  assetId?: string;
};

/* =======================
   GET ALL TRANSFERS
   ======================= */
export async function getAllTransfers({
  page,
  pageSize,
  assetId,
}: TransferArgs) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const where = assetId ? { assetId } : {};

  const [data, total] = await Promise.all([
    prisma.assetTransfer.findMany({
      where,
      skip,
      take,
      orderBy: { transferDate: "desc" },
      include: {
        asset: {
          select: {
            barcode: true,
            serialNumber: true,
            item: { select: { name: true, code: true } },
          },
        },
        fromLocation: { select: { name: true } },
        toLocation: { select: { name: true } },
      },
    }),
    prisma.assetTransfer.count({ where }),
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
   TRANSFER ASSET
   ======================= */
export async function transferAssetAction(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const assetId = formData.get("assetId")?.toString();
  const toLocationId = formData.get("toLocationId")?.toString();
  const toDeptId = formData.get("toDeptId")?.toString();
  const toDivId = formData.get("toDivId")?.toString();
  const reason = formData.get("reason")?.toString() || null;

  if (!assetId) throw new Error("Asset ID is required");

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
  });

  if (!asset) throw new Error("Asset not found");

  const oldLocationId = asset.locationId;
  const oldDeptId = asset.departmentId;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Asset
    const updatedAsset = await tx.asset.update({
      where: { id: assetId },
      data: {
        locationId: toLocationId || asset.locationId,
        departmentId: toDeptId || asset.departmentId,
        updatedAt: new Date(),
      },
    });

    // 2. Create Transfer Record
    const transfer = await tx.assetTransfer.create({
      data: {
        assetId,
        fromLocationId: oldLocationId,
        toLocationId: toLocationId || oldLocationId,
        fromDeptId: oldDeptId,
        toDeptId: toDeptId || oldDeptId,
        fromDivId: null, // We'll skip div for now if not needed, or add if present
        toDivId: toDivId,
        reason,
        transferBy: session.user.name,
      },
    });

    // 3. Sync Stock if location changed
    if (toLocationId && toLocationId !== oldLocationId) {
      if (oldLocationId) {
        await tx.stock.updateMany({
          where: {
            itemId: asset.itemId,
            locationId: oldLocationId,
          },
          data: { quantity: { decrement: 1 } },
        });
      }

      await tx.stock.upsert({
        where: {
          itemId_locationId: {
            itemId: asset.itemId,
            locationId: toLocationId,
          },
        },
        create: {
          itemId: asset.itemId,
          locationId: toLocationId,
          quantity: 1,
        },
        update: {
          quantity: { increment: 1 },
        },
      });
    }

    // 4. Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      action: "TRANSFER",
      entityType: "ASSET",
      entityId: assetId,
      entityInfo: `${updatedAsset.barcode || "N/A"} - ${updatedAsset.serialNumber || "N/A"}`,
      details: {
        fromLocationId: oldLocationId,
        toLocationId,
        fromDeptId: oldDeptId,
        toDeptId,
        reason,
      },
      tx,
    });

    return transfer;
  });

  revalidatePath("/assets");
  revalidatePath("/asset-transfers");
  return result;
}
