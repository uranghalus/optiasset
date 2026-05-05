"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import { UserActionDialog } from "./user-action-dialog";
import { UserDeleteDialog } from "./user-delete-dialog";
import UserBannedDialog from "./user-banned-dialog";
import { User } from "@/generated/prisma";
import UserUnbanDialog from "./user-unban-dialog";

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
          <UserBannedDialog key={`user-banned-${(currentRow as any).id}`} open={open === "banned"} onOpenChange={() => setOpen("banned")} currentRow={currentRow as User} />
          <UserUnbanDialog key={`user-unban-${(currentRow as any).id}`} open={open === "unban"} onOpenChange={() => setOpen("unban")} currentRow={currentRow as User} />
          <UserDeleteDialog key={`user-delete-${(currentRow as any).id}`} />
        </>
      )}
    </>
  );
}
