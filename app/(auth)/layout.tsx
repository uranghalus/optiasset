
import Logo from '@/components/logo'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import React, { ReactNode } from 'react'


interface AuthLayoutProps {
    children: ReactNode
}
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh w-full">
            {/* Left side - Animated gradient with branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-primary/60 animated-gradient">
                {/* Floating orbs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-float" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-white/8 blur-2xl animate-float" style={{ animationDelay: '2s' }} />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center text-white">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md shadow-2xl border border-white/20">
                        <Logo className="!bg-white/20 !p-4 !size-14" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">OptiAssets</h1>
                        <p className="mt-2 text-lg text-white/80">Smart Asset Management Platform</p>
                    </div>
                    <p className="text-sm text-white/60 max-w-sm leading-relaxed">
                        Track, manage, and optimize your company assets with real-time insights and powerful analytics.
                    </p>
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </div>
        </div>
    )
}

