"use client";
import React, { useState } from "react";
import { DataTableBulkActions } from "@/components/datatable/datatable-bulk-action";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Ban, Check, Trash2 } from "lucide-react";
import { User } from "@/generated/prisma";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UsersMultiDeleteDialog } from "./user-multi-delete-dialog";
import UserMultiBanDialog from "./user-multi-ban-dialog";
import { useDialog } from "@/context/dialog-provider";
import UserMultiUnbanDialog from "./user-multi-unban-dialog";
type Props<TData> = {
  table: Table<TData>;
};
export default function UserBulkAction<TData>({ table }: Props<TData>) {
  const { open, setOpen } = useDialog();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedUsers = selectedRows.map((row) => row.original as User);

  const handleOpenDelete = () => {
    if (selectedUsers.length === 0) return;
    setOpen("delete");
  };
  const handleOpenBan = () => {
    if (selectedUsers.length === 0) return;
    setOpen("ban-multi");
  };
  const handleOpenUnban = () => {
    if (selectedUsers.length === 0) return;
    setOpen("unban-multi");
  };
  return (
    <>
      <DataTableBulkActions table={table} entityName="user">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="size-8"
              onClick={handleOpenDelete}
              aria-label="Delete selected roles"
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete selected roles</TooltipContent>
        </Tooltip>
        {selectedUsers.some((user) => user.banned !== true) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={handleOpenBan}
                aria-label="Ban selected users"
              >
                <Ban />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ban selected users</TooltipContent>
          </Tooltip>
        )}
        {selectedUsers.some((user) => user.banned === true) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={handleOpenUnban}
                aria-label="Unban selected users"
              >
                <Check />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unban selected users</TooltipContent>
          </Tooltip>
        )}
      </DataTableBulkActions>
      <UserMultiUnbanDialog
        open={open === "unban-multi"}
        onOpenChange={(value) => setOpen("unban-multi")}
        table={table}
      />
      <UserMultiBanDialog
        open={open === "ban-multi"}
        onOpenChange={(value) => setOpen("ban-multi")}
        table={table}
      />
      <UsersMultiDeleteDialog
        open={open === "delete"}
        onOpenChange={(value) => setOpen("delete")}
        table={table}
      />
    </>
  );
}
