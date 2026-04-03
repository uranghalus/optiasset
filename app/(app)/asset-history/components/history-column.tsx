"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type AssetHistoryWithDetails = {
  id: string;
  assetId: string;
  userId: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  asset: {
    barcode: string | null;
    item: {
      name: string;
      code: string;
    };
  };
  user: {
    name: string | null;
    email: string;
  };
};

export const historyColumns: ColumnDef<AssetHistoryWithDetails>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal & Waktu" />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue() as Date;
      return (
        <div className="ps-2 text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(date), "dd MMM yyyy, HH:mm")}
        </div>
      );
    },
    size: 160,
  },
  {
    id: "asset_info",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aset" />
    ),
    cell: ({ row }) => {
      const { asset } = row.original;
      return (
        <div className="ps-2 flex flex-col">
          <span className="font-medium text-xs font-mono">
            {asset.barcode || "-"}
          </span>
          <span className="text-sm">{asset.item.name}</span>
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aksi" />
    ),
    cell: ({ cell }) => {
      const action = cell.getValue() as string;
      return (
        <div className="ps-2">
          <Badge
            variant="outline"
            className={cn(
              action === "CREATE" &&
                "border-blue-500 text-blue-500 bg-blue-50/50",
              action === "UPDATE" &&
                "border-amber-500 text-amber-500 bg-amber-50/50",
              action === "DELETE" && "border-red-500 text-red-500 bg-red-50/50",
              action === "TRANSFER" &&
                "border-purple-500 text-purple-500 bg-purple-50/50",
              action === "ASSIGN" &&
                "border-indigo-500 text-indigo-500 bg-indigo-50/50",
            )}
          >
            {action}
          </Badge>
        </div>
      );
    },
    size: 100,
  },
  {
    id: "details",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Detail Perubahan" />
    ),
    cell: ({ row }) => {
      const { field, oldValue, newValue, action } = row.original;

      if (action === "CREATE")
        return (
          <span className="ps-2 text-xs text-muted-foreground">
            Asset registered
          </span>
        );
      if (action === "DELETE")
        return <span className="ps-2 text-xs text-red-400">Asset removed</span>;

      return (
        <div className="ps-2 flex flex-col gap-1 max-w-[300px]">
          {field && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Field: {field}
            </span>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span className="line-through text-muted-foreground truncate max-w-[120px]">
              {oldValue || "empty"}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium text-foreground truncate max-w-[120px]">
              {newValue || "empty"}
            </span>
          </div>
        </div>
      );
    },
    size: 300,
  },
  {
    id: "user_info",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Oleh" />
    ),
    cell: ({ row }) => {
      const { user } = row.original;
      return (
        <div className="ps-2 flex flex-col">
          <span className="text-sm font-medium">{user.name || "System"}</span>
          <span className="text-[10px] text-muted-foreground">
            {user.email}
          </span>
        </div>
      );
    },
    size: 180,
  },
];
