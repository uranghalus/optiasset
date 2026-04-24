'use client'

import { useDialog } from "@/context/dialog-provider";
import { TransferApprovalDialog } from "./transfer-aproval-dialog";
import { TransferWithRelations } from "./transfer-column";

export default function TransferDialog() {
    const {
        currentRow,
        open,
        setOpen,
        setCurrentRow
    } = useDialog();

    const handleClose = () => {
        setOpen(null);
        setCurrentRow(null);
    };

    return (
        <>
            <TransferApprovalDialog
                open={open === "approve-transfer"}
                currentRow={currentRow as TransferWithRelations}
                action="approve"
                onOpenChange={(isOpen) => {
                    if (!isOpen) handleClose();
                }}
            />

            <TransferApprovalDialog
                open={open === "reject-transfer"}
                currentRow={currentRow as TransferWithRelations}
                action="reject"
                onOpenChange={(isOpen) => {
                    if (!isOpen) handleClose();
                }}
            />
        </>
    );
}