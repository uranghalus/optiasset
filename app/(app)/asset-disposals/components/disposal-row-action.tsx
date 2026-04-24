import { usePermission } from "@/hooks/use-permission";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/context/dialog-provider";
import { Row } from "@tanstack/react-table";
import { DisposalWithRelations } from "./disposal-column";
import { useActiveMemberRole } from "@/hooks/use-active-member";

export function DisposalRowActions({ row }: { row: Row<DisposalWithRelations> }) {
    const { can } = usePermission();
    const { setOpen, setCurrentRow } = useDialog();
    const { data: role } = useActiveMemberRole();
    const disposal = row.original;

    const isSpv = role?.toLowerCase() === 'spv';
    const isStaff = role?.toLowerCase() === 'staff aset';

    const canActAsSpv = isSpv && disposal.status === 'PENDING_SPV';
    const canActAsStaff = isStaff && disposal.status === 'PENDING_STAFF';

    if ((!canActAsSpv && !canActAsStaff) || !can("asset", ["edit"])) {
        return null;
    }

    return (
        <ButtonGroup>
            <Button variant="default" size="icon" onClick={() => {
                setCurrentRow(disposal);
                setOpen("approve-disposal");
            }}>
                <Check className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => {
                setCurrentRow(disposal);
                setOpen("reject-disposal");
            }}>
                <X className="h-4 w-4" />
            </Button>
        </ButtonGroup>
    );
}
