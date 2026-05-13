"use client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, Printer, Info } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { AssetWithItem } from "./asset-column";
import { useExportBarcode } from "@/hooks/crud/use-assets";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/confirm-dialog";
interface Props<TData> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    table: Table<TData>;
}
export default function AssetExportBarcodeDialog<TData>({ open,
    onOpenChange,
    table, }: Props<TData>) {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedAssets = selectedRows.map((row) => row.original as AssetWithItem);

    const { mutateAsync: exportBarcode, isPending } = useExportBarcode();
    const handleExport = async () => {
        if (selectedAssets.length === 0) {
            toast.error("No assets selected.");
            return;
        }

        try {
            await exportBarcode(selectedAssets);
            // Jika berhasil, tutup modal dan reset seleksi tabel (opsional, tergantung preferensi Anda)
            onOpenChange(false);
            table.resetRowSelection();
            toast.success("PDF generated successfully!");
        } catch (error) {
            toast.error("Failed to generate PDF barcodes.");
        }
    };
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleExport}
            isLoading={isPending}
            disabled={selectedAssets.length === 0 || isPending}
            title={
                <span className="text-primary flex items-center">
                    <Printer className="me-2 inline-block" size={18} />
                    Export {selectedAssets.length}{" "}
                    {selectedAssets.length > 1 ? "assets" : "asset"} to PDF
                </span>
            }
            desc={
                <div className="space-y-4 text-left">
                    <p className="mb-2 text-muted-foreground">
                        Sistem akan men-generate dokumen PDF berukuran A4 yang berisi{" "}
                        <strong>{selectedAssets.length} barcode</strong>. Dokumen ini siap untuk dicetak pada kertas stiker.
                    </p>

                    <Alert variant="default" className="bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-900 dark:text-blue-200">
                        <Info className="h-4 w-4 stroke-blue-600 dark:stroke-blue-400" />
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>
                            Pastikan Anda mengatur settingan printer ke <strong>Actual Size (100%)</strong> saat mencetak agar ukuran kotak barcode akurat.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText="Download PDF"
        // Tidak menggunakan destructive karena ini bukan aksi berbahaya
        />
    )
}
