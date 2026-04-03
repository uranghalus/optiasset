"use client";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/context/dialog-provider";
import { Asset } from "@/generated/prisma/client";
import { Row } from "@tanstack/react-table";
import { Pencil, Trash2, QrCode } from "lucide-react";
import React from "react";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}
export default function AssetRowAction<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const asset = row.original as Asset;
  const { setOpen, setCurrentRow } = useDialog();

  return (
    <ButtonGroup>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => {
          setCurrentRow(asset);
          setOpen("delete");
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          setCurrentRow(asset);
          setOpen("edit");
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          setCurrentRow(asset);
          setOpen("view-qr");
        }}
      >
        <QrCode className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  );
}
