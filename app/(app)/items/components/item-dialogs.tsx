"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import { ItemActionDialog } from "./item-action-dialog";
import { Item } from "@/generated/prisma/client";
import { ItemDeleteDialog } from "./item-delete-dialog";
import { ItemStockDialog } from "./item-stock-dialog";

export default function ItemDialogs() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      <ItemActionDialog
        key="item-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />
      {currentRow && (
        <>
          <ItemActionDialog
            key={`item-edit-${(currentRow as Item).id}`}
            open={open === "edit"}
            currentRow={currentRow as Item}
            onOpenChange={() => {
              setOpen("edit");
              setCurrentRow(undefined);
            }}
          />
          <ItemDeleteDialog key={`item-delete-${(currentRow as Item).id}`} />
          <ItemStockDialog
            key={`item-stock-${(currentRow as Item).id}`}
            item={currentRow as Item}
            open={open === "view-stock"}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null);
                setCurrentRow(null);
              } else {
                setOpen("view-stock");
              }
            }}
          />
        </>
      )}
    </>
  );
}
