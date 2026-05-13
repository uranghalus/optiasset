/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAssets } from "@/hooks/crud/use-assets";
import { useActiveMemberRole } from "@/hooks/use-active-member";
import { useState, useMemo, useEffect } from "react";
import { assetColumn } from "./asset-column";
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
  UploadCloud,
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
import Link from "next/link";
import { AssetBulkAction } from "./asset-bulk-action";
import { useSelectDepartment } from "@/hooks/crud/use-department";
import { useDebounce } from "@/hooks/use-debounce";

export default function AssetTable() {
  const { setOpen } = useDialog();
  const { can } = usePermission();
  const { data: role } = useActiveMemberRole();
  const { data: departments = [] } = useSelectDepartment();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [columnFilters, setColumnFilters] = useState<any[]>([]);

  const searchValue = columnFilters.find((f) => f.id === "kode_asset")
    ?.value as string;
  const selectedDept = columnFilters.find((f) => f.id === "departmentId")
    ?.value as string[] | undefined;
  const selectedCondition = columnFilters.find((f) => f.id === "condition")
    ?.value as string[] | undefined;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useAssets({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    departmentId: selectedDept,
    condition: selectedCondition,
    search: debouncedSearch,
  });

  /* =======================
     FILTER CONFIG
  ======================= */
  const filters = useMemo(() => {
    if (role !== "owner" && role !== ("staff_asset" as any)) return [];

    return [
      {
        columnId: "departmentId",
        title: "Department",
        options: departments.map((dept) => ({
          label: dept.nama_department,
          value: dept.id_department,
        })),
      },
      {
        columnId: "condition",
        title: "Kondisi Aset",
        options: [
          { label: "Bagus", value: "GOOD" },
          { label: "Dalam Perbaikan", value: "REPAIR" },
          { label: "Rusak", value: "BROKEN" },
          { label: "Hilang", value: "LOST" },
        ],
      },
    ];
  }, [role, departments]);

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: assetColumn as any,
    columnResizeMode: "onEnd",
    pageCount: data?.pageCount ?? 0,
    rowCount: data?.total ?? 0,
    manualPagination: true,
    manualFilter: false,
    pagination,
    onPaginationChange: setPagination,
    columnFilters,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
    },
  });

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [columnFilters]);

  return (
    // Tambahkan overflow-hidden pada wrapper utama untuk mencegah horizontal scroll di body
    <div className="p-3 rounded-md border space-y-4 w-full overflow-hidden">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Cari Kode Aset..."
        filters={filters}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
      >
        {/* PERBAIKAN STACK BERSUSUN DI MOBILE */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
          {can("asset", ["create"]) && (
            <Button className="gap-2 w-full sm:w-auto justify-center" asChild>
              <Link href="/assets/create">
                <Plus className="size-4 shrink-0" />
                Tambah Aset
              </Link>
            </Button>
          )}

          {/* ButtonGroup dibuat full width di mobile, tapi tetap proporsional */}
          <ButtonGroup className="flex w-full sm:w-auto">
            {can("asset", ["scan-code"]) && (
              <Button
                onClick={() => setOpen("scan")}
                className="gap-2 flex-1 sm:flex-none justify-center"
                variant="outline"
              >
                <ScanLine className="size-4 shrink-0" />
                Scan QR
              </Button>
            )}

            {can("asset", ["export", "import"]) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 sm:w-10 w-12"
                  >
                    <MoreHorizontalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-40">
                  {can("asset", ["import"]) && (
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Import Data</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setOpen("import")}>
                        <UploadCloud className="h-4 w-4 me-2" />
                        Import Asset
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  )}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setOpen("print-pdf")}>
                      <Printer className="h-4 w-4 me-2" />
                      Cetak PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileDown className="h-4 w-4 me-2" />
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

      {/* Pastikan DataTable di dalamnya dibungkus overflow-x-auto */}
      <DataTable table={table} loading={isLoading} />
      <AssetBulkAction table={table} />
      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
