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
import { useState, useEffect } from "react";
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
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (open === "scan") {
      const timer = setTimeout(() => setShowScanner(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowScanner(false);
      setScanned(false);
    }
  }, [open]);
  const handleScanSuccess = async (decodedText: string) => {
    if (scanned) return;

    setScanned(true);
    setProcessing(true);

    let id: string | null = null;

    try {
      const url = new URL(decodedText);
      if (url.pathname.startsWith("/assets/")) {
        id = url.pathname.split("/").pop()!;
      }
    } catch {
      id = decodedText.trim();
    }

    if (!id) {
      toast.error("Format barcode tidak valid");
      setScanned(false);
      setProcessing(false);
      return;
    }

    // 1. Buat promise chain untuk mutateAsync
    const validationPromise = mutateAsync(id)
      .then((validAssetId) => {
        // validAssetId adalah hasil return dari hook (Full UUID)
        setOpen(null);
        router.push(`/assets/${validAssetId}`);
        return validAssetId;
      })
      .catch((err) => {
        setScanned(false);
        throw err;
      })
      .finally(() => {
        setProcessing(false);
      });

    // 2. Berikan promise tersebut ke toast.promise
    toast.promise(validationPromise, {
      loading: "Memvalidasi asset...",
      success: "Asset ditemukan",
      error: (err: any) => err.message || "Asset tidak ditemukan",
    });
  };

  return (
    <Dialog
      open={open === "scan"}
      onOpenChange={(val) => {
        if (!val) {
          setOpen(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR / Barcode</DialogTitle>
          <DialogDescription>Arahkan kamera ke label aset</DialogDescription>
        </DialogHeader>

        <div className="relative">
          {open === "scan" && showScanner && (
            <BarcodeScanner
              key="scanner"
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