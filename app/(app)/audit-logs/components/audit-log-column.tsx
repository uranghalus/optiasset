"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Plus,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  ArrowLeftRight,
  Settings2,
} from "lucide-react";

type AuditLogWithUser = {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  entityInfo: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  } | null;
};

const getActionStyles = (action: string) => {
  switch (action) {
    case "CREATE":
      return {
        className: "border-emerald-500 text-emerald-500 bg-emerald-50/50",
        icon: <Plus className="mr-1 h-3 w-3" />,
      };
    case "UPDATE":
      return {
        className: "border-amber-500 text-amber-500 bg-amber-50/50",
        icon: <Pencil className="mr-1 h-3 w-3" />,
      };
    case "DELETE":
      return {
        className: "border-red-500 text-red-500 bg-red-50/50",
        icon: <Trash2 className="mr-1 h-3 w-3" />,
      };
    case "LOGIN":
      return {
        className: "border-blue-500 text-blue-500 bg-blue-50/50",
        icon: <LogIn className="mr-1 h-3 w-3" />,
      };
    case "LOGOUT":
      return {
        className: "border-slate-500 text-slate-500 bg-slate-50/50",
        icon: <LogOut className="mr-1 h-3 w-3" />,
      };
    case "TRANSFER":
      return {
        className: "border-purple-500 text-purple-500 bg-purple-50/50",
        icon: <ArrowLeftRight className="mr-1 h-3 w-3" />,
      };
    case "ADJUSTMENT":
      return {
        className: "border-indigo-500 text-indigo-500 bg-indigo-50/50",
        icon: <Settings2 className="mr-1 h-3 w-3" />,
      };
    default:
      return {
        className: "border-gray-500 text-gray-500 bg-gray-50/50",
        icon: null,
      };
  }
};

export const auditLogColumns: ColumnDef<AuditLogWithUser>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Waktu" />
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
    accessorKey: "entityType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modul" />
    ),
    cell: ({ cell }) => {
      const type = cell.getValue() as string;
      return (
        <div className="ps-2">
          <Badge
            variant="secondary"
            className="text-[10px] font-bold uppercase tracking-wider"
          >
            {type}
          </Badge>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aksi" />
    ),
    cell: ({ cell }) => {
      const action = cell.getValue() as string;
      const styles = getActionStyles(action);
      return (
        <div className="ps-2">
          <Badge
            variant="outline"
            className={cn("text-[10px] font-medium py-0 h-5", styles.className)}
          >
            {styles.icon}
            {action}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "entityInfo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Objek / Keterangan" />
    ),
    cell: ({ row }) => {
      const { entityInfo, details } = row.original;
      let parsedDetails: any = null;
      try {
        if (details) parsedDetails = JSON.parse(details);
      } catch (e) {}

      return (
        <div className="ps-2 flex flex-col gap-0.5">
          <span className="text-sm font-medium leading-none">
            {entityInfo || "-"}
          </span>
          {parsedDetails?.field && (
            <span className="text-[10px] text-muted-foreground">
              Perubahan pada:{" "}
              <span className="font-mono">{parsedDetails.field}</span>
            </span>
          )}
          {parsedDetails?.message && (
            <span className="text-[10px] text-muted-foreground">
              {parsedDetails.message}
            </span>
          )}
        </div>
      );
    },
    size: 250,
  },
  {
    id: "user_info",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pengguna" />
    ),
    cell: ({ row }) => {
      const { user, ipAddress } = row.original;
      return (
        <div className="ps-2 flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {user?.name || "System"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {ipAddress || "No IP"}
          </span>
        </div>
      );
    },
    size: 180,
  },
];
