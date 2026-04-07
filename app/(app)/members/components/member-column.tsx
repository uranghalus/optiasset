"use client";

import { ColumnDef } from "@tanstack/react-table";
// Wait! It's from @tanstack/react-table
import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import MemberRowActions from "./member-row-action";

export const memberColumns: any[] = [
  /* =====================
     * USER INFO (Avatar + Name + Email)
     ===================== */
  {
    accessorKey: "user.name",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }: any) => {
      const member = row.original;
      const user = member.user;
      if (!user) return <span className="text-muted-foreground">Unknown</span>;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image ?? ""} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
    meta: {
      thClassName: "w-[200px]",
    },
  },

  /* =====================
     * ROLE
     ===================== */
  {
    accessorKey: "role",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ cell }: any) => {
      const val = cell.getValue();
      if (!val) return <span className="text-muted-foreground">-</span>;

      const roles = val.split(",").map((r: string) => r.trim());
      return (
        <div className="flex items-center flex-wrap gap-1">
          {roles.map((r: string, i: number) => (
            <div
              key={i}
              className="flex items-center gap-1 border px-2 py-0.5 rounded-md bg-muted/50 text-xs"
            >
              <ShieldCheck className="h-3 w-3 text-muted-foreground" />
              <span className="capitalize">{r}</span>
            </div>
          ))}
        </div>
      );
    },
    size: 200,
  },

  /* =====================
     * DEPARTMENT
     ===================== */
  {
    accessorKey: "department.nama_department",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    cell: ({ row }: any) => {
      const deptName = row.original.department?.nama_department;
      return deptName ? (
        <span>{deptName}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
    size: 150,
  },

  /* =====================
     * DIVISI
     ===================== */
  {
    accessorKey: "divisi.nama_divisi",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Divisi" />
    ),
    cell: ({ row }: any) => {
      const divName = row.original.divisi?.nama_divisi;
      return divName ? (
        <span>{divName}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
    size: 150,
  },

  /* =====================
     * ACTIONS
     ===================== */
  {
    id: "actions",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Aksi" className="ml-auto" />
    ),
    cell: MemberRowActions,
    size: 56,
    enableResizing: false,
    meta: {
      className: cn(
        "sticky right-0 z-10",
        "bg-background group-hover/row:bg-muted",
        "group-data-[state=selected]/row:bg-muted transition-colors",
      ),
    },
  },
];
