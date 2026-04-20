/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAssets } from "@/hooks/crud/use-assets";
import { useActiveMemberRole } from "@/hooks/use-active-member";


import { useState, useMemo } from "react";
import {
  baseAssetColumns,
  departmentColumn,
} from "./asset-column";

import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";

import { useDialog } from "@/context/dialog-provider";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  MoreHorizontalIcon,
  Plus,
  Printer,
  ScanLine,
} from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePermission } from "@/hooks/use-permission";
import { useDepartmentsForSelect } from "@/hooks/crud/use-divisi";

export default function AssetTable() {
  const { setOpen } = useDialog();
  const { can } = usePermission();

  const { data: role } = useActiveMemberRole();
  const { data: departments = [] } = useDepartmentsForSelect();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [columnFilters, setColumnFilters] = useState<any[]>([]);

  /* =======================
     AMBIL FILTER VALUE
  ======================= */
  const selectedDept = columnFilters.find(
    (f) => f.id === "departmentId"
  )?.value;

  const { data, isLoading } = useAssets({
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,

  });

  /* =======================
     COLUMN (ROLE BASED)
  ======================= */
  const columns = useMemo(() => {
    const cols = [...baseAssetColumns];

    if (role === "owner" || role === "staff_asset" as any) {
      const actionIndex = cols.findIndex((c) => c.id === "actions");

      if (actionIndex !== -1) {
        cols.splice(actionIndex, 0, departmentColumn);
      } else {
        cols.push(departmentColumn);
      }
    }

    return cols;
  }, [role]);

  /* =======================
     FILTER CONFIG
  ======================= */
  const filters = useMemo(() => {
    if (role !== "owner" && role !== "staff_asset" as any) return [];

    return [
      {
        columnId: "departmentId",
        title: "Department",
        options: departments.map((dept) => ({
          label: dept.nama_department,
          value: dept.id_department,
        })),
      },
    ];
  }, [role, departments]);

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: columns as any,
    columnResizeMode: "onEnd",
    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
  });

  return (
    <div className="p-3 rounded-md border space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="kode_asset"
        searchPlaceholder="Cari by Kode Asset / Tag..."
        filters={filters} // ✅ filter muncul lagi
      >
        <div className="flex gap-2">
          {can("asset", ["create"]) && (
            <Button onClick={() => setOpen("add")} className="gap-2">
              <Plus className="size-4" />
              Tambah Aset
            </Button>
          )}

          <ButtonGroup>
            {can("asset", ["scan-code"]) && (
              <Button
                onClick={() => setOpen("scan")}
                className="gap-2"
                variant="outline"
              >
                Scan QR <ScanLine className="size-4" />
              </Button>
            )}

            {can("asset", ["export"]) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Export Data</DropdownMenuLabel>

                    <DropdownMenuItem onClick={() => setOpen("print-pdf")}>
                      <Printer />
                      Cetak PDF
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <FileDown />
                      Export Excel
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </ButtonGroup>
        </div>
      </DataTableToolbar>

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination
        table={table}
        pageCount={data?.pageCount ?? 0}
      />
    </div>
  );
}