"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";

import { Asset } from "@/generated/prisma/client";
import { AssetDeleteDialog } from "./asset-delete-dialog";
import { AssetQRDialog } from "./asset-qr-dialog";
import { AssetTransferDialog } from "./asset-transfer-dialog";
import { AssetPrintDialog } from "./asset-print-dialog";
import { BarcodeScannerDialog } from "@/components/assets/barcode-scanner-dialog";
import { AssetLoanDialog } from "./asset-loan-dialog";
import { AssetWithItem } from "./asset-column";
import AssetAssignDialog from "./asset-assign-dialog";
import ImportAssetDialog from "./import-asset-dialog";

export default function AssetDialogs() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      <ImportAssetDialog
        key="asset-import"
        open={open === "import"}
        onOpenChange={() => setOpen("import")}
      />
      <BarcodeScannerDialog />
      <AssetPrintDialog />
      {currentRow && (
        <>
          <AssetAssignDialog
            key={`asset-assign-${(currentRow as Asset).id}`}
            open={open === "assign"}
            currentRow={currentRow as Asset}
            onOpenChange={() => {
              setOpen("assign");
              setCurrentRow(undefined);
            }}
          />
          <AssetDeleteDialog key={`asset-delete-${(currentRow as Asset).id}`} />
          <AssetQRDialog
            key={`asset-qr-${(currentRow as Asset).id}`}
            asset={currentRow as AssetWithItem}
            open={open === "view-qr"}
            onOpenChange={() => {
              setOpen("view-qr");
              setCurrentRow(undefined);
            }}
          />
          <AssetTransferDialog
            key={`asset-transfer-${(currentRow as Asset).id}`}
            asset={currentRow as AssetWithItem}
            open={open === "transfer"}
            onOpenChange={() => {
              setOpen("transfer");
              setCurrentRow(undefined);
            }}
          />
          <AssetLoanDialog
            key={`asset-loan-${(currentRow as Asset).id}`}
            asset={currentRow as AssetWithItem}
            open={open === "loan"}
            onOpenChange={() => {
              setOpen("loan");
              setCurrentRow(undefined);
            }}
          />
        </>
      )}
    </>
  );
}
