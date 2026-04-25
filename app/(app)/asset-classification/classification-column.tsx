"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { cn } from "@/lib/utils";


import { Prisma } from "@/generated/prisma/client";
import ClassificationRowAction from "./classification-row-action";
export const assetGroupWithRelationsInclude = {
    categories: {
        include: {
            assetClusters: {
                include: {
                    assetSubClusters: true
                }
            }
        }
    }
} satisfies Prisma.AssetGroupInclude;
export type AssetGroupWithRelations =
    Prisma.AssetGroupGetPayload<{
        include: typeof assetGroupWithRelationsInclude
    }>;

export const classificationColumns:
    ColumnDef<AssetGroupWithRelations>[] = [

        /* =======================
         SELECT
        ======================= */
        {
            id: "select",

            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (
                            table.getIsSomePageRowsSelected()
                            && "indeterminate"
                        )
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(
                            !!value
                        )
                    }
                />
            ),

            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) =>
                        row.toggleSelected(
                            !!value
                        )
                    }
                />
            ),

            enableSorting: false,
            enableHiding: false,
            size: 40
        },



        /* =======================
         CODE
        ======================= */
        {
            accessorKey: "code",

            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Kode"
                />
            ),

            cell: ({ cell }) => (
                <div className="ps-2 font-mono text-xs">
                    {(cell.getValue() as string) || "-"}
                </div>
            ),

            size: 120
        },



        /* =======================
         GROUP NAME
        ======================= */
        {
            accessorKey: "name",

            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Golongan Aset"
                />
            ),

            cell: ({ row }) => {

                const group = row.original;

                return (
                    <div className="ps-2 flex flex-col">
                        <span className="font-medium">
                            {group.name}
                        </span>

                        <span className="
       text-xs
       text-muted-foreground
       italic
      ">
                            {group.description || "-"}
                        </span>

                    </div>
                )

            },

            size: 250
        },



        /* =======================
         CATEGORY COUNT
        ======================= */
        {
            id: "categoryCount",

            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Kategori"
                />
            ),

            cell: ({ row }) => (

                <div className="ps-2">
                    <Badge variant="outline">
                        {row.original.categories.length}
                    </Badge>
                </div>

            ),

            size: 100
        },



        /* =======================
         CLUSTER COUNT
        ======================= */
        {
            id: "clusterCount",

            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Kelompok"
                />
            ),

            cell: ({ row }) => {

                const total =
                    row.original.categories.reduce(
                        (sum, cat) =>
                            sum + cat.assetClusters.length,
                        0
                    );

                return (
                    <div className="ps-2">
                        <Badge variant="outline">
                            {total}
                        </Badge>
                    </div>
                )

            },

            size: 100
        },



        /* =======================
         SUB CLUSTER COUNT
        ======================= */
        {
            id: "subCount",

            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Sub"
                />
            ),

            cell: ({ row }) => {

                const total =
                    row.original.categories.reduce(
                        (sum, cat) =>
                            sum +
                            cat.assetClusters.reduce(
                                (s, c) =>
                                    s +
                                    c.assetSubClusters.length,
                                0
                            ),
                        0
                    );

                return (
                    <div className="ps-2">
                        <Badge variant="outline">
                            {total}
                        </Badge>
                    </div>
                )

            },

            size: 80
        },



        /* =======================
         STATUS FILTER
        ======================= */
        {
            accessorKey: "status",
            filterFn: "arrIncludesSome",

            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Status"
                />
            ),

            cell: ({ cell }) => {

                const status =
                    cell.getValue() as string;

                return (
                    <div className="ps-2">
                        <Badge
                            variant="outline"
                            className={cn(
                                status === "ACTIVE"
                                && "border-green-500 text-green-500",

                                status === "ARCHIVED"
                                && "border-muted-foreground"
                            )}
                        >
                            {status}
                        </Badge>
                    </div>
                )

            },

            size: 100
        },



        /* =======================
         ACTIONS
        ======================= */
        {
            id: "actions",

            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Action"
                />
            ),

            size: 60,

            enableResizing: false,

            cell: ClassificationRowAction,

            meta: {
                className: cn(
                    "sticky right-0 z-10 px-2",
                    "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted"
                )
            }

        }

    ];