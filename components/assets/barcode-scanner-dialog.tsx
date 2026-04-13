"use client";

import { useDialog } from "@/context/dialog-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { useAssetLookup } from "@/hooks/crud/use-assets";

const BarcodeScanner = dynamic(
  () => import("./barcode-scanner").then((m) => m.BarcodeScanner),
  { ssr: false },
);

export function BarcodeScannerDialog() {
  const { open, setOpen } = useDialog();
  const router = useRouter();
  const { mutateAsync } = useAssetLookup();

  const [processing, setProcessing] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScanSuccess = async (decodedText: string) => {
    if (scanned) return;

    setScanned(true);
    setProcessing(true);

    try {
      let id: string | null = null;

      try {
        const url = new URL(decodedText);
        if (url.pathname.startsWith("/assets/view/")) {
          id = url.pathname.split("/").pop()!;
        }
      } catch {
        id = decodedText.trim();
      }

      if (!id) throw new Error("Format barcode tidak valid");

      toast.loading("Memvalidasi asset...");

      await mutateAsync(id);

      toast.success("Asset ditemukan");

      setOpen(null);
      router.push(`/assets/view/${id}`);
    } catch (err: any) {
      toast.error(err.message || "Asset tidak ditemukan");
      setScanned(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog
      open={open === "scan"}
      onOpenChange={(val) => {
        if (!val) {
          setOpen(null);
          setScanned(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR / Barcode</DialogTitle>
          <DialogDescription>Arahkan kamera ke label aset</DialogDescription>
        </DialogHeader>

        <div className="relative">
          {open === "scan" && (
            <BarcodeScanner
              key={open} // 🔥 penting untuk reset
              onScanSuccess={handleScanSuccess}
            />
          )}

          {processing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <p className="text-sm">Memproses...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
