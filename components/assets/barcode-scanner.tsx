"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2, CameraOff } from "lucide-react";

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

// 🔥 GLOBAL INSTANCE (ini kunci utama)
let globalScanner: Html5Qrcode | null = null;

export function BarcodeScanner({
  onScanSuccess,
  onScanError,
}: BarcodeScannerProps) {
  const containerId = "html5-qrcode-scanner";

  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        // 🔥 STOP scanner lama kalau ada
        if (globalScanner) {
          try {
            const state = globalScanner.getState();
            if (state === 2) {
              await globalScanner.stop();
            }
            globalScanner.clear();
          } catch {}
          globalScanner = null;
        }

        // 🔥 bersihkan DOM
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = "";

        const scanner = new Html5Qrcode(containerId);
        globalScanner = scanner;

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras.length) throw new Error("Tidak ada kamera");

        const cameraId =
          cameras.find((c) => c.label.toLowerCase().includes("back"))?.id ||
          cameras[0].id;

        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            // 🔥 jangan di-log terus (biar tidak spam console)
            // ini normal karena scanner terus mencoba membaca
          },
        );

        if (isMounted) setStatus("ready");
      } catch (err: any) {
        if (isMounted) {
          setStatus("error");
          setErrorMsg(err.message);
          onScanError?.(err.message);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;

      if (globalScanner) {
        try {
          const state = globalScanner.getState();

          if (state === 2) {
            globalScanner.stop().catch(() => {});
          }

          globalScanner.clear();
        } catch {}

        globalScanner = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center gap-4">
      <div id={containerId} className="w-full rounded-lg overflow-hidden" />

      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memulai kamera...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CameraOff className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-destructive">Kamera tidak tersedia</p>
          <p className="text-xs text-muted-foreground">{errorMsg}</p>
        </div>
      )}

      {status === "ready" && (
        <p className="text-xs text-muted-foreground text-center">
          Arahkan kamera ke QR Code / Barcode
        </p>
      )}
    </div>
  );
}
