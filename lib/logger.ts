import { prisma } from "./prisma";
import { headers } from "next/headers";

/**
 * CENTRALIZED LOGGER UTILITY
 * Digunakan untuk merekam audit log ke dalam database.
 */

export type LogEntity = "ASSET" | "ITEM" | "STOCK" | "AUTH";
export type LogAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "TRANSFER"
  | "ADJUSTMENT";

export type AuditLogData = {
  userId?: string;
  organizationId?: string;
  action: LogAction | string;
  entityType: LogEntity | string;
  entityId?: string;
  entityInfo?: string;
  details?: any;
  tx?: any; // Optional transaction client
};

export async function createAuditLog(data: AuditLogData) {
  const db = data.tx || prisma;

  let ipAddress = "N/A";
  let userAgent = "N/A";

  try {
    const h = await headers();
    ipAddress = h.get("x-forwarded-for") || h.get("x-real-ip") || "N/A";
    userAgent = h.get("user-agent") || "N/A";
  } catch (e) {
    // Headers might not be available in some contexts
    console.warn("Could not capture headers for audit log", e);
  }

  return db.auditLog.create({
    data: {
      userId: data.userId ?? null,
      organizationId: data.organizationId ?? null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId ?? null,
      entityInfo: data.entityInfo ?? null,
      details: data.details ? JSON.stringify(data.details) : null,
      ipAddress,
      userAgent,
    },
  });
}
