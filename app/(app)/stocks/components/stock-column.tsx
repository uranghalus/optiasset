"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import StockRowAction from "./stock-row-action";

type StockWithRelations = {
  id: string;
  itemId: string;
  quantity: number;
  locationId: string | null;
  updatedAt: Date;
  item: {
    name: string;
    code: string;
    category: {
      id: string;
      name: string;
    } | null;
  };
  location: {
    id: string;
    name: string;
  } | null;
};

export const stockColumns: ColumnDef<StockWithRelations>[] = [
  {
    accessorKey: "item_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Item" />
    ),
    cell: ({ row }) => (
      <div className="ps-2 font-mono text-sm font-medium">
        {row.original.item.code}
      </div>
    ),
    size: 130,
  },
  {
    accessorKey: "item_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Item" />
    ),
    cell: ({ row }) => (
      <div className="ps-2 font-medium">{row.original.item.name}</div>
    ),
    size: 220,
  },
  {
    id: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kategori" />
    ),
    cell: ({ row }) => (
      <div className="ps-2 text-muted-foreground text-sm">
        {row.original.item.category?.name ?? "-"}
      </div>
    ),
    size: 150,
  },
  {
    id: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lokasi / Gudang" />
    ),
    cell: ({ row }) => (
      <div className="ps-2 text-sm font-medium">
        {row.original.location?.name ?? "Tanpa Lokasi"}
      </div>
    ),
    size: 180,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stok" />
    ),
    cell: ({ cell }) => {
      const gty = cell.getValue() as number;
      return (
        <div className="ps-2">
          <Badge
            variant={gty > 0 ? "secondary" : "destructive"}
            className="px-2 font-mono"
          >
            {gty}
          </Badge>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Update Terakhir" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 text-xs text-muted-foreground">
        {format(new Date(cell.getValue() as Date), "dd MMM yyyy, HH:mm")}
      </div>
    ),
    size: 160,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Action"
        className="ml-auto"
      />
    ),
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableResizing: false,
    cell: StockRowAction,
    meta: {
      className: cn(
        "sticky right-0 z-10 w-[60px] px-2",
        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted transition-colors duration-200",
      ),
    },
  },
];
