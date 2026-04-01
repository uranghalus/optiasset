"use client";
import { useDivisi } from "@/hooks/crud/use-divisi";
import React, { useState } from "react";
import { divisiColumns } from "./divisi-column";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";
import { useDialog } from "@/context/dialog-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DivisiTable() {
  const { setOpen } = useDialog();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = useDivisi({
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });
  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: divisiColumns,
    columnResizeMode: "onEnd",
    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
  });
  return (
    <div className="p-3 rounded-md border space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="nama_divisi"
        searchPlaceholder="Search divisi..."
      >
        <div className="flex gap-2">
          <Button onClick={() => setOpen("add")} className="gap-2">
            <Plus className="size-4" />
            Add Divisi
          </Button>
        </div>
      </DataTableToolbar>

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
