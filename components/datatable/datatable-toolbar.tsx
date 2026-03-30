'use client'

import * as React from 'react'

import { type Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './datatable-faceted-filter'
import { X } from 'lucide-react'
import { DataTableViewOptions } from './datatable-view-options'



type DataTableToolbarProps<TData> = {
    table: Table<TData>
    searchPlaceholder?: string
    searchKey?: string
    filters?: {
        columnId: string
        title: string
        options: {
            label: string
            value: string
            icon?: React.ComponentType<{ className?: string }>
        }[]
    }[]
    children?: React.ReactNode
}

export function DataTableToolbar<TData>({
    children,
    table,
    searchPlaceholder = 'Filter...',
    searchKey,
    filters = [],
}: DataTableToolbarProps<TData>) {
    const isFiltered =
        table.getState().columnFilters.length > 0 ||
        Boolean(table.getState().globalFilter)

    return (
        <div className="flex items-center w-full">

            {/* LEFT (children optional) */}
            {children && <div>{children}</div>}

            {/* RIGHT (selalu ke kanan) */}
            <div className="ml-auto flex items-center gap-6 shrink-0">

                {/* FILTER + RESET */}
                <div className="flex items-center gap-2 flex-wrap">
                    {filters.map((filter) => {
                        const column = table.getColumn(filter.columnId)
                        if (!column) return null

                        return (
                            <DataTableFacetedFilter
                                key={filter.columnId}
                                column={column}
                                title={filter.title}
                                options={filter.options}
                            />
                        )
                    })}

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                table.resetColumnFilters()
                                table.setGlobalFilter('')
                            }}
                            className="h-8 px-2"
                        >
                            Reset
                            <X className="ms-2 h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* SEARCH + VIEW */}
                <div className="flex items-center gap-4">
                    <Input
                        placeholder={searchPlaceholder}
                        value={
                            searchKey
                                ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
                                : (table.getState().globalFilter as string) ?? ''
                        }
                        onChange={(event) =>
                            searchKey
                                ? table.getColumn(searchKey)?.setFilterValue(event.target.value)
                                : table.setGlobalFilter(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />

                    <DataTableViewOptions table={table} />
                </div>
            </div>
        </div>
    )
}
