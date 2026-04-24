"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Prisma } from "@/generated/prisma";
import { DisposalRowActions } from "./disposal-row-action";

export type DisposalWithRelations = Prisma.AssetDisposalGetPayload<{
  include: {
    asset: {
      select: {
        barcode: true,
        brand: true,
        model: true,
        kode_asset: true,
        location: { select: { name: true } },
        item: { select: { name: true, code: true, id: true } },
      },
    },
    requestedBy: { select: { name: true } },
    spvApprovedBy: { select: { name: true } },
    staffApprovedBy: { select: { name: true } },
  }
}>

export const disposalColumns: ColumnDef<DisposalWithRelations>[] = [
  {
    accessorKey: "disposalDate",
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
          {row.original.asset.kode_asset || "-"}
        </span>
      </div>
    ),
    size: 200,
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
    id: "requestedBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Diajukan Oleh" />
    ),
    cell: ({ row }) => (
      <div className="ps-2 text-sm italic">
        {row.original.requestedBy?.name || "-"}
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
            className={`px-2 py-1 text-xs rounded-full font-medium ${
                status === "APPROVED"
                ? "bg-green-100 text-green-700"
                : status === "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
          >
            {status}
          </span>
          {row.original.spvApprovedBy && (
            <div className="text-xs text-muted-foreground mt-1">
              SPV: {row.original.spvApprovedBy.name}
            </div>
          )}
          {row.original.staffApprovedBy && (
            <div className="text-xs text-muted-foreground mt-1">
              Staff: {row.original.staffApprovedBy.name}
            </div>
          )}
        </div>
      );
    },
    size: 150,
  },
  {
    id: "actions",
    cell: ({ row }) => <DisposalRowActions row={row} />,
    size: 80,
  },
];
