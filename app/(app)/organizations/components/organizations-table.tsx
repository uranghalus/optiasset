"use client";
import { useOrganizations } from "@/hooks/crud/use-organizations";
import React, { useState } from "react";
import { organizationColumns } from "./organizations-column";
import { useDataTable } from "@/hooks/use-data-table";
import { Organization } from "@/generated/prisma/client";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";
import { useDialog } from "@/context/dialog-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function OrganizationsTable() {
  const { setOpen } = useDialog();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = useOrganizations({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  });
  const { table } = useDataTable({
    data: (data?.data ?? []) as Organization[],
    columns: organizationColumns,
    columnResizeMode: "onEnd",

    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
  });
  return (
    <div className="p-3 rounded-md border space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="name"
        searchPlaceholder="Search organization..."
      >
        <div className="flex gap-2">
          <Button onClick={() => setOpen("add")} className="gap-2">
            <Plus className="size-4" />
            Add Organization
          </Button>
        </div>
      </DataTableToolbar>

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
