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
}

export function DataTableToolbar<TData>({
    table,
    searchPlaceholder = 'Filter...',
    searchKey,
    filters = [],
}: DataTableToolbarProps<TData>) {
    const isFiltered =
        table.getState().columnFilters.length > 0 ||
        Boolean(table.getState().globalFilter)

    return (
        <div className="flex items-center justify-between">
            {/* LEFT */}
            <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
                {/* SEARCH */}
                {searchKey ? (
                    <Input
                        placeholder={searchPlaceholder}
                        value={
                            (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
                        }
                        onChange={(event) =>
                            table.getColumn(searchKey)?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                ) : (
                    <Input
                        placeholder={searchPlaceholder}
                        value={(table.getState().globalFilter as string) ?? ''}
                        onChange={(event) => table.setGlobalFilter(event.target.value)}
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}

                {/* FACET FILTERS */}
                <div className="flex gap-x-2">
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
                </div>

                {/* RESET */}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            table.resetColumnFilters()
                            table.setGlobalFilter('')
                        }}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ms-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* RIGHT */}
            <DataTableViewOptions table={table} />
        </div>
    )
}
