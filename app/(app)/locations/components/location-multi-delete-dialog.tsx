"use client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Location } from "@/generated/prisma";
import { useDeleteManyLocation } from "@/hooks/crud/use-locations";
import { Table } from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
interface LocationMultiDeleteDialogProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
}
const CONFIRM_WORD = "DELETE";
function LocationMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: LocationMultiDeleteDialogProps<TData>) {
  const { mutateAsync: deleteManyLocation, isPending } =
    useDeleteManyLocation();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => (row.original as Location).id);
  const [value, setValue] = useState("");
  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }
    // Ekstrak ID dari baris yang dipil
    try {
      await deleteManyLocation(selectedIds);
      // Jika berhasil, reset state dan tutup modal
      setValue("");
      onOpenChange(false);
      table.resetRowSelection();
    } catch (error) {
      toast.error("Failed to delete locations");
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
          Delete {selectedIds.length}{" "}
          {selectedIds.length > 1 ? "locations" : "location"}
        </span>
      }
      desc={
        // Ganti <form> menjadi <div> karena submit diatur oleh handleConfirm
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete the selected location? <br />
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

export default LocationMultiDeleteDialog;
