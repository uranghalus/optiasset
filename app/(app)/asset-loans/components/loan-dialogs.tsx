"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import { AssetReturnDialog } from "./asset-return-dialog";
import { LoanRejectDialog } from "./loan-reject-dialog";

export default function LoanDialogs() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      {currentRow && (
        <AssetReturnDialog
          key={`loan-return-${(currentRow as any).id}`}
          loan={currentRow}
          open={open === "complete"}
          onOpenChange={() => {
            setOpen("complete");
            setCurrentRow(null);
          }}
        />
      )}
      {currentRow && (
        <LoanRejectDialog
          key={`loan-reject-${(currentRow as any).id}`}
          loan={currentRow}
          open={open === "reject"}
          onOpenChange={() => {
            setOpen("reject");
            setCurrentRow(null);
          }}
        />
      )}
    </>
  );
}
