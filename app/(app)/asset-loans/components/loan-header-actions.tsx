"use client";

import { Button } from "@/components/ui/button";
import { useDialog } from "@/context/dialog-provider";
import { FilePlus } from "lucide-react";
import React from "react";
import { LoanRequestDialog } from "./loan-request-dialog";

export default function LoanHeaderActions() {
  const { open, setOpen } = useDialog();

  return (
    <>
      <Button className="h-9 gap-2" onClick={() => setOpen("loan-request")}>
        <FilePlus className="h-4 w-4" />
        Buat Pengajuan
      </Button>

      <LoanRequestDialog
        open={open === "loan-request"}
        onOpenChange={(v) => setOpen(v ? "loan-request" : (null as any))}
      />
    </>
  );
}
