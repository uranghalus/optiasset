import { DialogProvider } from '@/context/dialog-provider';
import { Metadata } from 'next';
import React from 'react'
import ClassificationTable from './classification-table';

export const metadata: Metadata = {
    title: "Klasifikasi Aset",
    description:
        "Master golongan, kategori, kelompok dan sub kelompok aset"
};

export default function AssetClassificationPage() {
    return (
        <DialogProvider>
            <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Klasifikasi Aset</h2>
                        <p className="text-muted-foreground">
                            Kelola golongan, kategori, kelompok dan sub kelompok aset.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4 bg-red-100">
                        <ClassificationTable />
                    </div>
                    <div className="col-span-8 bg-blue-100">
                        test
                    </div>
                </div>
            </div>
        </DialogProvider>
    )
}
