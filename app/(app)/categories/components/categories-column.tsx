"use client";

import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";


// import { CategoryRowActions } from "./category-row-action";
import { Category } from "@/generated/prisma/client";
import CategoriesRowAction from "./categories-row-action";

// Extended type to include count
type AssetCategoryWithCount = Category & {
    _count?: {
        assets: number;
    };
};

export const categoryColumns: ColumnDef<AssetCategoryWithCount>[] = [
    /* =====================
       * SELECT
       ===================== */
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

    /* =====================
       * NAME
       ===================== */
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Category Name" />
        ),
        cell: ({ cell }) => (
            <div className="ps-2 font-medium">{cell.getValue() as string}</div>
        ),
        size: 200,
    },
    /* =====================
       * ASSETS COUNT
       ===================== */
    {
        id: "assets_count",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Assets" />
        ),
        cell: ({ row }) => (
            <div className="ps-2">{row.original._count?.assets ?? 0}</div>
        ),
        size: 100,
    },

    /* =====================
       * ACTIONS
       ===================== */
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
        cell: CategoriesRowAction,
        meta: {
            className: cn(
                "sticky right-0 z-10 w-[60px] px-2",
                "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted transition-colors duration-200",
            ),
        },
    },
];
