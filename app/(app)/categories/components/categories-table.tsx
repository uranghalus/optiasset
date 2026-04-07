'use client'
import { useCategories } from '@/hooks/crud/use-categories';
import React, { useState } from 'react'
import { categoryColumns } from './categories-column';
import { useDataTable } from '@/hooks/use-data-table';
import { Category } from '@/generated/prisma/client';
import { DataTableToolbar } from '@/components/datatable/datatable-toolbar';
import { DataTable } from '@/components/datatable/data-table';
import { DataTablePagination } from '@/components/datatable/datatable-pagination';
import { useDialog } from '@/context/dialog-provider';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CategoriesTable() {
    const { setOpen } = useDialog();
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const { data, isLoading } = useCategories({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
    })
    const { table } = useDataTable({
        data: (data?.data ?? []) as Category[],
        columns: categoryColumns,
        columnResizeMode: "onEnd",

        pageCount: data?.pageCount ?? 0,
        pagination,
        onPaginationChange: setPagination,
    });
    return (
        <div className='p-3 rounded-md border space-y-4'>
            <DataTableToolbar
                table={table}
                searchKey="name"
                searchPlaceholder="Search category..."
            >
                <div className="flex gap-2">
                    <Button onClick={() => setOpen("add")} className="gap-2">
                        <Plus className="size-4" />
                        Add Category
                    </Button>
                </div>
            </DataTableToolbar>

            <DataTable table={table} loading={isLoading} />

            <DataTablePagination table={table} pageCount={data?.pageCount ?? 0} /></div>
    )
}
