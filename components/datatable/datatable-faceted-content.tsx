'use client'

import * as React from 'react'
import { type Column } from '@tanstack/react-table'

import { cn } from '@/lib/utils'
import {
    Command,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command'
import { CheckIcon } from 'lucide-react'

type Props<TData, TValue> = {
    column?: Column<TData, TValue>
    options: {
        label: string
        value: string
        icon?: React.ComponentType<{ className?: string }>
    }[]
}

export function DataTableFacetedFilterContent<TData, TValue>({
    column,
    options,
}: Props<TData, TValue>) {
    const selectedValues = new Set(column?.getFilterValue() as string[])

    return (
        <Command>
            <CommandGroup>
                {options.map((option) => {
                    const isSelected = selectedValues.has(option.value)

                    return (
                        <CommandItem
                            key={option.value}
                            onSelect={() => {
                                if (isSelected) {
                                    selectedValues.delete(option.value)
                                } else {
                                    selectedValues.add(option.value)
                                }

                                const values = Array.from(selectedValues)
                                column?.setFilterValue(values.length ? values : undefined)
                            }}
                        >
                            <div
                                className={cn(
                                    'mr-2 flex size-4 items-center justify-center rounded-sm border border-primary',
                                    isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'opacity-50 [&_svg]:invisible'
                                )}
                            >
                                <CheckIcon className="h-4 w-4 text-background" />
                            </div>

                            {option.icon && (
                                <option.icon className="mr-2 size-4 text-muted-foreground" />
                            )}

                            <span>{option.label}</span>
                        </CommandItem>
                    )
                })}
            </CommandGroup>
        </Command>
    )
}