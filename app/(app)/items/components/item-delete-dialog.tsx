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
import { Item } from "@/generated/prisma/client";
import { useDeleteItem } from "@/hooks/crud/use-items";
import { toast } from "sonner";

export function ItemDeleteDialog() {
  const { open, setOpen, currentRow } = useDialog();
  const deleteMutation = useDeleteItem();
  const item = currentRow as Item;

  const handleDelete = () => {
    deleteMutation.mutate(item.id, {
      onSuccess: () => {
        toast.success("Item deleted successfully");
        setOpen(null);
      },
      onError: () => {
        toast.error("Failed to delete item");
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
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item{" "}
            <span className="font-bold">{item?.name}</span> from the catalog.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
