'use client'

import { useEffect } from 'react'
import { Check, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeSwitch() {
    const { theme, setTheme } = useTheme()

    // ✅ Update <meta name="theme-color"> saat theme berubah
    useEffect(() => {
        if (typeof document === 'undefined') return

        const metaThemeColor =
            document.querySelector<HTMLMetaElement>("meta[name='theme-color']")

        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                'content',
                theme === 'dark' ? '#020817' : '#ffffff'
            )
        }
    }, [theme])

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative scale-95 rounded-full"
                    aria-label="Toggle theme"
                >
                    <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={4}>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    Light
                    <Check
                        size={14}
                        className={cn('ms-auto', theme !== 'light' && 'hidden')}
                    />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    Dark
                    <Check
                        size={14}
                        className={cn('ms-auto', theme !== 'dark' && 'hidden')}
                    />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                    System
                    <Check
                        size={14}
                        className={cn('ms-auto', theme !== 'system' && 'hidden')}
                    />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
