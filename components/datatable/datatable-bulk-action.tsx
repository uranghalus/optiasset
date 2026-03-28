'use client'

import { useState, useEffect, useRef } from 'react'
import type { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

type DataTableBulkActionsProps<TData> = {
    table: Table<TData>
    entityName: string
    children: React.ReactNode
}

/**
 * Floating bulk actions toolbar for TanStack Table.
 *
 * Appears when rows are selected and provides
 * keyboard-accessible bulk action controls.
 */
export function DataTableBulkActions<TData>({
    table,
    entityName,
    children,
}: DataTableBulkActionsProps<TData>): React.ReactNode | null {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedCount = selectedRows.length

    const toolbarRef = useRef<HTMLDivElement>(null)
    const [announcement, setAnnouncement] = useState('')

    /**
     * Screen reader announcement when selection changes
     */
    useEffect(() => {
        if (selectedCount > 0) {
            const message = `${selectedCount} ${entityName}${selectedCount > 1 ? 's' : ''
                } selected. Bulk actions available.`

            queueMicrotask(() => setAnnouncement(message))

            const timer = setTimeout(() => setAnnouncement(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [selectedCount, entityName])

    const clearSelection = () => {
        table.resetRowSelection()
    }

    /**
     * Keyboard navigation inside toolbar
     */
    const handleKeyDown = (event: React.KeyboardEvent) => {
        const buttons = toolbarRef.current?.querySelectorAll('button')
        if (!buttons || buttons.length === 0) return

        const currentIndex = Array.from(buttons).findIndex(
            (btn) => btn === document.activeElement
        )

        switch (event.key) {
            case 'ArrowRight':
                event.preventDefault()
                buttons[(currentIndex + 1) % buttons.length]?.focus()
                break

            case 'ArrowLeft':
                event.preventDefault()
                buttons[
                    currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1
                ]?.focus()
                break

            case 'Home':
                event.preventDefault()
                buttons[0]?.focus()
                break

            case 'End':
                event.preventDefault()
                buttons[buttons.length - 1]?.focus()
                break

            case 'Escape': {
                const target = event.target as HTMLElement
                const active = document.activeElement as HTMLElement

                const isDropdown =
                    target?.closest('[data-slot="dropdown-menu-trigger"]') ||
                    active?.closest('[data-slot="dropdown-menu-trigger"]') ||
                    target?.closest('[data-slot="dropdown-menu-content"]') ||
                    active?.closest('[data-slot="dropdown-menu-content"]')

                if (isDropdown) return

                event.preventDefault()
                clearSelection()
                break
            }
        }
    }

    if (selectedCount === 0) return null

    return (
        <>
            {/* Screen reader live region */}
            <div
                aria-live="polite"
                aria-atomic="true"
                role="status"
                className="sr-only"
            >
                {announcement}
            </div>

            <div
                ref={toolbarRef}
                role="toolbar"
                tabIndex={-1}
                onKeyDown={handleKeyDown}
                aria-label={`Bulk actions for ${selectedCount} selected ${entityName}`}
                className={cn(
                    'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
                    'rounded-xl transition-all duration-300 ease-out',
                    'hover:scale-[1.03]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
                )}
            >
                <div
                    className={cn(
                        'flex items-center gap-x-2',
                        'rounded-xl border p-2 shadow-xl',
                        'bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'
                    )}
                >
                    {/* Clear selection */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-6 rounded-full"
                                onClick={clearSelection}
                                aria-label="Clear selection"
                            >
                                <X />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Clear selection (Esc)</p>
                        </TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-5" />

                    {/* Selected count */}
                    <div className="flex items-center gap-x-1 text-sm">
                        <Badge className="min-w-8 rounded-lg">
                            {selectedCount}
                        </Badge>
                        <span className="hidden sm:inline">
                            {entityName}
                            {selectedCount > 1 ? 's' : ''}
                        </span>
                        selected
                    </div>

                    <Separator orientation="vertical" className="h-5" />

                    {/* Action buttons */}
                    {children}
                </div>
            </div>
        </>
    )
}
