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

import { Organization } from "@/generated/prisma/client";
import { useDeleteOrganization } from "@/hooks/crud/use-organizations";
import { toast } from "sonner";

export function OrganizationDeleteDialog() {
  const { open, setOpen, currentRow } = useDialog();
  const deleteMutation = useDeleteOrganization();
  const organization = currentRow as Organization;

  const handleDelete = () => {
    deleteMutation.mutate(organization.id, {
      onSuccess: () => {
        toast.success("Organization deleted successfully");
        setOpen(null);
      },
      onError: () => {
        toast.error("Failed to delete organization");
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
            organization <span className="font-bold">{organization?.name}</span>{" "}
            and remove it from our servers.
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
