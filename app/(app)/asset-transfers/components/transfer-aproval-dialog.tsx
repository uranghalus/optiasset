'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useDialog } from "@/context/dialog-provider";
import { useApproveAssetTransfer } from "@/hooks/crud/use-asset-transfers";
import { Button } from "@/components/ui/button";
import { Asset } from "@/generated/prisma/client";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow?: Asset;
};

export function TransferApprovalDialog({ open, onOpenChange, currentRow }: Props) {
    const { mutate: approveTransfer, isPending: isPendingApprove } = useApproveAssetTransfer();

    const handleConfirm = () => {
        if (currentRow?.id && open === "confirm-approve") {
            approveTransfer({ id: currentRow.id, status: "APPROVED" });
        } else if (currentRow?.id && open === "confirm-reject") {
            approveTransfer({ id: currentRow.id, status: "REJECTED" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={ }>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isApprove ? "Konfirmasi Persetujuan" : "Konfirmasi Penolakan"}
                    </DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin {
                            isApprove ? "menyetujui" : "menolak"
                        } mutasi aset ini?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        variant={isApprove ? "default" : "destructive"}
                        onClick={handleConfirm}
                        disabled={isPendingApprove || isPendingReject}
                    >
                        {isPendingApprove || isPendingReject
                            ? "Memproses..."
                            : isApprove
                                ? "Setujui"
                                : "Tolak"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}