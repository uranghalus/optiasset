"use client";
import { useAssets } from "@/hooks/crud/use-assets";
import React, { useState } from "react";
import { format } from "date-fns";
import { assetColumns } from "./asset-column";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/datatable/datatable-toolbar";
import { DataTable } from "@/components/datatable/data-table";
import { DataTablePagination } from "@/components/datatable/datatable-pagination";
import { useDialog } from "@/context/dialog-provider";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Plus, Printer, ScanLine } from "lucide-react";

export default function AssetTable() {
  const { setOpen } = useDialog();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
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

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkPrint = () => {
    const ids = selectedRows.map((row: any) => row.original.id);
    if (ids.length === 0) return;
    window.open(`/assets/print?ids=${ids.join(",")}`, "_blank");
  };

  const handleExportExcel = () => {
    const rows = data?.data ?? [];
    if (rows.length === 0) return;

    const header = [
      "Barcode",
      "Item",
      "Brand / Model",
      "Part Number",
      "Kondisi",
      "Tgl. Beli",
      "Lokasi",
      "Departemen",
      "Status",
    ];

    const body = rows.map((asset) => {
      const purchaseDate = asset.purchaseDate
        ? format(new Date(asset.purchaseDate), "dd MMM yyyy")
        : "-";
      return [
        asset.barcode || "-",
        asset.item?.name || "-",
        [asset.brand, asset.model].filter(Boolean).join(" ") || "-",
        asset.partNumber || "-",
        asset.condition || "-",
        purchaseDate,
        asset.location?.name || "-",
        asset.department?.nama_department || "-",
        asset.status || "-",
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join("\t");
    });

    const blob = new Blob([`${header.join("\t")}\n${body.join("\n")}`], {
      type: "application/vnd.ms-excel",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `aset-${new Date().toISOString().slice(0, 10)}.xls`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 rounded-md border space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="barcode"
        searchPlaceholder="Cari by Barcode / Tag..."
      >
        <div className="flex gap-2">
          {selectedRows.length > 0 && (
            <Button
              variant="outline"
              onClick={handleBulkPrint}
              className="gap-2 border-primary text-primary"
            >
              <Printer className="size-4" />
              Cetak {selectedRows.length} Label
            </Button>
          )}
          <Button variant="outline" onClick={handleExportExcel} className="gap-2">
            <FileSpreadsheet className="size-4" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => setOpen("print")} className="gap-2">
            <Printer className="size-4" />
            Cetak PDF
          </Button>
          <Button onClick={() => setOpen("add")} className="gap-2">
            <Plus className="size-4" />
            Tambah Aset
          </Button>
          <Button onClick={() => setOpen("scan")} className="gap-2">
            <ScanLine className="size-4" />
          </Button>
        </div>
      </DataTableToolbar>

      <DataTable table={table} loading={isLoading} />

      <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} />
    </div>
  );
}
