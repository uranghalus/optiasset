"use client";

import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/context/dialog-provider";
import { Row } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

interface MemberRowActionsProps<TData> {
  row: Row<TData>;
}
export default function MemberRowActions<TData>({
  row,
}: MemberRowActionsProps<TData>) {
  const { setOpen, setCurrentRow } = useDialog();
  const member = row.original;
  return (
    <ButtonGroup>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => {
          setCurrentRow(member);
          setOpen("delete");
        }}
      >
        <Trash2 />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          setCurrentRow(member);
          setOpen("edit");
        }}
      >
        <Pencil />
      </Button>
    </ButtonGroup>
  );
}
