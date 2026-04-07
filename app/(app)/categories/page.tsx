import { DialogProvider } from '@/context/dialog-provider'
import { Metadata } from 'next'
import React from 'react'
import CategoriesTable from './components/categories-table'
import CategoriesDialog from './components/categories-dialogs'

export const metadata: Metadata = {
    title: "Categories",
    description: "Categories",
}

export default function CategoriesPage() {
    return (
        <DialogProvider>
            <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Asset Categories
                        </h2>
                        <p className="text-muted-foreground">
                            Manage categories for your assets.
                        </p>
                    </div>
                </div>
                <CategoriesTable />
            </div>
            <CategoriesDialog />
        </DialogProvider>
    )
}
