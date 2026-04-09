"use client";

import React, { useState } from "react";
import { useAssetTransfers } from "@/hooks/crud/use-asset-transfers";
import { transferColumns } from "./transfer-column";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";

export default function TransferTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useAssetTransfers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  });

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: transferColumns,
    columnResizeMode: "onEnd",
    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
  });

  return (
    <div className="p-3 rounded-md border space-y-4 bg-background shadow-sm">
      <DataTableToolbar
        table={table}
        searchKey="reason"
        searchPlaceholder="Cari alasan mutasi..."
      />

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
