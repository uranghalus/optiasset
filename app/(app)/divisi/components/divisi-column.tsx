"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { divisi } from "@/generated/prisma/client";
import DivisiRowAction from "./divisi-row-action";

type DivisiWithDepartment = divisi & {
  department?: {
    nama_department: string;
    kode_department: string;
  };
};

export const divisiColumns: ColumnDef<DivisiWithDepartment>[] = [
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
    accessorKey: "nama_divisi",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Divisi" />
    ),
    cell: ({ cell }) => (
      <div className="ps-2 font-medium">{cell.getValue() as string}</div>
    ),
    size: 200,
  },
  {
    id: "department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    cell: ({ row }) => {
      const dept = row.original.department;
      return (
        <div className="ps-2">
          {dept ? `${dept.kode_department} - ${dept.nama_department}` : "-"}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "ext_tlp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ext. Telepon" />
    ),
    cell: ({ cell }) => <div className="ps-2">{cell.getValue() as string}</div>,
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
    cell: DivisiRowAction,
    meta: {
      className: cn(
        "sticky right-0 z-10 w-[60px] px-2",
        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted transition-colors duration-200",
      ),
    },
  },
];
