"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import { DivisiActionDialog } from "./divisi-action-dialog";
import { divisi } from "@/generated/prisma/client";
import { DivisiDeleteDialog } from "./divisi-delete-dialog";

export default function DivisiDialogs() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      <DivisiActionDialog
        key="divisi-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />
      {currentRow && (
        <>
          <DivisiActionDialog
            key={`divisi-edit-${(currentRow as divisi).id_divisi}`}
            open={open === "edit"}
            currentRow={currentRow as divisi}
            onOpenChange={() => {
              setOpen("edit");
              setCurrentRow(undefined);
            }}
          />
          <DivisiDeleteDialog
            key={`divisi-delete-${(currentRow as divisi).id_divisi}`}
          />
        </>
      )}
    </>
  );
}
