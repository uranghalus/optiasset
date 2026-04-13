"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import { AssetActionDialog } from "./asset-action-dialog";
import { Asset } from "@/generated/prisma/client";
import { AssetDeleteDialog } from "./asset-delete-dialog";
import { AssetQRDialog } from "./asset-qr-dialog";
import { AssetTransferDialog } from "./asset-transfer-dialog";
import { AssetLoanDialog } from "./asset-loan-dialog";
import { BarcodeScannerDialog } from "@/components/assets/barcode-scanner-dialog";

export default function AssetDialogs() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      <AssetActionDialog
        key="asset-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />
      <BarcodeScannerDialog />
      {currentRow && (
        <>
          <AssetActionDialog
            key={`asset-edit-${(currentRow as Asset).id}`}
            open={open === "edit"}
            currentRow={currentRow as Asset}
            onOpenChange={() => {
              setOpen("edit");
              setCurrentRow(undefined);
            }}
          />
          <AssetDeleteDialog key={`asset-delete-${(currentRow as Asset).id}`} />
          <AssetQRDialog
            key={`asset-qr-${(currentRow as Asset).id}`}
            asset={currentRow as Asset}
            open={open === "view-qr"}
            onOpenChange={() => {
              setOpen("view-qr");
              setCurrentRow(undefined);
            }}
          />
          <AssetTransferDialog
            key={`asset-transfer-${(currentRow as Asset).id}`}
            asset={currentRow as Asset}
            open={open === "transfer"}
            onOpenChange={() => {
              setOpen("transfer");
              setCurrentRow(undefined);
            }}
          />
          <AssetLoanDialog
            key={`asset-loan-${(currentRow as Asset).id}`}
            asset={currentRow as Asset}
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
