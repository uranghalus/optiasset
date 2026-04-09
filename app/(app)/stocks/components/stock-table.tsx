"use client";

import React, { useState } from "react";
import { useStocks } from "@/hooks/crud/use-stocks";
import { stockColumns } from "./stock-column";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";

export default function StockTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useStocks({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  });

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: stockColumns,
    columnResizeMode: "onEnd",
    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
  });

  return (
    <div className="p-3 rounded-md border space-y-4 bg-background shadow-sm">
      <DataTableToolbar
        table={table}
        searchKey="item_name"
        searchPlaceholder="Cari stok barang..."
      />

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
