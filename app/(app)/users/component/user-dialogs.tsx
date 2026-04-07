"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import { UserActionDialog } from "./user-action-dialog";
import { UserDeleteDialog } from "./user-delete-dialog";

export default function UserDialogs() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      <UserActionDialog
        key="user-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />
      {currentRow && (
        <>
          <UserActionDialog
            key={`user-edit-${(currentRow as any).id}`}
            open={open === "edit"}
            currentRow={currentRow as any}
            onOpenChange={() => {
              setOpen("edit");
              setCurrentRow(undefined);
            }}
          />
          <UserDeleteDialog key={`user-delete-${(currentRow as any).id}`} />
        </>
      )}
    </>
  );
}
