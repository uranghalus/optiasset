'use client'

import React, { useState } from 'react'
import { useUsers } from '@/hooks/crud/use-users'
import { userColumns } from './user-column'
import { useDataTable } from '@/hooks/use-data-table'

import { DataTableToolbar } from '@/components/datatable/datatable-toolbar'
import { DataTable } from '@/components/datatable/data-table'
import { DataTablePagination } from '@/components/datatable/datatable-pagination'

import { useDialog } from '@/context/dialog-provider'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { User } from '@/generated/prisma/client'
import { useDebounce } from '@/hooks/use-debounce'
export type UserWithRole = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    username: string | null;
    displayUsername: string | null;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
}
export default function UsersTable() {
    const { setOpen } = useDialog()

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const [search, setSearch] = useState("")
    const [debouncedSearch] = useDebounce(search, 500);
    // 🔥 FIX: pageIndex + 1
    const { data, isLoading } = useUsers({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch,
    })

    const { table } = useDataTable<UserWithRole>({
        data: data?.data as UserWithRole[],
        columns: userColumns,
        columnResizeMode: "onEnd",

        pageCount: data?.pagination.totalPages ?? 0,

        pagination, // ✅ pakai ini

        onPaginationChange: setPagination,
    });
    console.log("TABLE STATE:", table.getState());
    console.log("DATA:", data);
    return (
        <div className='p-3 rounded-md border space-y-4'>
            <DataTableToolbar
                table={table}
                searchPlaceholder="Search user..."
                onSearchChange={(value) => {
                    setSearch(value)
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }}
                searchValue={search}
            >
                <div className="flex gap-2">
                    <Button onClick={() => setOpen("add")} className="gap-2">
                        <Plus className="size-4" />
                        Add User
                    </Button>
                </div>
            </DataTableToolbar>

            <DataTable table={table} loading={isLoading} />

            <DataTablePagination
                table={table}
                pageCount={data?.pagination.totalPages ?? 0}
            />
        </div>
    )
}