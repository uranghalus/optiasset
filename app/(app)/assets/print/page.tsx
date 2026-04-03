import { getAssetsByManyIds } from "@/action/asset-action";
import { AssetQRCode } from "@/components/assets/asset-qr-code";
import React from "react";
import { PrintToolbar } from "./components/print-toolbar";

interface PrintPageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function PrintLabelsPage({
  searchParams,
}: PrintPageProps) {
  const params = await searchParams;
  const ids = params.ids?.split(",") || [];

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">
          Tidak ada aset yang dipilih untuk dicetak.
        </p>
      </div>
    );
  }

  const assets = await getAssetsByManyIds(ids);

  return (
    <div className="bg-background min-h-screen">
      {/* Header toolbar - now a client component */}
      <PrintToolbar count={assets.length} />

      {/* Grid Labels */}
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-3 print:p-0 print:gap-4 lg:gap-8">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="border-2 border-dashed border-muted-foreground/30 p-6 flex flex-col items-center bg-white text-black rounded-lg page-break-inside-avoid shadow-sm print:shadow-none print:border-black/20"
          >
            {/* Header Perusahaan (Placeholder) */}
            <div className="text-center mb-4">
              <div className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">
                OptiAsset Management
              </div>
              <div className="h-[2px] w-12 bg-primary mx-auto"></div>
            </div>

            {/* QR Code */}
            <div className="mb-4">
              <AssetQRCode assetId={asset.id} size={140} />
            </div>

            {/* Asset Details */}
            <div className="text-center w-full space-y-1">
              <div
                className="text-sm font-bold uppercase truncate px-2"
                title={
                  asset.brand
                    ? `${asset.brand} ${asset.model || ""}`
                    : asset.item.name
                }
              >
                {asset.brand
                  ? `${asset.brand} ${asset.model || ""}`
                  : asset.item.name}
              </div>
              <div className="text-[11px] font-mono bg-muted/50 py-0.5 px-2 rounded inline-block">
                {asset.barcode || asset.serialNumber || asset.id.slice(0, 8)}
              </div>
              {asset.item.code && (
                <div className="text-[9px] text-muted-foreground italic">
                  Catalog: {asset.item.code}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-2 border-t w-full text-center">
              <div className="text-[8px] text-muted-foreground uppercase tracking-tight">
                Property Of Organization
              </div>
            </div>
          </div>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body { background: white !important; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          @page { margin: 1cm; }
        }
      `,
        }}
      />
    </div>
  );
}
