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

import { Category } from "@/generated/prisma/client";
import { useDeleteCategory } from "@/hooks/crud/use-categories";
import { toast } from "sonner";

export function CategoryDeleteDialog() {
    const { open, setOpen, currentRow } = useDialog();
    const deleteMutation = useDeleteCategory();
    const category = currentRow as Category;

    const handleDelete = () => {
        deleteMutation.mutate(category.id, {
            onSuccess: () => {
                toast.success("Category deleted successfully");
                setOpen(null);
            },
            onError: () => {
                toast.error("Failed to delete category");
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
                        category <span className="font-bold">{category?.name}</span> and
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
