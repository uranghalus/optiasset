'use client'

import { SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-provider'
import { Button } from '@/components/ui/button'

type SearchProps = {
    className?: string
    placeholder?: string
}

export function Search({
    className = '',
    placeholder = 'Search...',
}: SearchProps) {
    const { setOpen } = useSearch()

    return (
        <Button
            type="button"
            variant="outline"
            className={cn(
                'group relative flex h-8 w-full flex-1 items-center justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none transition-colors hover:bg-accent sm:w-40 sm:pe-12 md:flex-none lg:w-52 xl:w-64',
                className
            )}
            onClick={() => setOpen(true)}
        >
            <SearchIcon
                aria-hidden="true"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-70"
                size={16}
            />
            <span className="ml-6 truncate">{placeholder}</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 transition-colors group-hover:bg-accent sm:flex">
                <span className="text-xs">⌘</span>K
            </kbd>
        </Button>
    )
}
