"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Item } from "@/generated/prisma/client";
import ItemRowAction from "./item-row-action";

type ItemWithRelations = Item & {
  category?: { id: string; name: string } | null;
  _count?: { assets: number };
};

export const itemColumns: ColumnDef<ItemWithRelations>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 font-mono text-sm font-medium">
        {cell.getValue() as string}
      </div>
    ),
    size: 130,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Item" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 font-medium">{cell.getValue() as string}</div>
    ),
    size: 220,
  },
  {
    accessorKey: "assetType",
    filterFn: "arrIncludesSome",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipe" />
    ),
    cell: ({ cell }) => {
      const type = cell.getValue() as string;
      return (
        <div className="ps-2">
          <Badge variant={type === "FIXED" ? "default" : "secondary"}>
            {type === "FIXED" ? "Aset Tetap" : "Supply"}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
  {
    id: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kategori" />
    ),
    cell: ({ row }) => (
      <div className="ps-2">{row.original.category?.name ?? "-"}</div>
    ),
    size: 150,
  },
  {
    id: "assets_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aset" />
    ),
    cell: ({ row }) => (
      <div className="ps-2">{row.original._count?.assets ?? 0}</div>
    ),
    size: 80,
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
    cell: ItemRowAction,
    meta: {
      className: cn(
        "sticky right-0 z-10 w-[60px] px-2",
        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted transition-colors duration-200",
      ),
    },
  },
];
