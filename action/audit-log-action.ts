"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export type AuditLogArgs = {
  page: number;
  pageSize: number;
  entityType?: string;
  entityId?: string;
  userId?: string;
};

/* =======================
   GET ALL AUDIT LOGS
   ======================= */
export async function getAllAuditLogs({
  page,
  pageSize,
  entityType,
  entityId,
  userId,
}: AuditLogArgs) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const where: any = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (userId) where.userId = userId;

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data,
    total,
    pageCount: Math.ceil(total / safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}
