'use client'
import { useDialog } from '@/context/dialog-provider';
import React from 'react'
import { CategoryActionDialog } from './category-action-dialog';
import { Category } from '@/generated/prisma/client';
import { CategoryDeleteDialog } from './categories-delete-dialog';
import CategoryImportDialog from './categories-import-dialog';

export default function CategoriesDialog() {
    const { currentRow, open, setCurrentRow, setOpen } = useDialog();
    return (
        <>
            <CategoryActionDialog
                key="category-add"
                open={open === "add-category"}
                onOpenChange={() => setOpen("add-category")}
            />
            <CategoryImportDialog
                key="category-import"
                open={open === "import-category"}
                onOpenChange={() => setOpen("import-category")}
            />
            {currentRow && (<>
                <CategoryActionDialog
                    key={`category-edit-${(currentRow as Category).id}`}
                    open={open === "edit-category"}
                    currentRow={currentRow as Category}
                    onOpenChange={() => {
                        setOpen("edit-category");
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
