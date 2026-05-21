"use client";

import { useState } from "react";
import { useAssetLookup } from "@/hooks/crud/use-assets";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowRight, Package, X } from "lucide-react";
import Link from "next/link";
import { BarcodeScanner } from "@/components/assets/barcode-scanner";

export default function AssetScanner() {
    const { mutateAsync: lookupAsset, isPending } = useAssetLookup();
    const [scannedAsset, setScannedAsset] = useState<any>(null);

    const handleScanSuccess = async (decodedText: string) => {
        // Jika sedang loading, hiraukan scan yang masuk (mencegah spam request)
        if (isPending) return;

        try {
            let id = decodedText.trim();

            // Opsional: Logika jika barcode berupa URL lengkap
            try {
                const url = new URL(decodedText);
                if (url.pathname.startsWith("/assets/")) {
                    id = url.pathname.split("/").pop()!;
                }
            } catch {
                // Abaikan jika bukan URL
            }

            toast.loading("Mencari data asset...", { id: "scan-toast" });

            const data = await lookupAsset(id);

            // Simpan data ke state agar Card preview muncul di bawah
            setScannedAsset(data);
            toast.success("Asset ditemukan!", { id: "scan-toast" });

        } catch (error: any) {
            toast.error(error.message || "Asset tidak ditemukan", { id: "scan-toast" });
            setScannedAsset(null); // Sembunyikan card jika gagal
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6">

            {/* 1. AREA KAMERA SCANNER */}
            <div className="relative">
                <BarcodeScanner onScanSuccess={handleScanSuccess} />

                {/* Overlay Loading saat sedang mencari ke database */}
                {isPending && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                        <Loader2 className="size-8 text-primary animate-spin mb-2" />
                        <p className="text-white text-sm font-medium">Memvalidasi...</p>
                    </div>
                )}
            </div>

            {/* 2. AREA PREVIEW DATA ASSET */}
            {scannedAsset && (
                <Card className="border-primary/50 shadow-md bg-primary/5 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <CardContent className="p-5 flex flex-col gap-4">

                        {/* Header Preview */}
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3 items-center">
                                <div className="p-2 bg-primary/10 text-primary rounded-md">
                                    <Package className="size-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                                        {scannedAsset.kode_asset || "NO-CODE"}
                                    </p>
                                    <h3 className="font-semibold text-lg leading-tight mt-0.5">
                                        {scannedAsset.item?.name || "Unknown Asset"}
                                    </h3>
                                </div>
                            </div>

                            {/* Tombol Tutup Preview (Batal) */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:bg-background"
                                onClick={() => setScannedAsset(null)}
                            >
                                <X className="size-4" />
                            </Button>
                        </div>

                        {/* Tombol Aksi */}
                        <Button asChild className="w-full gap-2">
                            <Link href={`/assets/${scannedAsset.id}`}>
                                Lihat Detail Lengkap <ArrowRight className="size-4" />
                            </Link>
                        </Button>

                    </CardContent>
                </Card>
            )}

        </div>
    );
}