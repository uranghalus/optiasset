'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useApproveDisposal } from "@/hooks/crud/use-asset-disposals";
import { DisposalWithRelations } from "./disposal-column";
import { Blocks, Trash2, User } from "lucide-react";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { useActiveMemberRole } from "@/hooks/use-active-member";
import { Badge } from "@/components/ui/badge";

type ApprovalAction = "approve" | "reject";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow?: DisposalWithRelations;
    action: ApprovalAction;
};

const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING_SPV: { label: 'Pending SPV', className: 'bg-yellow-100 text-yellow-700' },
    PENDING_STAFF: { label: 'Pending Staff Aset', className: 'bg-blue-100 text-blue-700' },
    APPROVED: { label: 'Disetujui', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Ditolak', className: 'bg-red-100 text-red-700' },
};

export function DisposalApprovalDialog({
    open,
    onOpenChange,
    currentRow,
    action,
}: Props) {
    const { mutate: approveDisposal, isPending } = useApproveDisposal();
    const { data: role } = useActiveMemberRole();

    const isApprove = action === "approve";

    const handleConfirm = () => {
        if (!currentRow?.id || !role) return;

        approveDisposal(
            {
                id: currentRow.id,
                action: isApprove ? 'APPROVE' : 'REJECT',
                role,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    const status = currentRow?.status ?? '';
    const statusInfo = statusConfig[status];

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isApprove
                            ? "Konfirmasi Persetujuan Penghapusan"
                            : "Konfirmasi Penolakan Penghapusan"}
                    </DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin{" "}
                        {isApprove ? "menyetujui" : "menolak"}{" "}
                        pengajuan penghapusan aset ini?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Item variant={'outline'}>
                        <ItemMedia variant={'icon'}>
                            <Blocks className="h-4 w-4" />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>
                                Nama Asset
                            </ItemTitle>
                            <ItemDescription>
                                <span className="flex flex-col items-start gap-0.5 p-1 border border-gray-200">
                                    <span className="block text-sm font-medium text-primary">
                                        {currentRow?.asset.item.name}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        Kode Aset : {currentRow?.asset.kode_asset || "-"}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        {currentRow?.asset.brand || "-"} - {currentRow?.asset.model || "-"}
                                    </span>
                                </span>
                            </ItemDescription>
                        </ItemContent>
                    </Item>

                    <Item variant={'outline'}>
                        <ItemMedia variant={'icon'}>
                            <Trash2 className="h-4 w-4" />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>
                                Alasan Penghapusan
                            </ItemTitle>
                            <ItemDescription>
                                {currentRow?.reason || "-"}
                            </ItemDescription>
                        </ItemContent>
                    </Item>

                    <Item variant={'outline'}>
                        <ItemMedia variant={'icon'}>
                            <User className="h-4 w-4" />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>
                                Diajukan Oleh
                            </ItemTitle>
                            <ItemDescription>
                                {currentRow?.requestedBy?.name || "-"}
                            </ItemDescription>
                        </ItemContent>
                    </Item>

                    {statusInfo && (
                        <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs text-muted-foreground">Status saat ini:</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusInfo.className}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>

                    <Button
                        onClick={handleConfirm}
                        disabled={isPending}
                        variant={isApprove ? "default" : "destructive"}
                    >
                        {isPending
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
