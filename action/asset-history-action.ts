"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export type AssetHistoryArgs = {
  page: number;
  pageSize: number;
  assetId?: string;
};

/* =======================
   RECORD ASSET HISTORY (Helper)
   ======================= */
export type RecordAssetHistoryData = {
  assetId?: string | null;
  asset_info?: string | null;
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "ASSIGN" | "TRANSFER";
  field?: string;
  oldValue?: string | null;
  newValue?: string | null;
  tx?: any; // Optional transaction client
};

export async function recordAssetHistory(data: RecordAssetHistoryData) {
  const db = data.tx || prisma;

  return db.assetHistory.create({
    data: {
      ...(data.assetId && {
        asset: {
          connect: { id: data.assetId },
        },
      }),
      asset_info: data.asset_info,
      userId: data.userId,
      action: data.action,
      field: data.field,
      oldValue: data.oldValue,
      newValue: data.newValue,
    },
  });
}
/* =======================
   GET ALL ASSET HISTORY
   ======================= */
export async function getAllAssetHistory({
  page,
  pageSize,
  assetId,
}: AssetHistoryArgs) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const where = assetId ? { assetId } : {};

  const [data, total] = await Promise.all([
    prisma.assetHistory.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        asset: {
          include: {
            item: {
              select: { name: true, code: true },
            },
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.assetHistory.count({ where }),
  ]);

  return {
    data,
    total,
    pageCount: Math.ceil(total / safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}
