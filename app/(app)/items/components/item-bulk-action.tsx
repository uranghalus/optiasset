"use client";
import { DataTableBulkActions } from "@/components/datatable/datatable-bulk-action";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDialog } from "@/context/dialog-provider";
import { Asset, Item } from "@/generated/prisma";
import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { ItemMultiDeleteDialog } from "./item-multi-delete-dialog";

interface ItemBulkActionProps<TData> {
  table: Table<TData>;
}

export function ItemBulkAction<TData>({ table }: ItemBulkActionProps<TData>) {
  const { open, setOpen } = useDialog();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedItems = selectedRows.map((row) => row.original as Item);

  const handleOpenDelete = () => {
    if (selectedItems.length === 0) return;
    setOpen("delete-item");
  };
  return (
    <>
      <DataTableBulkActions table={table} entityName="item">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="size-8"
              onClick={handleOpenDelete}
              aria-label="Delete selected items"
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete selected items</TooltipContent>
        </Tooltip>
      </DataTableBulkActions>
      <ItemMultiDeleteDialog
        open={open === "delete-item"}
        onOpenChange={(value) => setOpen("delete-item")}
        table={table}
      />
    </>
  );
}
