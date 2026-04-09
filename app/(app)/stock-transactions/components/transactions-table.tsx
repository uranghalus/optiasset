"use client";

import React, { useState } from "react";
import { useStockTransactions } from "@/hooks/crud/use-stock-transactions";
import { transactionColumns } from "./transactions-column";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";

export default function TransactionsTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useStockTransactions({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  });

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: transactionColumns,
    columnResizeMode: "onEnd",
    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
  });

  return (
    <div className="p-3 rounded-md border space-y-4 bg-background shadow-sm">
      <DataTableToolbar
        table={table}
        searchKey="notes" // We don't have a direct item search yet, let's use notes or just leave it
        searchPlaceholder="Cari transaksi..."
      />

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
