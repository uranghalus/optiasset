"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import { OrganizationActionDialog } from "./organization-action-dialog";
import { Organization } from "@/generated/prisma/client";
import { OrganizationDeleteDialog } from "./organizations-delete-dialog";

export default function OrganizationsDialog() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      <OrganizationActionDialog
        key="organization-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />
      {currentRow && (
        <>
          <OrganizationActionDialog
            key={`organization-edit-${(currentRow as Organization).id}`}
            open={open === "edit"}
            currentRow={currentRow as Organization}
            onOpenChange={() => {
              setOpen("edit");
              setCurrentRow(undefined);
            }}
          />
          <OrganizationDeleteDialog
            key={`organization-delete-${(currentRow as Organization).id}`}
          />
        </>
      )}
    </>
  );
}
