import { cn } from '@/lib/utils'
import { Combine, FileCheck2 } from 'lucide-react'
import React from 'react'

interface LogoProps {
    className?: string
}
export default function Logo({ className }: LogoProps) {
    return (
        <div className={cn('flex items-center justify-center p-2.5 bg-primary rounded-lg text-white', className)}>
            <Combine className='size-5' />
        </div>
    )
}
