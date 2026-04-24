'use client';

import { useDialog } from "@/context/dialog-provider";
import { DisposalApprovalDialog } from "./disposal-approval-dialog";
import { DisposalWithRelations } from "./disposal-column";

export default function DisposalDialog() {
    const {
        currentRow,
        open,
        setOpen,
        setCurrentRow,
    } = useDialog();

    const handleClose = () => {
        setOpen(null);
        setCurrentRow(null);
    };

    return (
        <>
            <DisposalApprovalDialog
                open={open === "approve-disposal"}
                currentRow={currentRow as DisposalWithRelations}
                action="approve"
                onOpenChange={(isOpen) => {
                    if (!isOpen) handleClose();
                }}
            />

            <DisposalApprovalDialog
                open={open === "reject-disposal"}
                currentRow={currentRow as DisposalWithRelations}
                action="reject"
                onOpenChange={(isOpen) => {
                    if (!isOpen) handleClose();
                }}
            />
        </>
    );
}
