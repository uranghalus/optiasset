'use client'

import { BarcodeScanner } from "@/components/assets/barcode-scanner";
import { useAssetLookup } from "@/hooks/crud/use-assets";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AssetScanner() {

    const router = useRouter();
    const { mutateAsync } = useAssetLookup();

    const [processing, setProcessing] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
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
        <BarcodeScanner
            key="scanner"
            onScanSuccess={handleScanSuccess}
        />
    )
}
