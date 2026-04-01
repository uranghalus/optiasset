"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Asset } from "@/generated/prisma/client";
import AssetRowAction from "./asset-row-action";
import { format } from "date-fns";

type AssetWithItem = Asset & {
  item: {
    name: string;
    code: string;
    assetType: string;
  };
};

export const assetColumns: ColumnDef<AssetWithItem>[] = [
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
    accessorKey: "barcode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Barcode/Tag" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 font-mono text-xs font-medium">
        {(cell.getValue() as string) || "-"}
      </div>
    ),
    size: 140,
  },
  {
    id: "item_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Item / Model" />
    ),
    cell: ({ row }) => {
      const { item, brand, model } = row.original;
      return (
        <div className="ps-2 flex flex-col">
          <span className="font-medium">{item.name}</span>
          <span className="text-xs text-muted-foreground italic">
            {brand && model ? `${brand} ${model}` : brand || model || "-"}
          </span>
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: "serialNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial Number" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2">{(cell.getValue() as string) || "-"}</div>
    ),
    size: 150,
  },
  {
    accessorKey: "condition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kondisi" />
    ),
    cell: ({ cell }) => {
      const condition = cell.getValue() as string;
      return (
        <div className="ps-2">
          <Badge
            variant="outline"
            className={cn(
              condition === "GOOD" && "border-green-500 text-green-500",
              condition === "BROKEN" && "border-red-500 text-red-500",
              condition === "REPAIR" && "border-yellow-500 text-yellow-500",
            )}
          >
            {condition || "N/A"}
          </Badge>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "purchaseDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tgl. Beli" />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue() as Date;
      return (
        <div className="ps-2 text-sm text-muted-foreground">
          {date ? format(new Date(date), "dd MMM yyyy") : "-"}
        </div>
      );
    },
    size: 120,
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
    cell: AssetRowAction,
    meta: {
      className: cn(
        "sticky right-0 z-10 w-[60px] px-2",
        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted transition-colors duration-200",
      ),
    },
  },
];
