'use client'

import { ButtonGroup } from '@/components/ui/button-group'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useDialog } from '@/context/dialog-provider'
import { Row } from '@tanstack/react-table'
import { Trash2, Pencil, ChevronDownIcon, VolumeOffIcon, CheckIcon, AlertTriangleIcon, UserRoundXIcon, ShareIcon, CopyIcon, TrashIcon } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'

interface UserRowActionsProps<TData> {
    row: Row<TData>
}
export default function UserRowActions<TData>({ row }: UserRowActionsProps<TData>) {
    const { setOpen, setCurrentRow } = useDialog()
    const user = row.original
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
                        <DropdownMenuItem>
                            <VolumeOffIcon />
                            Mute Conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <CheckIcon />
                            Mark as Read
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <AlertTriangleIcon />
                            Report Conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <UserRoundXIcon />
                            Block User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <ShareIcon />
                            Share Conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <CopyIcon />
                            Copy Conversation
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem variant="destructive">
                            <TrashIcon />
                            Delete Conversation
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </ButtonGroup>
    )
}
