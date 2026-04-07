"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";
import { DepartmentActionDialog } from "./department-action-dialog";
import { department } from "@/generated/prisma/client";
import { DepartmentDeleteDialog } from "./department-delete-dialog";

export default function DepartmentDialogs() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      <DepartmentActionDialog
        key="department-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />
      {currentRow && (
        <>
          <DepartmentActionDialog
            key={`department-edit-${(currentRow as department).id_department}`}
            open={open === "edit"}
            currentRow={currentRow as department}
            onOpenChange={() => {
              setOpen("edit");
              setCurrentRow(undefined);
            }}
          />
          <DepartmentDeleteDialog
            key={`department-delete-${(currentRow as department).id_department}`}
          />
        </>
      )}
    </>
  );
}
