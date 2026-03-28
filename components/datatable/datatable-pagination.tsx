/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import type { Table } from '@tanstack/react-table'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
} from 'lucide-react'

type DataTablePaginationProps<TData> = {
    table: Table<TData>
    pageCount: number // ✅ DARI SERVER ACTION
    className?: string
}

export function DataTablePagination<TData>({
    table,
    pageCount,
    className,
}: DataTablePaginationProps<TData>) {
    const { pageIndex, pageSize } = table.getState().pagination

    // 🔁 TanStack = 0-based | UI = 1-based
    const currentPage = pageIndex + 1
    const totalPages = pageCount

    const pageNumbers = getPageNumbers(currentPage, totalPages)

    const canPrevious = currentPage > 1
    const canNext = currentPage < totalPages

    return (
        <div
            className={cn(
                'flex items-center justify-between overflow-clip px-2',
                '@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4',
                className
            )}
        >
            {/* LEFT */}
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                    <p className="hidden text-xs font-medium sm:block">
                        Rows per page
                    </p>

                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                            table.setPageIndex(0) // ✅ RESET ke page 1
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[140px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!canPrevious}
                >
                    <ChevronsLeftIcon className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => table.setPageIndex(pageIndex - 1)}
                    disabled={!canPrevious}
                >
                    <ChevronLeftIcon className="h-4 w-4" />
                </Button>

                {pageNumbers.map((page, i) =>
                    page === '...' ? (
                        <span
                            key={`ellipsis-${i}`}
                            className="px-1 text-sm text-muted-foreground"
                        >
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            className="h-8 min-w-8 px-2"
                            onClick={() =>
                                table.setPageIndex((page as number) - 1)
                            }
                        >
                            {page}
                        </Button>
                    )
                )}

                <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => table.setPageIndex(pageIndex + 1)}
                    disabled={!canNext}
                >
                    <ChevronRightIcon className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => table.setPageIndex(totalPages - 1)}
                    disabled={!canNext}
                >
                    <ChevronsRightIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
