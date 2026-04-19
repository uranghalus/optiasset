"use client";
import { useAssets } from "@/hooks/crud/use-assets";
import { useState } from "react";
import { assetColumns } from "./asset-column";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";
import { useDialog } from "@/context/dialog-provider";
import { Button } from "@/components/ui/button";
import { FileDown, MoreHorizontalIcon, Plus, Printer, ScanLine } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePermission } from "@/hooks/use-permission";

export default function AssetTable() {
  const { setOpen } = useDialog();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { can, permissionMap } = usePermission();
  console.log("permission map", permissionMap);

  const { data, isLoading } = useAssets({
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });
  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: assetColumns,
    columnResizeMode: "onEnd",
    pageCount: data?.pageCount ?? 0,
    pagination,
    onPaginationChange: setPagination,
  });



  return (
    <div className="p-3 rounded-md border space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="barcode"
        searchPlaceholder="Cari by Barcode / Tag..."
      >
        <div className="flex gap-2">

          {can('asset', ['create']) && (
            <Button onClick={() => setOpen("add")} className="gap-2">
              <Plus className="size-4" />
              Tambah Aset
            </Button>
          )}
          <ButtonGroup>
            <Button onClick={() => setOpen("scan")} className="gap-2"
              variant={'outline'}>
              Scan QR <ScanLine className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More Options">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setOpen('print-pdf')}>
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
          </ButtonGroup>
        </div>
      </DataTableToolbar>

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
