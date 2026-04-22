import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Asset } from '@/generated/prisma/client';
import React from 'react'
type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow: Asset;
};
export default function AssetAssignDialog({ currentRow, onOpenChange, open }: Props) {
    return (
        <Dialog open={open} onOpenChange={(state) => (onOpenChange(state))}>
            <DialogContent className='sm:max-w-2xl max-h-screen overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Serah Terima Asset</DialogTitle>
                    <DialogDescription>
                        Fitur ini akan digunakan untuk melakukan serah terima asset kepada pengguna lain. Pastikan untuk memilih pengguna yang tepat dan mengisi informasi yang diperlukan dengan benar.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
