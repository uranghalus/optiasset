/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { getCookie, setCookie, removeCookie } from "@/lib/cookies"

type Theme = "dark" | "light" | "system"
type ResolvedTheme = Exclude<Theme, "system">

const DEFAULT_THEME: Theme = "system"
const THEME_COOKIE_NAME = "vite-ui-theme"
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    defaultTheme: Theme
    resolvedTheme: ResolvedTheme
    theme: Theme
    setTheme: (theme: Theme) => void
    resetTheme: () => void
}

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
    children,
    defaultTheme = DEFAULT_THEME,
    storageKey = THEME_COOKIE_NAME,
}: ThemeProviderProps) {
    // ✅ Hindari window saat SSR
    const [theme, _setTheme] = useState<Theme>(defaultTheme)
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        const savedTheme = getCookie(storageKey) as Theme | undefined
        if (savedTheme) _setTheme(savedTheme)
    }, [storageKey])

    const resolvedTheme = useMemo<ResolvedTheme>(() => {
        if (theme === "system") {
            if (typeof window === "undefined") return "light"
            return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
        }
        return theme as ResolvedTheme
    }, [theme])

    useEffect(() => {
        const root = window.document.documentElement
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

        const applyTheme = (mode: ResolvedTheme) => {
            root.classList.remove("light", "dark")
            root.classList.add(mode)
        }

        applyTheme(resolvedTheme)

        const handleChange = () => {
            if (theme === "system") {
                applyTheme(mediaQuery.matches ? "dark" : "light")
            }
        }

        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
    }, [theme, resolvedTheme])

    const setTheme = (newTheme: Theme) => {
        setCookie(storageKey, newTheme, THEME_COOKIE_MAX_AGE)
        _setTheme(newTheme)
    }

    const resetTheme = () => {
        removeCookie(storageKey)
        _setTheme(DEFAULT_THEME)
    }

    const contextValue: ThemeProviderState = {
        defaultTheme,
        resolvedTheme,
        theme,
        setTheme,
        resetTheme,
    }
    if (!mounted) return null;
    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) throw new Error("useTheme must be used within ThemeProvider")
    return context
}
