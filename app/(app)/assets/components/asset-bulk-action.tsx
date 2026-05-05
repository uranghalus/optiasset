"use client";
import { DataTableBulkActions } from "@/components/datatable/datatable-bulk-action";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDialog } from "@/context/dialog-provider";
import { Asset } from "@/generated/prisma";
import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { AssetMultiDeleteDialog } from "./asset-multi-delete-dialog";

interface AssetBulkActionProps<TData> {
  table: Table<TData>;
}

export function AssetBulkAction<TData>({ table }: AssetBulkActionProps<TData>) {
  const { open, setOpen } = useDialog();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedAssets = selectedRows.map((row) => row.original as Asset);

  const handleOpenDelete = () => {
    if (selectedAssets.length === 0) return;
    setOpen("delete");
  };
  return (
    <>
      <DataTableBulkActions table={table} entityName="asset">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="size-8"
              onClick={handleOpenDelete}
              aria-label="Delete selected assets"
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete selected assets</TooltipContent>
        </Tooltip>
      </DataTableBulkActions>
      <AssetMultiDeleteDialog
        open={open === "delete"}
        onOpenChange={(value) => setOpen("delete")}
        table={table}
      />
    </>
  );
}
