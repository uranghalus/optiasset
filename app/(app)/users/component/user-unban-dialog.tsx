
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User } from "@/generated/prisma";
import { useUnbanUser } from "@/hooks/crud/use-users";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: User;
};


export default function UserUnbanDialog({ open, onOpenChange, currentRow }: Props) {

  const { mutate: unbanUser, isPending } = useUnbanUser();

  const handleUnban = () => {
    if (!currentRow) return;
    unbanUser(currentRow.id);
    onOpenChange(false);
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(val: any) => {
        if (!val) onOpenChange(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Batalkan Banned User?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin memulihkan akun{" "}
            <span className="font-bold">{currentRow?.name}</span>? Tindakan ini akan
            menghapus status banned dan user dapat kembali login ke dalam sistem.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnban}
            disabled={isPending}
          // Class bg-destructive dihilangkan karena ini bukan aksi delete/bahaya
          >
            {isPending ? "Memproses..." : "Unban User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
