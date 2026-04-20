"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDialog } from "@/context/dialog-provider";
import { Asset } from "@/generated/prisma/client";
import { useDeleteAsset } from "@/hooks/crud/use-assets";
import { toast } from "sonner";

export function AssetDeleteDialog() {
  const { open, setOpen, currentRow } = useDialog();
  const deleteMutation = useDeleteAsset();
  const item = currentRow as Asset;

  const handleDelete = () => {
    deleteMutation.mutate(item.id, {
      onSuccess: () => {
        toast.success("Aset berhasil dihapus dari sistem.");
        setOpen(null);
      },
      onError: () => {
        toast.error("Gagal menghapus aset.");
      },
    });
  };

  return (
    <AlertDialog
      open={open === "delete"}
      onOpenChange={(val) => {
        if (!val) setOpen(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus unit aset ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Menghapus unit aset{" "}
            <span className="font-bold">{item?.kode_asset || "ini"}</span> akan
            menghilangkan data dari record inventaris.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus Permanen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
