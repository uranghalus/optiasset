/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useItems } from "@/hooks/crud/use-items";
import React, { useMemo, useState } from "react";
import { itemColumns } from "./item-column";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";
import { useDialog } from "@/context/dialog-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useActiveMemberRole } from "@/hooks/use-active-member";

export default function ItemTable() {
  const { setOpen } = useDialog();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const { data: role } = useActiveMemberRole();
  const { data, isLoading } = useItems({
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });
  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: itemColumns,
    columnResizeMode: "onEnd",
    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
    columnFilters,
    onColumnFiltersChange: setColumnFilters,
    manualFilter: false,
  });
  /* =======================
       FILTER CONFIG
    ======================= */
  const filters = useMemo(() => {
    if (role !== "owner" && role !== "staff_asset" as any) return [];

    return [
      {
        columnId: 'assetType',
        title: 'Tipe Aset',
        options: [
          { label: 'Fixed Asset', value: 'FIXED' },
          { label: 'Supply Asset', value: 'SUPPLY' },
        ],
      },
    ];
  }, [role]);
  return (
    <div className="p-3 rounded-md border space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="name"
        searchPlaceholder="Search item..."
        filters={filters}
      >
        <div className="flex gap-2">
          <Button onClick={() => setOpen("add")} className="gap-2">
            <Plus className="size-4" />
            Add Item
          </Button>
        </div>
      </DataTableToolbar>

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
