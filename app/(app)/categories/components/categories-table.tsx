"use client";

import { useCategories } from "@/hooks/crud/use-categories";
import { useState, useMemo, useEffect } from "react";
import { categoryColumns } from "./categories-column";
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
import { useDebounce } from "@/hooks/use-debounce";
import { Category } from "@/generated/prisma/client";

export default function CategoriesTable() {
    const { setOpen } = useDialog();
    const { can } = usePermission();

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // State untuk menyimpan filter kolom dari tabel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [columnFilters, setColumnFilters] = useState<any[]>([]);

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    // Fetching data
    const { data, isLoading: loadCategories, isFetching } = useCategories({
        page: pagination.pageIndex + 1, // +1 karena biasanya backend API pagination mulai dari 1
        pageSize: pagination.pageSize,
        search: debouncedSearch,
    });

    const isLoading = loadCategories || isFetching;

    /* =======================
       FILTER CONFIG
    ======================= */
    const filters = useMemo(() => {
        // Kosongkan untuk sementara, tambahkan konfigurasi array jika Kategori butuh filter dropdown khusus
        return [];
    }, []);

    const { table } = useDataTable({
        data: (data?.data ?? []) as Category[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns: categoryColumns as any,
        columnResizeMode: "onEnd",
        pageCount: data?.pageCount ?? 0,
        rowCount: data?.total ?? 0,
        manualPagination: true,
        manualFilter: true,
        pagination,
        onPaginationChange: setPagination,
        columnFilters,
        onColumnFiltersChange: (updater) => {
            setColumnFilters(updater);
        },
    });

    // Reset pagination ketika filter berubah
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [columnFilters]);

    return (
        // Tambahkan overflow-hidden pada wrapper utama untuk mencegah horizontal scroll di body
        <div className="p-3 rounded-md border space-y-4 w-full overflow-hidden">
            <DataTableToolbar
                table={table}
                searchPlaceholder="Cari Kategori..."
                filters={filters}
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
            >
                {/* PERBAIKAN STACK BERSUSUN DI MOBILE */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto">

                    {/* Contoh: Ganti "asset" menjadi "category" sesuai nama permission Anda */}
                    {can("asset.category", ["create"]) && (
                        <Button
                            className="gap-2 w-full sm:w-auto justify-center"
                            onClick={() => setOpen("add-category")}
                        >
                            <Plus className="size-4 shrink-0" />
                            Tambah Kategori
                        </Button>
                    )}

                    {/* ButtonGroup dibuat full width di mobile, tapi tetap proporsional */}
                    <ButtonGroup className="flex w-full sm:w-auto">
                        {can("asset.category", ["export", "import"]) && (
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
                                    {can("asset.category", ["import"]) && (
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel>Import Data</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setOpen("import-category")}>
                                                <UploadCloud className="h-4 w-4 me-2" />
                                                Import Kategori
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    )}

                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                                        {/* Sesuaikan key dialog untuk cetak PDF jika ada */}
                                        <DropdownMenuItem onClick={() => setOpen("print-category-pdf")}>
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

            {/* Jika ada bulk action untuk kategori, bisa ditaruh di sini */}
            {/* <CategoryBulkAction table={table} /> */}

            <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
        </div>
    );
}