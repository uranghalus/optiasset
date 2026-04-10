"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import LoanRowAction from "./loan-row-action";

type LoanWithRelations = {
  id: string;
  assetId: string;
  borrowerId: string;
  loanDate: Date;
  dueDate: Date | null;
  returnDate: Date | null;
  status: "PENDING" | "REJECTED" | "BORROWED" | "RETURNED";
  asset: {
    barcode: string | null;
    item: { name: string; code: string; serialNumber: string | null };
  };
  borrower: { name: string; email: string };
};

export const loanColumns: ColumnDef<LoanWithRelations>[] = [
  {
    accessorKey: "loanDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tgl. Pinjam" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 text-sm">
        {format(new Date(cell.getValue() as Date), "dd MMM yyyy")}
      </div>
    ),
    size: 130,
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
    id: "borrower",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Peminjam" />
    ),
    cell: ({ row }) => (
      <div className="ps-2 flex flex-col">
        <span className="font-medium">{row.original.borrower.name}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.borrower.email}
        </span>
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tenggat" />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue() as Date | null;
      return (
        <div className="ps-2 text-sm">
          {date ? format(new Date(date), "dd MMM yyyy") : "-"}
        </div>
      );
    },
    size: 130,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return (
        <div className="ps-2">
          <Badge
            variant="outline"
            className={cn(
              status === "PENDING" && "border-blue-500 text-blue-500",
              status === "REJECTED" && "border-red-500 text-red-500",
              status === "BORROWED" && "border-yellow-500 text-yellow-500",
              status === "RETURNED" && "border-green-500 text-green-500",
            )}
          >
            {status === "PENDING" && "Menunggu"}
            {status === "REJECTED" && "Ditolak"}
            {status === "BORROWED" && "Dipinjam"}
            {status === "RETURNED" && "Kembali"}
          </Badge>
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
    cell: LoanRowAction,
  },
];
