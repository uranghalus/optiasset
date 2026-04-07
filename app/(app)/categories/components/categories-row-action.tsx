"use client";
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { useDialog } from '@/context/dialog-provider';
import { Category } from '@/generated/prisma/client';
import { Row } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import React from 'react'

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
}
export default function CategoriesRowAction<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const category = row.original as Category;
    const { setOpen, setCurrentRow } = useDialog();

    return (
        <ButtonGroup>
            <Button variant="destructive" size="icon" onClick={() => {
                setCurrentRow(category);
                setOpen("delete");
            }}>
                <Trash2 />
            </Button>
            <Button variant="outline" size="icon" onClick={() => {
                setCurrentRow(category);
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
