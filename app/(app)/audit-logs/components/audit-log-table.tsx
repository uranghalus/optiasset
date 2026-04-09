"use client";

import React, { useState } from "react";
import { useAuditLogs } from "@/hooks/crud/use-audit-logs";
import { auditLogColumns } from "./audit-log-column";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";

export default function AuditLogTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useAuditLogs({
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: auditLogColumns,
    columnResizeMode: "onEnd",
    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
  });

  return (
    <div className="p-3 rounded-md border space-y-4 bg-background">
      <DataTableToolbar
        table={table}
        searchKey="entityInfo"
        searchPlaceholder="Cari log..."
      />

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
