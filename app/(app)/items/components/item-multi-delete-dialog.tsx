"use client";
import { toast } from "sonner";
import { Table } from "@tanstack/react-table";
import { Asset, Item } from "@/generated/prisma";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDeleteManyItems } from "@/hooks/crud/use-items";

interface ItemMultiDeleteDialogProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
}
const CONFIRM_WORD = "DELETE";
export function ItemMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: ItemMultiDeleteDialogProps<TData>) {
  const { mutateAsync: deleteManyItemMutation, isPending } =
    useDeleteManyItems();
  const [value, setValue] = useState("");
  const selectedItems = table.getFilteredSelectedRowModel().rows;
  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    // Ekstrak ID dari baris yang dipilih
    const selectedIds = selectedItems.map((row) => (row.original as Item).id);
    try {
      await deleteManyItemMutation(selectedIds);
      // Jika berhasil, reset state dan tutup modal
      setValue("");
      onOpenChange(false);
      table.resetRowSelection();
    } catch (error) {
      toast.error("Failed to delete items");
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      // Gunakan handleConfirm sebagai ganti form onSubmit
      handleConfirm={handleDelete}
      // Gunakan isLoading bawaan dari ConfirmDialog Anda
      isLoading={isPending}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="me-1 inline-block stroke-destructive"
            size={18}
          />{" "}
          Delete {selectedItems.length}{" "}
          {selectedItems.length > 1 ? "items" : "item"}
        </span>
      }
      desc={
        // Ganti <form> menjadi <div> karena submit diatur oleh handleConfirm
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete the selected items? <br />
            This action cannot be undone.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span className="">Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              autoFocus
              disabled={isPending}
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  );
}
