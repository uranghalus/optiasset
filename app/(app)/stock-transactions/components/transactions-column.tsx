"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";

type TransactionWithRelations = {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  reference: string | null;
  notes: string | null;
  createdAt: Date;
  stock: {
    item: {
      name: string;
      code: string;
    };
    location: {
      name: string;
    } | null;
  };
};

export const transactionColumns: ColumnDef<TransactionWithRelations>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Waktu" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 text-sm font-medium">
        {format(new Date(cell.getValue() as Date), "dd MMM yyyy, HH:mm")}
      </div>
    ),
    size: 160,
  },
  {
    id: "item",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Item" />
    ),
    cell: ({ row }) => (
      <div className="ps-2 flex flex-col">
        <span className="font-medium">{row.original.stock.item.name}</span>
        <span className="text-xs text-muted-foreground font-mono">
          {row.original.stock.item.code}
        </span>
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipe" />
    ),
    cell: ({ cell }) => {
      const type = cell.getValue() as string;
      switch (type) {
        case "IN":
          return (
            <div className="ps-2 flex items-center gap-2 text-emerald-600">
              <ArrowDownCircle className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Masuk</span>
            </div>
          );
        case "OUT":
          return (
            <div className="ps-2 flex items-center gap-2 text-amber-600">
              <ArrowUpCircle className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Keluar</span>
            </div>
          );
        default:
          return (
            <div className="ps-2 flex items-center gap-2 text-indigo-600">
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Penyesuaian</span>
            </div>
          );
      }
    },
    size: 130,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jumlah" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2">
        <Badge variant="outline" className="font-mono">
          {cell.getValue() as number}
        </Badge>
      </div>
    ),
    size: 100,
  },
  {
    id: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lokasi" />
    ),
    cell: ({ row }) => (
      <div className="ps-2 text-sm">
        {row.original.stock.location?.name ?? "Tanpa Lokasi"}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "reference",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Referensi" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 text-sm text-muted-foreground">
        {(cell.getValue() as string) || "-"}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Catatan" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 text-xs text-muted-foreground max-w-[200px] truncate">
        {(cell.getValue() as string) || "-"}
      </div>
    ),
    size: 200,
  },
];
