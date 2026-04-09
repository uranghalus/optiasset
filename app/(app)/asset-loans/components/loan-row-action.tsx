"use client";

import { useApproveLoan } from "@/hooks/crud/use-asset-loans";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/context/dialog-provider";
import { Row } from "@tanstack/react-table";
import { RefreshCcw, Check, X } from "lucide-react";
import React from "react";

interface LoanRowActionsProps<TData> {
  row: Row<TData>;
}

export default function LoanRowAction<TData>({
  row,
}: LoanRowActionsProps<TData>) {
  const loan = row.original as any;
  const { setOpen, setCurrentRow } = useDialog();
  const approveMutation = useApproveLoan();

  if (loan.status === "RETURNED" || loan.status === "REJECTED") return null;

  if (loan.status === "PENDING") {
    return (
      <ButtonGroup className="justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            approveMutation.mutate(loan.id);
          }}
          disabled={approveMutation.isPending}
          className="h-8 gap-1 text-green-600 border-green-200 hover:bg-green-50"
        >
          <Check className="h-3.5 w-3.5" />
          Setuju
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCurrentRow(loan);
            setOpen("reject");
          }}
          className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50"
        >
          <X className="h-3.5 w-3.5" />
          Tolak
        </Button>
      </ButtonGroup>
    );
  }

  return (
    <ButtonGroup className="justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setCurrentRow(loan);
          setOpen("complete"); // We'll use "complete" for return processing
        }}
        className="h-8 gap-1"
      >
        <RefreshCcw className="h-3.5 w-3.5" />
        Kembalikan
      </Button>
    </ButtonGroup>
  );
}
