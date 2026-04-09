import { getAllAuditLogs } from "@/action/audit-log-action";
import { PaginationState } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface AuditLogQueryProps extends PaginationState {
  entityType?: string;
  entityId?: string;
  userId?: string;
}

// Get all audit logs
export function useAuditLogs({
  page,
  pageSize,
  entityType,
  entityId,
  userId,
}: AuditLogQueryProps) {
  return useQuery({
    queryKey: ["audit-logs", page, pageSize, entityType, entityId, userId],
    queryFn: () =>
      getAllAuditLogs({ page, pageSize, entityType, entityId, userId }),
  });
}
