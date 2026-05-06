"use client";
import { useDeleteManyAsset } from "@/hooks/crud/use-assets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Table } from "@tanstack/react-table";
import { Asset } from "@/generated/prisma";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AssetMultiDeleteDialogProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
}
const CONFIRM_WORD = "DELETE";
export function AssetMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: AssetMultiDeleteDialogProps<TData>) {
  const queryClient = useQueryClient();
  const { mutateAsync: deleteManyAssetMutation, isPending } =
    useDeleteManyAsset();
  const [value, setValue] = useState("");
  const selectedAssets = table.getFilteredSelectedRowModel().rows;
  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    // Ekstrak ID dari baris yang dipilih
    const selectedIds = selectedAssets.map((row) => (row.original as Asset).id);
    try {
      await deleteManyAssetMutation(selectedIds);
      // Jika berhasil, reset state dan tutup modal
      setValue("");
      onOpenChange(false);
      table.resetRowSelection();
    } catch (error) {
      toast.error("Failed to delete assets");
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
          Delete {selectedAssets.length}{" "}
          {selectedAssets.length > 1 ? "assets" : "asset"}
        </span>
      }
      desc={
        // Ganti <form> menjadi <div> karena submit diatur oleh handleConfirm
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete the selected assets? <br />
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
