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
  };
}>;

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

  // ✅ kode_asset
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

  // ✅ Item + Brand Model
  {
    id: "item_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Item / Detail" />
    ),
    cell: ({ row }) => {
      const asset = row.original;
      console.log(row.original);
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

  // ✅ Foto Aset
  {
    id: "photo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Foto" />
    ),
    cell: ({ row }) => {
      const asset = row.original as Prisma.AssetGetPayload<{
        include: { item: true };
      }> & { photoUrl?: string | null };
      const photoUrl = asset.photoUrl;

      if (!photoUrl) {
        return (
          <div className="ps-2 text-xs text-muted-foreground">-</div>
        );
      }

      return (
        <div className="ps-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt="Asset"
            className="h-10 w-10 rounded-md object-cover border"
          />
        </div>
      );
    },
    size: 80,
  },

  // ✅ Part Number (tambahan karena ada di schema kamu)
  {
    accessorKey: "partNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Part Number" />
    ),
    cell: ({ row }) => (
      <div className="ps-2">
        {row.original.partNumber || "-"}
      </div>
    ),
    size: 150,
  },

  // ✅ Condition
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

  // ✅ Purchase Date
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

  // ✅ Actions
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