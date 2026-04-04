"use client";
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { useDialog } from '@/context/dialog-provider';
import { organizationRole } from '@/generated/prisma/client';
import { Row } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import React from 'react'

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
}
export default function RoleRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const role = row.original as organizationRole;
    const { setOpen, setCurrentRow } = useDialog();

    return (
        <ButtonGroup>
            <Button variant="destructive" size="icon" onClick={() => {
                setCurrentRow(role);
                setOpen("delete");
            }}>
                <Trash2 />
            </Button>
            <Button variant="outline" size="icon" onClick={() => {
                setCurrentRow(role);
                setOpen("edit");
            }}>
                <Pencil />
            </Button>
            {/* <Button variant="outline" size="icon">
                <Eye />
            </Button> */}
        </ButtonGroup>
    )
}
