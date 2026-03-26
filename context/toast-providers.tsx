'use client'

import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import {
    CheckCheck,
    CircleAlert,
    CircleSlash,
    Info,
    Loader,
} from 'lucide-react'

const iconWrapper =
    'flex items-center justify-center rounded-md shrink-0 w-10 h-10 sm:w-11 sm:h-11'

type ToastProviderProps = {
    children: ReactNode
}

export default function ToastProvider({ children }: ToastProviderProps) {
    return (
        <>
            {children}

            <Toaster
                position="bottom-right"
                toastOptions={{
                    classNames: {
                        icon: '!p-0 !m-0 !flex !items-center !justify-center !w-auto !h-auto !bg-transparent',
                        toast: '!p-3 !flex !gap-4 !items-center !sm:gap-5',
                        title: '!text-base !font-bold !text-[#434656]',
                        description: '!text-sm !text-[#696984] !mt-0',
                        loading: 'loading-toast-specific',
                    },
                }}
                icons={{
                    success: (
                        <div className={`${iconWrapper} bg-[#008a63] text-background`}>
                            <CheckCheck className="size-6 sm:size-6" />
                        </div>
                    ),
                    warning: (
                        <div className={`${iconWrapper} bg-[#ffc864] text-foreground`}>
                            <CircleAlert className="size-6 sm:size-6" />
                        </div>
                    ),
                    error: (
                        <div className={`${iconWrapper} bg-[#ec486a] text-background`}>
                            <CircleSlash className="size-6 sm:size-6" />
                        </div>
                    ),
                    info: (
                        <div className={`${iconWrapper} bg-[#3b82f6] text-background`}>
                            <Info className="size-6 sm:size-6" />
                        </div>
                    ),
                    loading: (
                        <div
                            className={`${iconWrapper} bg-[#434656] text-background loading-icon-fix`}
                        >
                            <Loader className="size-6 sm:size-6 animate-spin" />
                        </div>
                    ),
                }}
            />
        </>
    )
}
