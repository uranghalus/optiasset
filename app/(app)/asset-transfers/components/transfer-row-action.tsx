import { useApproveAssetTransfer } from "@/hooks/crud/use-asset-transfers";
import { usePermission } from "@/hooks/use-permission";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Check, X } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/context/dialog-provider";

export function TransferRowActions({ row }: { row: any }) {
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
                setOpen("confirm-approve");
            }}>
                <Check className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => {
                setCurrentRow(transfer);
                setOpen("confirm-reject");
            }}>
                <X className="h-4 w-4" />
            </Button>
        </ButtonGroup>
    );
}