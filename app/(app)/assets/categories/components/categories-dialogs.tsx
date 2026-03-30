'use client'
import { useDialog } from '@/context/dialog-provider';
import React from 'react'
import { CategoryActionDialog } from './category-action-dialog';
import { Category } from '@/generated/prisma/client';
import { CategoryDeleteDialog } from './categories-delete-dialog';

export default function CategoriesDialog() {
    const { currentRow, open, setCurrentRow, setOpen } = useDialog();
    return (
        <>
            <CategoryActionDialog
                key="category-add"
                open={open === "add"}
                onOpenChange={() => setOpen("add")}
            />
            {currentRow && (<>
                <CategoryActionDialog
                    key={`category-edit-${(currentRow as Category).id}`}
                    open={open === "edit"}
                    currentRow={currentRow as Category}
                    onOpenChange={() => {
                        setOpen("edit");
                        setCurrentRow(undefined);
                    }}
                />
                <CategoryDeleteDialog
                    key={`category-delete-${(currentRow as Category).id}`}
                />
            </>)}
        </>
    )
}
