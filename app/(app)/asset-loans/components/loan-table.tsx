/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useAssetLoans } from "@/hooks/crud/use-asset-loans";
import { loanColumns } from "./loan-column";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoanTable() {
  const [status, setStatus] = useState<string>("PENDING");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useAssetLoans({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    status: status === "ALL" ? undefined : (status as any),
  });

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: loanColumns as any,
    columnResizeMode: "onEnd",
    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
  });

  return (
    <div className="p-3 rounded-md border space-y-4 bg-background shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <Tabs value={status} onValueChange={setStatus} className="w-auto">
          <TabsList>
            <TabsTrigger value="PENDING">Menunggu</TabsTrigger>
            <TabsTrigger value="BORROWED">Aktif</TabsTrigger>
            <TabsTrigger value="RETURNED">Kembali</TabsTrigger>
            <TabsTrigger value="REJECTED">Ditolak</TabsTrigger>
            <TabsTrigger value="ALL">Semua</TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTableToolbar
          table={table}
          searchKey="asset"
          searchPlaceholder="Cari aset..."
        />
      </div>

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
