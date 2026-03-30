"use client";
import { useDialog } from "@/context/dialog-provider";
import React from "react";

import { Location } from "@/generated/prisma/client";
import { LocationActionDialog } from "./location-action-dialog";
import { LocationDeleteDialog } from "./locations-delete-dialog";

export default function LocationsDialog() {
  const { currentRow, open, setCurrentRow, setOpen } = useDialog();
  return (
    <>
      <LocationActionDialog
        key="location-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />
      {currentRow && (
        <>
          <LocationActionDialog
            key={`location-edit-${(currentRow as Location).id}`}
            open={open === "edit"}
            currentRow={currentRow as Location}
            onOpenChange={() => {
              setOpen("edit");
              setCurrentRow(undefined);
            }}
          />
          <LocationDeleteDialog
            key={`location-delete-${(currentRow as Location).id}`}
          />
        </>
      )}
    </>
  );
}
