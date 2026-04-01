"use client";
import { useDepartments } from "@/hooks/crud/use-department";
import React, { useState } from "react";
import { departmentColumns } from "./department-column";
import { useDataTable } from "@/hooks/use-data-table";
import { department } from "@/generated/prisma/client";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";
import { useDialog } from "@/context/dialog-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DepartmentTable() {
  const { setOpen } = useDialog();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = useDepartments({
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });
  const { table } = useDataTable({
    data: (data?.data ?? []) as department[],
    columns: departmentColumns,
    columnResizeMode: "onEnd",

    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
  });
  return (
    <div className="p-3 rounded-md border space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="nama_department"
        searchPlaceholder="Search department..."
      >
        <div className="flex gap-2">
          <Button onClick={() => setOpen("add")} className="gap-2">
            <Plus className="size-4" />
            Add Department
          </Button>
        </div>
      </DataTableToolbar>

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
