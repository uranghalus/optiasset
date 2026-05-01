"use client";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/context/dialog-provider";
import { Asset } from "@/generated/prisma/client";
import { usePermission } from "@/hooks/use-permission";
import { Row } from "@tanstack/react-table";
import {
  Pencil,
  Trash2,
  QrCode,
  Move,
  Handshake,
  MoreHorizontalIcon,
  Send,
} from "lucide-react";
import Link from "next/link";

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
      {can("asset", ["delete"]) && (
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
      {can("asset", ["edit"]) && (
        <Button variant="outline" size="icon" asChild>
          <Link href={`/assets/${asset.id}/edit`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More Options">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Aksi Lainnya</DropdownMenuLabel>
            {can("asset", ["view"]) && (
              <DropdownMenuItem asChild>
                <Link href={`/assets/${asset.id}`}>
                  <Handshake className="h-4 w-4 me-2" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
            )}
            {can("asset", ["assign"]) && (
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(asset);
                  setOpen("assign");
                }}
              >
                <Send className="h-4 w-4 me-2" />
                Serah Terima Asset
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Konfigurasi Asset</DropdownMenuLabel>
            {can("asset", ["scan-code"]) && (
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(asset);
                  setOpen("view-qr");
                }}
              >
                <QrCode className="h-4 w-4" />
                Lihat QR Code
              </DropdownMenuItem>
            )}

            {can("asset.transfer", ["create"]) && (
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(asset);
                  setOpen("transfer");
                }}
              >
                <Move />
                Transfer Asset
              </DropdownMenuItem>
            )}

            {can("asset.loan", ["create"]) && (
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(asset);
                  setOpen("loan");
                }}
              >
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
