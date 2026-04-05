"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import { OrgRoleActionDialog } from "./role-action-dialog";
import { OrgRoleDeleteDialog } from "./role-delete-dialog";
import { organizationRole } from "@/generated/prisma/client";

export default function RoleDialog() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      <OrgRoleActionDialog
        key="category-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />
      {currentRow && (
        <>
          <OrgRoleActionDialog
            key={`category-edit-${(currentRow as organizationRole).id}`}
            open={open === "edit"}
            currentRow={currentRow as organizationRole}
            onOpenChange={() => {
              setOpen("edit");
              setCurrentRow(undefined);
            }}
          />
          <OrgRoleDeleteDialog
            key={`category-delete-${(currentRow as organizationRole).id}`}
            open={open === "delete"}
            onOpenChange={() => setOpen("delete")}
            currentRow={currentRow as organizationRole}
          />
        </>
      )}
    </>
  );
}
