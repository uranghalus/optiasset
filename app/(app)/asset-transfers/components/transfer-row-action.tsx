import { usePermission } from "@/hooks/use-permission";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/context/dialog-provider";
import { Row } from "@tanstack/react-table";
import { TransferWithRelations } from "./transfer-column";

export function TransferRowActions({ row }: { row: Row<TransferWithRelations> }) {
    const { can } = usePermission();
    const { setOpen, setCurrentRow } = useDialog();
    const transfer = row.original;

    // HOD or higher can approve
    if (transfer.status !== "PENDING" || !can("asset", ["edit"])) {
        return null; // or show view details
    }

    return (
        <ButtonGroup>
            <Button variant="default" size="icon" onClick={() => {
                setCurrentRow(transfer);
                setOpen("approve-transfer");
            }}>
                <Check className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => {
                setCurrentRow(transfer);
                setOpen("reject-transfer");
            }}>
                <X className="h-4 w-4" />
            </Button>
        </ButtonGroup>
    );
}