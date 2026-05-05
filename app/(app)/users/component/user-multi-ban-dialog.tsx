"use client";

import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { Ban } from "lucide-react";
import { toast } from "sonner";

import { User } from "@/generated/prisma";
import { useBanUser } from "@/hooks/crud/use-users";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Props<TData> = {
  table: Table<TData>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CONFIRM_WORD = "BAN";

export default function UserMultiBanDialog<TData>({
  table,
  open,
  onOpenChange,
}: Props<TData>) {
  const [value, setValue] = useState("");
  // State baru untuk mengatur jumlah hari, default kita set ke 7 hari
  const [banDays, setBanDays] = useState<number>(7);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const { mutateAsync: banUser, isPending: isPendingBanUser } = useBanUser();

  const handleBan = async () => {
    // Validasi konfirmasi teks
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    // Validasi jumlah hari
    if (banDays < 1 || isNaN(banDays)) {
      toast.error("Please enter a valid ban duration (minimum 1 day).");
      return;
    }

    const selectedIds = selectedRows.map((row) => (row.original as User).id);

    try {
      const banPromises = selectedIds.map((id) =>
        banUser({
          id: id,
          data: {
            banReason: "Bulk banned by admin",
            banExpiresInDays: banDays,
          },
        }),
      );

      // Eksekusi semua request ban
      await Promise.all(banPromises);

      // Jika berhasil, jalankan reset state dan tutup modal
      setValue("");
      setBanDays(7); // Kembalikan ke default setelah sukses
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
      handleConfirm={handleBan}
      isLoading={isPendingBanUser}
      // Disable tombol jika konfirmasi salah, atau sedang loading, atau jumlah hari tidak valid
      disabled={value.trim() !== CONFIRM_WORD || banDays < 1 || isNaN(banDays)}
      title={
        <span className="text-destructive">
          <Ban className="me-1 inline-block stroke-destructive" size={18} /> Ban{" "}
          {selectedRows.length} {selectedRows.length > 1 ? "users" : "user"}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to ban the selected users? <br />
            They will temporarily lose access to the platform for the specified
            duration.
          </p>

          {/* Input baru untuk menentukan durasi ban */}
          <Label className="flex flex-col items-start gap-1.5">
            <span>Ban Duration (Days):</span>
            <Input
              type="number"
              min={1}
              value={banDays || ""}
              onChange={(e) => setBanDays(parseInt(e.target.value, 10))}
              placeholder="e.g., 7"
              disabled={isPendingBanUser}
            />
          </Label>

          {/* Input konfirmasi */}
          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span className="">Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              autoFocus
              disabled={isPendingBanUser}
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This action will immediately restrict the accounts of all selected
              users for {banDays || 0} days.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Ban Users"
      destructive
    />
  );
}
