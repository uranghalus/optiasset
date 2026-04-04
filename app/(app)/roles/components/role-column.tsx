import { DataTableColumnHeader } from "@/components/datatable/datatable-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { organizationRole } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { Column, ColumnDef } from "@tanstack/react-table";
import RoleRowActions from "./role-row-action";

/* =========================
   HELPERS
========================= */
function parsePermission(
    permission?: string | Record<string, any> | null,
): Record<string, string[]> {
    if (!permission) return {};
    if (typeof permission === "object") {
        return permission as Record<string, string[]>;
    }
    try {
        return JSON.parse(permission);
    } catch {
        return {};
    }
}
/* =========================
   COLUMNS
========================= */
export const roleColumns: ColumnDef<organizationRole>[] = [
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
        size: 10,
    },

    /* =====================
       * ROLE
       ===================== */
    {
        accessorKey: "role",
        header: ({ column }: { column: Column<organizationRole, unknown> }) => (
            <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ cell }) => (
            <div className="font-medium ps-2 capitalize">
                {cell.getValue<organizationRole["role"]>()}
            </div>
        ),
        size: 140,
    },

    /* =====================
       * PERMISSION
       ===================== */
    {
        id: "permission",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Permission" />
        ),
        accessorFn: (row) => row.permission,
        cell: ({ row }) => {
            const permissionObj = parsePermission(row.original.permission);

            const total = Object.values(permissionObj).reduce(
                (acc, actions) => acc + actions.length,
                0,
            );

            return (
                <div className="ps-2 text-sm text-muted-foreground">
                    {total} permission{total !== 1 ? "s" : ""}
                </div>
            );
        },
        meta: {
            thClassName: "w-full",
            tdClassName: "w-full",
        },
    },

    /* =====================
       * CREATED AT
       ===================== */
    {
        accessorKey: "createdAt",
        header: ({ column }: { column: Column<organizationRole, unknown> }) => (
            <DataTableColumnHeader column={column} title="Tanggal Dibuat" />
        ),
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
        size: 140,
    },

    /* =====================
       * ACTIONS
       ===================== */
    {
        id: "actions",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Aksi" className="ml-auto" />
        ),
        size: 48,
        minSize: 48,
        maxSize: 48,
        enableResizing: false,
        cell: RoleRowActions,
        meta: {
            className: cn(
                "sticky right-0 z-10 w-[60px] px-2",
                "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted transition-colors duration-200",
            ),
        },
    },
];