"use client";

import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDeleteManyUser } from "@/hooks/crud/use-users";
import { User } from "@/generated/prisma";

type UserMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

const CONFIRM_WORD = "DELETE";

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: UserMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("");

  // Panggil hook TanStack Query
  const { mutateAsync, isPending } = useDeleteManyUser();

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleDelete = async () => {
    // Validasi kata konfirmasi
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    // Ekstrak ID dari baris yang dipilih
    const selectedIds = selectedRows.map((row) => (row.original as User).id);

    // Gunakan mutateAsync sebagai ganti sleep() di dalam toast.promise
    try {
      // Eksekusi semua request delete
      await mutateAsync(selectedIds);

      // Jika berhasil, reset state dan tutup modal
      setValue("");
      onOpenChange(false);
      table.resetRowSelection();
    } catch (error) {
      // Error logging (toast error sudah ditangani oleh hooks Anda)
      console.error(error);
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
          Delete {selectedRows.length}{" "}
          {selectedRows.length > 1 ? "users" : "user"}
        </span>
      }
      desc={
        // Ganti <form> menjadi <div> karena submit diatur oleh handleConfirm
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete the selected users? <br />
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
