"use client";

import { Scanner } from "@yudiel/react-qr-scanner";

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

const videoConstraints: MediaTrackConstraints = {
  facingMode: 'environment', // Menggunakan kamera belakang
  aspectRatio: 1, // Rasio kotak
  width: { ideal: 1920 },
  height: { ideal: 1080 },
};

export function BarcodeScanner({ onScanSuccess }: BarcodeScannerProps) {

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden rounded-md">
      <div className="w-full max-w-[400px] mx-auto">
        <Scanner
          onScan={(result) => {
            // 2. Ekstrak nilai string-nya karena result sekarang berupa Array
            if (Array.isArray(result) && result.length > 0) {
              const text = result[0].rawValue;
              if (text) {
                onScanSuccess(text);
              }
            } else if (typeof result === "string") {
              // Fallback untuk berjaga-jaga jika menggunakan versi agak lama
              onScanSuccess(result);
            }
          }}
          onError={(error: any) => {
            console.error("Scanner Error:", error?.message);
          }}
          components={{
            onOff: true, // Show camera on/off button
            torch: true, // Show torch/flashlight button (if supported)
            zoom: true, // Show zoom control (if supported)
            finder: true, // Show finder overlay
          }}
          constraints={
            videoConstraints
          }
        />
      </div>

      {/* Overlay Visual Pembidik */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-[65%] aspect-square border-2 border-white/50 border-dashed rounded-xl shadow-[0_0_0_999px_rgba(0,0,0,0.4)]" />
      </div>
    </div>
  );
}