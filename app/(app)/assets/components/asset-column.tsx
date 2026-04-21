"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Prisma } from "@/generated/prisma/client";
import AssetRowAction from "./asset-row-action";
import { format } from "date-fns";

export type AssetWithItem = Prisma.AssetGetPayload<{
  include: {
    item: {
      select: {
        name: true;
        code: true;
        assetType: true;
      };
    };
    department: {
      select: {
        nama_department: true;
      };
    };
  };
}>;

/* =======================
   BASE COLUMNS (TANPA DEPARTMENT)
======================= */
export const assetColumn: ColumnDef<AssetWithItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },

  {
    accessorKey: "kode_asset",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Aset/Tag" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 font-mono text-xs">
        {(cell.getValue() as string) || "-"}
      </div>
    ),
    size: 140,
  },

  {
    id: "item_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Item / Detail" />
    ),
    cell: ({ row }) => {
      const asset = row.original;
      return (
        <div className="ps-2 flex flex-col">
          <span className="font-medium">{asset.item.name}</span>
          <span className="text-xs text-muted-foreground italic">
            {[asset.brand, asset.model].filter(Boolean).join(" ") || "-"}
          </span>
        </div>
      );
    },
    size: 250,
  },

  {
    accessorKey: "partNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Part Number" />
    ),
    cell: ({ row }) => (
      <div className="ps-2">{row.original.partNumber || "-"}</div>
    ),
    size: 150,
  },
  {
    id: "departmentId",
    filterFn: "arrIncludesSome",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    cell: ({ row }) => {
      const dept = row.original.department;

      return (
        <div className="ps-2 text-sm">
          {dept?.nama_department ?? "No Department"}
        </div>
      );
    },
  },
  {
    accessorKey: "condition",
    filterFn: "arrIncludesSome",
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
              condition === "REPAIR" && "border-yellow-500 text-yellow-500"
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
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    size: 60,
    enableResizing: false,
    cell: AssetRowAction,
    meta: {
      className: cn(
        "sticky right-0 z-10 px-2",
        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted"
      ),
    },
  },
];

