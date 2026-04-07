"use client";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/context/dialog-provider";
import { Location } from "@/generated/prisma/client";
import { Row } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import React from "react";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}
export default function LocationsRowAction<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const location = row.original as Location;
  const { setOpen, setCurrentRow } = useDialog();

  return (
    <ButtonGroup>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => {
          setCurrentRow(location);
          setOpen("delete");
        }}
      >
        <Trash2 />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          setCurrentRow(location);
          setOpen("edit");
        }}
      >
        <Pencil />
      </Button>
    </ButtonGroup>
  );
}
