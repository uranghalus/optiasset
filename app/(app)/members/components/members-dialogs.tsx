"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import { MemberActionDialog } from "./member-action-dialog";
import { MemberDeleteDialog } from "./member-delete-dialog";
import { MemberWithRelations } from "./members-table";

export default function MembersDialogs() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      <MemberActionDialog
        key="member-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />
      {currentRow && (
        <>
          <MemberActionDialog
            key={`member-edit-${(currentRow as MemberWithRelations).id}`}
            open={open === "edit"}
            currentRow={currentRow as MemberWithRelations}
            onOpenChange={() => {
              setOpen("edit");
              setCurrentRow(undefined);
            }}
          />
          <MemberDeleteDialog
            key={`member-delete-${(currentRow as MemberWithRelations).id}`}
          />
        </>
      )}
    </>
  );
}
