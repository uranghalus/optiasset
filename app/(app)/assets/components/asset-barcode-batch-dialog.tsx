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
  useDepartmentsForFilter, // ✅ Asumsi kamu membuat hook ini untuk get list department
} from "@/hooks/crud/use-assets";
import { exportBarcodeBatchToPDF } from "@/action/asset-action";

export function BarcodeBatchPrintDialog() {
  const { open, setOpen } = useDialog();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all"); // ✅ State Department
  const [loadingBatchIndex, setLoadingBatchIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open === "print-barcode-batch") {
      setSelectedCategory("all");
      setSelectedDepartment("all"); // ✅ Reset department
      setLoadingBatchIndex(null);
    }
  }, [open]);

  // ✅ Fetch data kategori & department
  const { data: categoriesRes, isLoading: isLoadingCategories } = useCategoriesForFilter();
  const { data: deptRes, isLoading: isLoadingDept } = useDepartmentsForFilter(); // ✅ Fetch department

  // ✅ Pass filter ke hook getAssetBatchInfo
  const { data: batchInfoRes, isLoading: isLoadingInfo } = useAssetBatchInfo({
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
    departmentId: selectedDepartment === "all" ? undefined : selectedDepartment, // ✅ Pass parameter
    batchSize: 120,
  });

  const categories = categoriesRes?.data || [];
  const departments = deptRes?.data || []; // ✅ Ekstrak data department
  const batchInfo = batchInfoRes?.success ? batchInfoRes : null;
  const totalAssets = batchInfo?.totalAssets ?? 0;
  const totalBatches = batchInfo?.totalBatches ?? 0;

  const handleDownloadBatch = async (batchIndex: number) => {
    try {
      setLoadingBatchIndex(batchIndex);

      const categoryId = selectedCategory === "all" ? undefined : selectedCategory;
      const departmentId = selectedDepartment === "all" ? undefined : selectedDepartment; // ✅ Ekstrak

      // ✅ Update fungsi export PDF agar menerima departmentId juga
      const res = await exportBarcodeBatchToPDF(batchIndex, 120, categoryId, departmentId);

      if (res.success && res.data) {
        const cleanBase64 = res.data.replace(/\s/g, "");
        const binary = atob(cleanBase64);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });

        const url = URL.createObjectURL(blob);

        const categoryName = categories.find((c: any) => c.id === selectedCategory)?.name || "AllCat";
        const deptName = departments.find((d: any) => d.id_department === selectedDepartment)?.nama_department || "AllDept";

        const safeName = `${categoryName}_${deptName}`.replace(/\s+/g, "_");

        const a = document.createElement("a");
        a.href = url;
        // ✅ Nama file otomatis menyesuaikan filter
        a.download = `Barcode_${safeName}_Batch_${batchIndex + 1}.pdf`;
        a.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        alert("Gagal mengunduh batch. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLoadingBatchIndex(null);
    }
  };

  return (
    <Dialog open={open === "print-barcode-batch"} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
      <DialogContent className="sm:max-w-2xl"> {/* ✅ Lebarkan sedikit jika filter ada dua */}
        <DialogHeader>
          <DialogTitle>Cetak Barcode Massal (Batch)</DialogTitle>
          <DialogDescription>
            Aset dibagi menjadi maksimal 120 data per batch agar sistem tetap stabil.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ✅ CONTAINER FILTER GRID (Dibuat sebelahan) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* FILTER KATEGORI */}
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoadingCategories}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ✅ FILTER DEPARTMENT */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={isLoadingDept}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Department</SelectItem>
                  {departments.map((dept: any) => (
                    // Asumsi field ID-nya id_department
                    <SelectItem key={dept.id_department} value={dept.id_department}>
                      {dept.nama_department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* LOADING STATE */}
          {(isLoadingCategories || isLoadingDept || isLoadingInfo) && (
            <div className="flex justify-center py-6">
              <SpinnerEmpty />
            </div>
          )}

          {/* TAMPILAN GRID BATCH */}
          {!(isLoadingCategories || isLoadingDept || isLoadingInfo) && batchInfo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Total: {totalAssets} Aset</Label>
                <Label className="text-muted-foreground">{totalBatches} Batch Tersedia</Label>
              </div>

              {totalAssets > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[40vh] overflow-y-auto p-1">
                  {Array.from({ length: totalBatches }).map((_, index) => {
                    const startItem = index * 120 + 1;
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
                            <span className="font-semibold text-sm">
                              Unduh Batch {index + 1}
                            </span>
                            {/* ✅ Perbaikan wrap teks kode yang panjang kemarin */}
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
                  Tidak ada aset yang ditemukan untuk filter ini.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(null)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}