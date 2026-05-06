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

  // ❌ HAPUS const [search, setSearch] = useState("");
  // Karena kita sudah mengandalkan columnFilters dari useDataTable

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [columnFilters, setColumnFilters] = useState<any[]>([]);

  // ✅ Ambil nilai search langsung dari filter Datatable
  // PENTING: Pastikan "kode_asset" benar-benar ada di asset-column.tsx
  const searchValue = columnFilters.find((f) => f.id === "kode_asset")
    ?.value as string;
  const selectedDept = columnFilters.find((f) => f.id === "departmentId")
    ?.value as string[] | undefined;
  const selectedCondition = columnFilters.find((f) => f.id === "condition")
    ?.value as string[] | undefined;

  // 👇 1. Gunakan State Search Lokal & Debounce
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // 👇 2. Kirim debouncedSearch ke API
  const { data, isLoading } = useAssets({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    departmentId: selectedDept,
    condition: selectedCondition,
    search: debouncedSearch, // Kirim teks global ke server
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
      // Pagination otomatis di-reset lewat useEffect di bawah
    },
  });

  // Reset ke halaman 1 (index 0) setiap kali filter / pencarian berubah
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [columnFilters]);

  return (
    <div className="p-3 rounded-md border space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Cari Kode Aset, Merek, Item..."
        filters={filters}
        // 👇 3. Gunakan Props Custom Anda di sini
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value); // Update state pencarian
          setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset ke hal 1
        }}
        // ❌ JANGAN gunakan searchKey="kode_asset" lagi
      >
        <div className="flex gap-2">
          {can("asset", ["create"]) && (
            <Button className="gap-2" asChild>
              <Link href="/assets/create">
                <Plus className="size-4" />
                Tambah Aset
              </Link>
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
            {can("asset", ["import"]) && (
              <Button
                onClick={() => {
                  setOpen("import");
                }}
              >
                <UploadCloud className="h-4 w-4 me-2" />
                Import Asset
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
      <AssetBulkAction table={table} />
      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
