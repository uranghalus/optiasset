"use client";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/context/dialog-provider";
import { Asset } from "@/generated/prisma/client";
import { Row } from "@tanstack/react-table";
import { Pencil, Trash2, QrCode, Move, Handshake } from "lucide-react";
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
        title="QR Code"
      >
        <QrCode className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          setCurrentRow(asset);
          setOpen("transfer");
        }}
        title="Mutasi Aset"
      >
        <Move className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          setCurrentRow(asset);
          setOpen("loan");
        }}
        title="Pinjamkan Aset"
      >
        <Handshake className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  );
}
