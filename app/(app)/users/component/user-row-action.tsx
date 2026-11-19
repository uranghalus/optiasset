'use client'

import { ButtonGroup } from '@/components/ui/button-group'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useDialog } from '@/context/dialog-provider'
import { Row } from '@tanstack/react-table'
import { Trash2, Pencil, ChevronDownIcon, VolumeOffIcon, CheckIcon, AlertTriangleIcon, UserRoundXIcon, ShareIcon, CopyIcon, TrashIcon, OctagonMinus, Check, ShieldCheck } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'

interface UserRowActionsProps<TData> {
    row: Row<TData>
}
export default function UserRowActions<TData>({ row }: UserRowActionsProps<TData>) {
    const { setOpen, setCurrentRow } = useDialog()
    const user = row.original
    const role = (user as { role?: string | null }).role
    const isPendingVerification =
        !role ||
        role
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean)
            .every((r) => r === 'guest')

    return (
        <ButtonGroup>
            <Button variant="destructive" size="icon" onClick={() => {
                setCurrentRow(user);
                setOpen("delete");
            }}>
                <Trash2 />
            </Button>
            <Button variant="outline" size="icon" onClick={() => {
                setCurrentRow(user);
                setOpen("edit");
            }}>
                <Pencil />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="pl-2!">
                        <ChevronDownIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuGroup>
                        {isPendingVerification && (
                            <>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setCurrentRow(user);
                                        setOpen("edit");
                                    }}
                                >
                                    <ShieldCheck />
                                    Verifikasi Akun
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        <DropdownMenuItem variant="destructive" onClick={() => {
                            setCurrentRow(user);
                            setOpen("banned");
                        }}>
                            <OctagonMinus />
                            Banned Pengguna
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="default" onClick={() => {
                            setCurrentRow(user);
                            setOpen("unban");
                        }}>
                            <Check />
                            Aktifkan Pengguna
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </ButtonGroup>
    )
}
