"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoveRight } from "lucide-react";
import { TransferRowActions } from "./transfer-row-action";

type TransferWithRelations = {
  id: string;
  assetId: string;
  transferDate: Date;
  reason: string | null;
  transferBy: string | null;
  asset: {
    barcode: string | null;
    item: {
      name: string;
      code: string;
      serialNumber: string | null;
    };
  };
  fromLocation: { name: string } | null;
  toLocation: { name: string } | null;
  status: string;
  approvedBy: { name: string } | null;
};

export const transferColumns: ColumnDef<TransferWithRelations>[] = [
  {
    accessorKey: "transferDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 text-sm">
        {format(new Date(cell.getValue() as Date), "dd MMM yyyy, HH:mm")}
      </div>
    ),
    size: 150,
  },
  {
    id: "asset",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aset" />
    ),
    cell: ({ row }) => (
      <div className="ps-2 flex flex-col">
        <span className="font-medium">{row.original.asset.item.name}</span>
        <span className="text-xs text-muted-foreground font-mono">
          {row.original.asset.barcode ||
            row.original.asset.item.serialNumber ||
            "-"}
        </span>
      </div>
    ),
    size: 200,
  },
  {
    id: "movement",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Perpindahan Lokasi" />
    ),
    cell: ({ row }) => (
      <div className="ps-2 flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">
          {row.original.fromLocation?.name || "N/A"}
        </span>
        <MoveRight className="h-4 w-4 text-primary shrink-0" />
        <span className="font-medium">
          {row.original.toLocation?.name || "N/A"}
        </span>
      </div>
    ),
    size: 300,
  },
  {
    accessorKey: "reason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alasan" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 text-xs text-muted-foreground truncate max-w-[200px]">
        {(cell.getValue() as string) || "-"}
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "transferBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Petugas" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 text-sm italic">
        {(cell.getValue() as string) || "-"}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className="ps-2">
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${status === "APPROVED"
                ? "bg-green-100 text-green-700"
                : status === "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
          >
            {status}
          </span>
          {row.original.approvedBy && (
            <div className="text-xs text-muted-foreground mt-1">
              by {row.original.approvedBy.name}
            </div>
          )}
        </div>
      );
    },
    size: 150,
  },
  {
    id: "actions",
    cell: ({ row }) => <TransferRowActions row={row} />,
    size: 80,
  },
];


