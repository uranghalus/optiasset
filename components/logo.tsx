import { cn } from '@/lib/utils'
import { Combine, FileCheck2 } from 'lucide-react'
import React from 'react'

interface LogoProps {
    className?: string
}
export default function Logo({ className }: LogoProps) {
    return (
        <div className={cn('flex items-center justify-center p-3 bg-gradient-to-br from-primary to-primary/70 rounded-lg text-white shadow-lg shadow-primary/25', className)}>
            <Combine className='size-6' />
        </div>
    )
}
