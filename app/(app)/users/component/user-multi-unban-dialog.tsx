"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/generated/prisma";
import { useUnbanManyUser } from "@/hooks/crud/use-users";
import { Table } from "@tanstack/react-table";
import { Ban } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Dipertahankan untuk validasi kata konfirmasi

type Props<TData> = {
  table: Table<TData>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CONFIRM_WORD = "UNBAN";

export default function UserMultiUnbanDialog<TData>({
  table,
  open,
  onOpenChange,
}: Props<TData>) {
  const [value, setValue] = useState("");
  const { mutateAsync: unbanUser, isPending: isPendingUnbanUser } =
    useUnbanManyUser();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedUsers = selectedRows.map((row) => row.original as User);

  const handleUnban = async () => {
    // Validasi kata konfirmasi
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    try {
      // Catatan: Jika hook useUnbanManyUser sebenarnya sudah menerima array of IDs,
      // Anda bisa langsung memanggil: await unbanUser(selectedUsers.map(u => u.id));
      // Namun di sini saya tetap mengikuti alur Promise.all sesuai kode Anda sebelumnya.
      await Promise.all(selectedUsers.map((user) => unbanUser([user.id])));

      // Jika berhasil, reset form dan tutup modal
      setValue("");
      onOpenChange(false);
      table.resetRowSelection();
    } catch (error) {
      // Error handling sudah diatur di hook Anda,
      // jadi blok catch ini bisa dibiarkan kosong atau digunakan untuk logging.
      console.error(error);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleUnban}
      isLoading={isPendingUnbanUser}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className="text-destructive">
          <Ban className="me-1 inline-block stroke-destructive" size={18} />{" "}
          Unban {selectedRows.length}{" "}
          {selectedRows.length > 1 ? "users" : "user"}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to unban the selected users? <br />
            They will regain access to the platform immediately.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span className="">Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              autoFocus
              disabled={isPendingUnbanUser}
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This action will immediately restore the accounts of all selected
              users.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Unban Users"
      destructive
    />
  );
}
