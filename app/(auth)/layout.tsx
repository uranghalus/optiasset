
import Logo from '@/components/logo'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import React, { ReactNode } from 'react'


interface AuthLayoutProps {
    children: ReactNode
}
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                {children}
            </div>
        </div>
    )
}
