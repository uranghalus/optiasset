"use client";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDialog } from "@/context/dialog-provider";
import { Asset } from "@/generated/prisma/client";
import { usePermission } from "@/hooks/use-permission";
import { Row } from "@tanstack/react-table";
import { Pencil, Trash2, QrCode, Move, Handshake, MoreHorizontalIcon, FileDown, Printer } from "lucide-react";
import Link from "next/link";
import React from "react";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}
export default function AssetRowAction<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const asset = row.original as Asset;
  const { setOpen, setCurrentRow } = useDialog();
  const { can } = usePermission();
  return (
    <ButtonGroup>
      {can('asset', ['delete']) && (
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
      )}
      {can('asset', ['edit']) && (
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
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More Options">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Aksi Lainnya</DropdownMenuLabel>
            {can('asset', ['view']) && (
              <DropdownMenuItem asChild>
                <Link href={`/assets/${asset.id}`}>
                  <Handshake className="h-4 w-4 me-2" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Konfigurasi Asset</DropdownMenuLabel>
            {can('asset', ['scan-code']) && (
              <DropdownMenuItem onClick={() => {
                setCurrentRow(asset);
                setOpen("view-qr");
              }}>
                <QrCode className="h-4 w-4" />
                Lihat QR Code
              </DropdownMenuItem>
            )}
            {can('asset.transfer', ['create']) && (
              <DropdownMenuItem onClick={() => {
                setCurrentRow(asset);
                setOpen("transfer");
              }}>
                <Move />
                Transfer Asset
              </DropdownMenuItem>
            )}

            {can('asset.loan', ['create']) && (
              <DropdownMenuItem onClick={() => {
                setCurrentRow(asset);
                setOpen("loan");
              }}>
                <Handshake />
                Peminjaman Asset
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>

    </ButtonGroup>
  );
}
