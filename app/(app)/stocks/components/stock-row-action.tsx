"use client";

import React, { useState } from "react";
import { Row } from "@tanstack/react-table";
import {
  MoreHorizontal,
  PlusCircle,
  MinusCircle,
  History,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StockActionDialog from "./stock-action-dialog";

interface StockRowActionProps<TData> {
  row: Row<TData>;
}

export default function StockRowAction<TData>({
  row,
}: StockRowActionProps<TData>) {
  const stock = row.original as any;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"IN" | "OUT" | "ADJUSTMENT">(
    "IN",
  );

  const openDialog = (type: "IN" | "OUT" | "ADJUSTMENT") => {
    setActionType(type);
    setDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 ml-auto flex">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuLabel>Aksi Stok</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openDialog("IN")}>
            <PlusCircle className="mr-2 h-4 w-4 text-emerald-500" />
            Stok Masuk
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog("OUT")}>
            <MinusCircle className="mr-2 h-4 w-4 text-amber-500" />
            Stok Keluar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog("ADJUSTMENT")}>
            <ArrowRightLeft className="mr-2 h-4 w-4 text-indigo-500" />
            Penyesuaian
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <History className="mr-2 h-4 w-4" />
            Lihat Transaksi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StockActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={actionType}
        stock={stock}
      />
    </>
  );
}
