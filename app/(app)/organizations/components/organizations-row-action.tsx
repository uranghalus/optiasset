"use client";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/context/dialog-provider";
import { Organization } from "@/generated/prisma/client";
import { Row } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import React from "react";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}
export default function OrganizationsRowAction<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const organization = row.original as Organization;
  const { setOpen, setCurrentRow } = useDialog();

  return (
    <ButtonGroup>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => {
          setCurrentRow(organization);
          setOpen("delete");
        }}
      >
        <Trash2 />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          setCurrentRow(organization);
          setOpen("edit");
        }}
      >
        <Pencil />
      </Button>
    </ButtonGroup>
  );
}
