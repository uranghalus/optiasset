"use client";

import React, { useState } from "react";
import { useMembers } from "@/hooks/crud/use-members";
import { memberColumns } from "./member-column";
import { useDataTable } from "@/hooks/use-data-table";

import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";

import { useDialog } from "@/context/dialog-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { User, department, divisi } from "@/generated/prisma/client";

export type MemberWithRelations = {
  id: string;
  organizationId: string;
  userId: string;
  role: string | null;
  departmentId: string | null;
  divisiId: string | null;
  createdAt: Date;
  user: User;
  department: department | null;
  divisi: divisi | null;
};

export default function MembersTable() {
  const { setOpen } = useDialog();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading } = useMembers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: debouncedSearch,
  });

  const { table } = useDataTable<MemberWithRelations>({
    data: (data?.data as MemberWithRelations[]) ?? [],
    columns: memberColumns,
    columnResizeMode: "onEnd",

    pageCount: data?.pagination.totalPages ?? 0,

    pagination,

    onPaginationChange: setPagination,
  });

  return (
    <div className="p-3 rounded-md border space-y-4 bg-background">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Search member name..."
        onSearchChange={(value) => {
          setSearch(value);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
        searchValue={search}
      >
        <div className="flex gap-2">
          <Button onClick={() => setOpen("add")} className="gap-2">
            <Plus className="size-4" />
            Add Member
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
