"use client";

import { Scanner } from "@yudiel/react-qr-scanner";

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

const videoConstraints: any = {
  facingMode: 'environment',
  width: { ideal: 1280 },
  height: { ideal: 720 },
  advanced: [{ focusMode: "continuous" }]
};

export function BarcodeScanner({ onScanSuccess }: BarcodeScannerProps) {

  return (
    // Container utama yang membungkus kamera dan teks
    <div className="flex flex-col items-center gap-4 w-full">

      {/* 1. AREA KAMERA (Dipotong Ekstrem menjadi 150px) */}
      <div className="relative w-full h-[150px] flex items-center justify-center bg-black overflow-hidden rounded-lg shadow-inner">

        {/* Wrapper Scanner untuk mempertahankan rasio kamera dan memusatkannya */}
        <div className="absolute top-1/2 left-1/2 w-full min-w-[100%] min-h-[100%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <Scanner
            formats={["code_128", "code_39", "ean_13", "qr_code"]}
            onScan={(result) => {
              if (Array.isArray(result) && result.length > 0) {
                const text = result[0].rawValue;
                if (text) {
                  onScanSuccess(text);
                }
              } else if (typeof result === "string") {
                onScanSuccess(result);
              }
            }}
            onError={(error: any) => {
              console.error("Scanner Error:", error?.message);
            }}
            components={{
              onOff: false,
              torch: true,
              zoom: false,
              finder: false,
            }}
            constraints={videoConstraints}
          />
        </div>

        {/* Overlay Kotak Pembidik & Garis Laser */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">

          {/* Kotak Transparan (Tingginya dikurangi menyesuaikan container) */}
          <div className="relative w-[90%] sm:w-[80%] h-[80px] border border-white/60 rounded-lg shadow-[0_0_0_999px_rgba(0,0,0,0.65)]">

            {/* Garis Merah di Tengah */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[1.5px] bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)] animate-pulse" />

          </div>
        </div>
      </div>

      {/* 2. TEKS INSTRUKSI (Diletakkan di LUAR box kamera) */}
      <p className="text-sm font-medium text-muted-foreground text-center">
        Posisikan barcode di dalam garis merah
      </p>

    </div>
  );
}