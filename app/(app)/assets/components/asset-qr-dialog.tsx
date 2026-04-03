"use client";

import { AssetQRCode } from "@/components/assets/asset-qr-code";
import { Asset } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AssetQRDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetQRDialog({
  asset,
  open,
  onOpenChange,
}: AssetQRDialogProps) {
  if (!asset) return null;

  const qrValue = `${window.location.origin}/assets/view/${asset.id}`;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label - ${asset.barcode || asset.id}</title>
          <style>
            body { 
              font-family: sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
              padding: 20px;
            }
            .label-container {
              border: 1px solid #ccc;
              padding: 20px;
              text-align: center;
              width: 250px;
            }
            .asset-name { font-weight: bold; font-size: 18px; margin-bottom: 5px; }
            .asset-code { color: #666; font-size: 14px; margin-bottom: 15px; }
            img { width: 150px; height: 150px; }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="asset-name">${asset.brand || ""} ${asset.model || ""}</div>
            <div class="asset-code">${asset.barcode || asset.serialNumber || asset.id}</div>
            <div id="qr-container"></div>
          </div>
          <script>
            // We'll use the canvas from the parent to avoid complicated library loading in print window
            const canvas = window.opener.document.querySelector("#asset-qr-canvas canvas");
            const img = document.createElement("img");
            img.src = canvas.toDataURL();
            document.getElementById("qr-container").appendChild(img);
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asset QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div id="asset-qr-canvas">
            <AssetQRCode value={qrValue} size={200} />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">
              {asset.brand} {asset.model}
            </p>
            <p className="text-sm text-muted-foreground">
              {asset.barcode || asset.serialNumber}
            </p>
          </div>
        </div>
        <DialogFooter className="flex sm:justify-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Label
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
