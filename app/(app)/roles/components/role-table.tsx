"use client";
import React, { useState } from "react";
import { useDataTable } from "@/hooks/use-data-table";
import { Category, organizationRole } from "@/generated/prisma/client";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";
import { useDialog } from "@/context/dialog-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { roleColumns } from "./role-column";
import { useOrganizationRoles } from "@/hooks/crud/use-organization-roles";

export default function RoleTable() {
  const { setOpen } = useDialog();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = useOrganizationRoles({
    pagination: {
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
    },
  });
  const { table } = useDataTable({
    data: (data?.data ?? []) as unknown as organizationRole[],
    columns: roleColumns,
    columnResizeMode: "onEnd",

    pageCount: data?.pagination.totalPages ?? 0,
    pagination,
    onPaginationChange: setPagination,
  });
  return (
    <div className="p-3 rounded-md border space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="role"
        searchPlaceholder="Search role..."
      >
        <div className="flex gap-2">
          <Button onClick={() => setOpen("add")} className="gap-2">
            <Plus className="size-4" />
            Add Role
          </Button>
        </div>
      </DataTableToolbar>

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination
        table={table}
        pageCount={data?.pagination.totalPages ?? 0}
      />
    </div>
  );
}
