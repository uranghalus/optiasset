"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import { AssetActionDialog } from "./asset-action-dialog";
import { Asset } from "@/generated/prisma/client";
import { AssetDeleteDialog } from "./asset-delete-dialog";

export default function AssetDialogs() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      <AssetActionDialog
        key="asset-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />
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
        </>
      )}
    </>
  );
}
