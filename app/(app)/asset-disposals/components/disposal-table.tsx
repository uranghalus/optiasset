/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useAssetDisposals } from "@/hooks/crud/use-asset-disposals";
import { disposalColumns } from "./disposal-column";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";

export default function DisposalTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [columnFilters, setColumnFilters] = useState<any[]>([]);

  const selectedStatus = columnFilters.find(
    (f) => f.id === "status"
  )?.value as string[] | undefined;

  const { data, isLoading } = useAssetDisposals({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    status: selectedStatus,
  });

  const filters = useMemo(() => {
    return [
      {
        columnId: 'status',
        title: 'Status',
        options: [
          { label: 'Pending SPV', value: 'PENDING_SPV' },
          { label: 'Pending Staff', value: 'PENDING_STAFF' },
          { label: 'Disetujui', value: 'APPROVED' },
          { label: 'Ditolak', value: 'REJECTED' },
        ],
      },
    ];
  }, []);

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: disposalColumns as any,
    columnResizeMode: "onEnd",
    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
    columnFilters,
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <div className="p-3 rounded-md border space-y-4 bg-background shadow-sm">
      <DataTableToolbar
        table={table}
        searchKey="reason"
        searchPlaceholder="Cari alasan penghapusan..."
        filters={filters}
      />

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
