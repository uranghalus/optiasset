/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from 'react'
import { flexRender } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

type DataTableProps<TData> = {
    table: any
    loading?: boolean
    emptyText?: string
}

export function DataTable<TData>({
    table,
    loading = false,
    emptyText = 'No results.',
}: DataTableProps<TData>) {
    const columnResizeMode = table.options.columnResizeMode
    const columnCount = table.getAllColumns().length

    return (
        <div className="overflow-hidden rounded-md border">
            <div className="relative w-full overflow-x-auto">

                <Table style={{ width: table.getCenterTotalSize() }}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup: any) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header: any) => (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={cn(
                                            'relative select-none',
                                            header.column.columnDef.meta?.thClassName
                                        )}
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}

                                        {/* RESIZER */}
                                        {header.column.getCanResize() && (
                                            <div
                                                onDoubleClick={() => header.column.resetSize()}
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className={cn(
                                                    'resizer',
                                                    table.options.columnResizeDirection,
                                                    header.column.getIsResizing() && 'isResizing'
                                                )}
                                                style={{
                                                    transform:
                                                        columnResizeMode === 'onEnd' &&
                                                            header.column.getIsResizing()
                                                            ? `translateX(${(table.options.columnResizeDirection === 'rtl'
                                                                ? -1
                                                                : 1) *
                                                            (table.getState().columnSizingInfo
                                                                .deltaOffset ?? 0)
                                                            }px)`
                                                            : undefined,
                                                }}
                                            />
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columnCount} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row: any) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell: any) => (
                                        <TableCell
                                            key={cell.id}
                                            style={{ width: cell.column.getSize() }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columnCount} className="h-24 text-center">
                                    {emptyText}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
