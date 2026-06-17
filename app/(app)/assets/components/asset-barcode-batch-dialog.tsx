/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useDialog } from "@/context/dialog-provider";
import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SpinnerEmpty } from "@/components/loader";
import {
  useAssetBatchInfo,
  useCategoriesForFilter,
} from "@/hooks/crud/use-assets";
import { exportBarcodeBatchToPDF } from "@/action/asset-action";

// Sesuaikan path import ini dengan lokasi hook & action Anda

export function BarcodeBatchPrintDialog() {
  const { open, setOpen } = useDialog();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loadingBatchIndex, setLoadingBatchIndex] = useState<number | null>(
    null,
  );

  // ✅ Reset state saat dialog dibuka ulang
  useEffect(() => {
    if (open === "print-barcode-batch") {
      setSelectedCategory("all");
      setLoadingBatchIndex(null);
    }
  }, [open]);

  // Fetch data kategori & info batch via React Query
  const { data: categoriesRes, isLoading: isLoadingCategories } =
    useCategoriesForFilter();
  const { data: batchInfoRes, isLoading: isLoadingInfo } = useAssetBatchInfo({
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
    batchSize: 120, // Konstan 120 item per batch
  });

  const categories = categoriesRes?.data || [];
  const batchInfo = batchInfoRes?.success ? batchInfoRes : null;
  const totalAssets = batchInfo?.totalAssets ?? 0;
  const totalBatches = batchInfo?.totalBatches ?? 0;
  const handleDownloadBatch = async (batchIndex: number) => {
    try {
      setLoadingBatchIndex(batchIndex);

      const categoryId =
        selectedCategory === "all" ? undefined : selectedCategory;
      const res = await exportBarcodeBatchToPDF(batchIndex, 120, categoryId);

      if (res.success && res.data) {
        // ✅ base64 → blob untuk menghindari memory limit pada browser
        const binary = atob(res.data);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });

        const url = URL.createObjectURL(blob);

        // Cari nama kategori untuk penamaan file
        const categoryName =
          categories.find((c: any) => c.id === selectedCategory)?.name ||
          "Semua";
        const safeCategoryName = categoryName.replace(/\s+/g, "_");

        // Langsung download karena ini batch rendering
        const a = document.createElement("a");
        a.href = url;
        a.download = `Barcode_${safeCategoryName}_Batch_${batchIndex + 1}.pdf`;
        a.click();

        // Cleanup URL Object setelah klik
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        console.error("Gagal mengekspor batch:", res.error);
        alert("Gagal mengunduh batch. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLoadingBatchIndex(null);
    }
  };

  return (
    <Dialog
      open={open === "print-barcode-batch"}
      onOpenChange={(isOpen) => !isOpen && setOpen(null)}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Cetak Barcode Massal (Batch)</DialogTitle>
          <DialogDescription>
            Aset dibagi menjadi maksimal 120 data per batch agar sistem tetap
            stabil.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* FILTER KATEGORI */}
          <div className="space-y-2">
            <Label>Filter berdasarkan Kategori</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={isLoadingCategories}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* LOADING STATE */}
          {(isLoadingCategories || isLoadingInfo) && (
            <div className="flex justify-center py-6">
              <SpinnerEmpty />
            </div>
          )}

          {/* TAMPILAN GRID BATCH */}
          {!isLoadingInfo && batchInfo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">
                  Total: {totalAssets} Aset
                </Label>
                <Label className="text-muted-foreground">
                  {totalBatches} Batch Tersedia
                </Label>
              </div>

              {totalAssets > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[40vh] overflow-y-auto p-1">
                  {Array.from({ length: totalBatches }).map((_, index) => {
                    const startItem = index * 120 + 1;
                    // ✅ Update variabel di dalam Math.min
                    const endItem = Math.min((index + 1) * 120, totalAssets);
                    const isDownloading = loadingBatchIndex === index;

                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto flex-col items-center justify-center py-3 px-2 gap-1"
                        onClick={() => handleDownloadBatch(index)}
                        disabled={loadingBatchIndex !== null}
                      >
                        {isDownloading ? (
                          <div className="flex items-center gap-2">
                            <SpinnerEmpty />
                            <span>Proses...</span>
                          </div>
                        ) : (
                          <>
                            <span className="font-semibold">
                              Unduh Batch {index + 1}
                            </span>
                            {/* Menggunakan label dari database, fallback ke angka jika loading/error */}
                            <span className="text-[10px] sm:text-xs whitespace-normal break-words font-normal text-muted-foreground text-center px-1">
                              {batchInfo.batchLabels && batchInfo.batchLabels[index]
                                ? batchInfo.batchLabels[index]
                                : `(${startItem} - ${endItem})`}
                            </span>
                          </>
                        )}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground bg-muted/50 rounded-md">
                  Tidak ada aset yang ditemukan untuk kategori ini.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(null)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
