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

import { department } from "@/generated/prisma/client";
import { useDeleteDepartment } from "@/hooks/crud/use-department";
import { toast } from "sonner";

export function DepartmentDeleteDialog() {
  const { open, setOpen, currentRow } = useDialog();
  const deleteMutation = useDeleteDepartment();
  const item = currentRow as department;

  const handleDelete = () => {
    deleteMutation.mutate(item.id_department, {
      onSuccess: () => {
        toast.success("Department deleted successfully");
        setOpen(null);
      },
      onError: () => {
        toast.error("Failed to delete department");
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
            This action cannot be undone. This will permanently delete the
            department{" "}
            <span className="font-bold">{item?.nama_department}</span> and
            remove it from our servers.
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
