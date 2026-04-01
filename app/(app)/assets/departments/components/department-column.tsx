"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

import { department } from "@/generated/prisma/client";
import DepartmentRowAction from "./department-row-action";

export const departmentColumns: ColumnDef<department>[] = [
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
    accessorKey: "kode_department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Department" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 font-medium">{cell.getValue() as string}</div>
    ),
    size: 150,
  },
  {
    accessorKey: "nama_department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Department" />
    ),
    cell: ({ cell }) => <div className="ps-2">{cell.getValue() as string}</div>,
    size: 200,
  },
  {
    accessorKey: "id_hod",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="HOD ID" />
    ),
    cell: ({ cell }) => <div className="ps-2">{cell.getValue() as string}</div>,
    size: 150,
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
    cell: DepartmentRowAction,
    meta: {
      className: cn(
        "sticky right-0 z-10 w-[60px] px-2",
        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted transition-colors duration-200",
      ),
    },
  },
];
