'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client' // pastikan path sesuai dengan instance Better Auth client kamu
import { ConfirmDialog } from './confirm-dialog'


type SignOutDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleConfirm = () => {
        startTransition(async () => {
            try {
                await authClient.signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            router.push('/')
                        },
                    },
                })
            } catch (error) {
                console.error('Error during sign out:', error)
            }
        })
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Sign out"
            desc="Are you sure you want to sign out from your account?"
            confirmText="Sign out"
            cancelBtnText="Cancel"
            destructive
            handleConfirm={handleConfirm}
            isLoading={isPending}
        />
    )
}
