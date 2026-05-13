"use client";

import { AssetWithItem } from '@/app/(app)/assets/components/asset-column';
import Barcode from 'react-barcode';

interface AssetBarcodeProps {
  value: string | null;         // ID asli (UUID)// Jika true, hanya ambil 8 karakter pertama
  width?: number;        // Tebal garis (1-2 direkomendasikan agar tidak kepanjangan)
  height?: number;       // Tinggi barcode
  className?: string;
}

export function AssetBarcode({
  value,
  width = 1.5, // Diturunkan sedikit dari 2 agar lebih hemat ruang
  height = 50,
  className = ""
}: AssetBarcodeProps) {


  return (
    <div className={`flex flex-col items-center justify-center w-fit mx-auto ${className}`}>

      {/* Kontainer Barcode dengan overflow terukur */}
      <div className="bg-white overflow-hidden flex justify-center">
        <Barcode
          value={value as any}
          width={width}
          height={height}
          format="CODE128"
          displayValue={false}
          fontSize={12}
          fontOptions="bold"
          background="transparent"
          margin={0}
        />
      </div>
    </div>
  );
}