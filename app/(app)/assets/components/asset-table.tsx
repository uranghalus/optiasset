/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAssets } from "@/hooks/crud/use-assets";
import { useActiveMemberRole } from "@/hooks/use-active-member";
import { useState, useMemo } from "react"; // Hapus useEffect dan useRef
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

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AssetTable() {
  const { setOpen } = useDialog();
  const { can } = usePermission();
  const { data: role } = useActiveMemberRole();
  const { data: departments = [] } = useSelectDepartment();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId") || undefined;
  const statusParam = searchParams.get("status") || "ACTIVE";

  // Status tabs: ACTIVE, DRAFT
  const statusTabs = [
    { label: "Aktif", value: "ACTIVE" },
    { label: "Draft", value: "DRAFT" },
  ];

  // ==========================================
  // PERUBAHAN BESAR: TANPA useState & useEffect
  // Baca langsung dari URL
  // ==========================================
  const pageParam = searchParams.get("page");
  const pageIndex = pageParam ? Number(pageParam) - 1 : 0;

  // Jadikan ini sebagai objek pagination yang diteruskan ke tabel
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize: 10,
    }),
    [pageIndex],
  );

  // Handler jika tombol Next / Previous di klik pada tabel
  const handlePaginationChange = (updater: any) => {
    // TanStack table mengirimkan function atau value langsung
    const newPagination =
      typeof updater === "function" ? updater(pagination) : updater;

    const params = new URLSearchParams(searchParams.toString());

    if (newPagination.pageIndex > 0) {
      params.set("page", (newPagination.pageIndex + 1).toString());
    } else {
      params.delete("page");
    }

    // Update URL langsung, otomatis komponen akan re-render mengambil pageIndex baru
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [columnFilters, setColumnFilters] = useState<any[]>([]);

  const searchValue = columnFilters.find((f) => f.id === "kode_asset")
    ?.value as string;
  const selectedDept = columnFilters.find((f) => f.id === "departmentId")
    ?.value as string[] | undefined;
  const selectedCondition = columnFilters.find((f) => f.id === "condition")
    ?.value as string[] | undefined;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const {
    data,
    isLoading: assetLoading,
    isFetching,
  } = useAssets({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    departmentId: selectedDept,
    condition: selectedCondition,
    categoryId,
    search: debouncedSearch,
    status: statusParam,
  });
  const isLoading = assetLoading || isFetching;

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
          { label: "Bagus", value: "BAIK" },
          { label: "Dalam Perbaikan", value: "PERBAIKAN" },
          { label: "Rusak", value: "RUSAK" },
          { label: "Hilang", value: "HILANG" },
        ],
      },
      {
        columnId: "assetType",
        title: "Tipe Aset",
        options: [
          { label: "Peralatan", value: "PERALATAN" },
          { label: "Perlengkapan", value: "PERLENGKAPAN" },
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
    manualFilter: true,
    pagination, // Pass nilai yang murni berasal dari URL
    onPaginationChange: handlePaginationChange, // Arahkan ke handler fungsi URL kita
    columnFilters,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      // Jika filter diubah, paksa URL kembali ke halaman 1 dengan menghapus param page
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
  });

  return (
    <div className="p-3 rounded-md border space-y-4 w-full overflow-hidden">
      {/* Status Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {statusTabs.map((tab) => {
          const isActive = statusParam === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("page");
                params.set("status", tab.value);
                router.replace(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <DataTableToolbar
        table={table}
        searchPlaceholder="Cari Kode Aset..."
        filters={filters}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          // Jika melakukan pencarian, paksa URL kembali ke halaman 1
          const params = new URLSearchParams(searchParams.toString());
          params.delete("page");
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
          {can("asset", ["create"]) && (
            <Button className="gap-2 w-full sm:w-auto justify-center" asChild>
              <Link href="/assets/create">
                <Plus className="size-4 shrink-0" />
                Tambah Aset
              </Link>
            </Button>
          )}

          <ButtonGroup className="flex w-full sm:w-auto">
            {can("asset", ["scan-code"]) && (
              <Button
                asChild
                className="gap-2 flex-1 sm:flex-none justify-center"
                variant="outline"
              >
                <Link href="/assets/scan">
                  <ScanLine className="size-4 shrink-0" />
                  Scan Aset
                </Link>
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
                    <DropdownMenuItem
                      onClick={() => setOpen("print-barcode-batch")}
                    >
                      <Printer className="h-4 w-4 me-2" />
                      Cetak Batch Barcode
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

      <DataTable table={table} loading={isLoading} />
      <AssetBulkAction table={table} />
      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
