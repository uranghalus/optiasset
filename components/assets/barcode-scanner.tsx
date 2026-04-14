"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2, CameraOff } from "lucide-react";

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

let globalScanner: Html5Qrcode | null = null;

export function BarcodeScanner({
  onScanSuccess,
  onScanError,
}: BarcodeScannerProps) {
  const containerId = "html5-qrcode-scanner";

  const [status, setStatus] = useState<
    "checking" | "requesting" | "loading" | "ready" | "denied" | "error"
  >("checking");

  const [errorMsg, setErrorMsg] = useState("");

  // 🔥 cek permission kamera
  const checkPermission = async () => {
    try {
      // Browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser tidak mendukung kamera");
      }

      // cek permission via Permissions API (optional)
      if (navigator.permissions) {
        const perm = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });

        if (perm.state === "denied") {
          setStatus("denied");
          return false;
        }
      }

      return true;
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message);
      return false;
    }
  };

  const startScanner = async () => {
    try {
      setStatus("requesting");

      // 🔥 trigger permission popup
      await navigator.mediaDevices.getUserMedia({ video: true });

      setStatus("loading");

      // 🔥 stop scanner lama
      if (globalScanner) {
        try {
          const state = globalScanner.getState();
          if (state === 2) await globalScanner.stop();
          globalScanner.clear();
        } catch { }
        globalScanner = null;
      }

      // bersihkan DOM
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
        () => { }
      );

      setStatus("ready");
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setStatus("denied");
      } else {
        setStatus("error");
        setErrorMsg(err.message);
      }
      onScanError?.(err.message);
    }
  };

  useEffect(() => {
    checkPermission().then((ok) => {
      if (ok) startScanner();
    });

    return () => {
      if (globalScanner) {
        try {
          const state = globalScanner.getState();
          if (state === 2) globalScanner.stop().catch(() => { });
          globalScanner.clear();
        } catch { }
        globalScanner = null;
      }
    };
  }, []);

  // 🔥 UI
  return (
    <div className="relative w-full flex flex-col items-center gap-4">
      <div
        id={containerId}
        className="w-full rounded-lg overflow-hidden"
      />

      {/* CHECKING */}
      {status === "checking" && (
        <p className="text-sm text-muted-foreground">
          Mengecek izin kamera...
        </p>
      )}

      {/* REQUESTING */}
      {status === "requesting" && (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin" />
          <p className="text-sm">Meminta izin kamera...</p>
        </div>
      )}

      {/* LOADING */}
      {status === "loading" && (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin" />
          <p className="text-sm">Memulai kamera...</p>
        </div>
      )}

      {/* DENIED */}
      {status === "denied" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <CameraOff className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">
            Izin kamera ditolak
          </p>
          <p className="text-xs text-muted-foreground">
            Izinkan kamera di browser untuk menggunakan scanner
          </p>
          <button
            onClick={startScanner}
            className="text-sm text-primary underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* ERROR */}
      {status === "error" && (
        <div className="text-center">
          <p className="text-sm text-destructive">{errorMsg}</p>
        </div>
      )}

      {/* READY */}
      {status === "ready" && (
        <p className="text-xs text-muted-foreground text-center">
          Arahkan kamera ke QR Code / Barcode
        </p>
      )}
    </div>
  );
}