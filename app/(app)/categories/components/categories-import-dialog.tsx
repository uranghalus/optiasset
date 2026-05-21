"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Sesuaikan path import ini dengan struktur folder Anda

import {
    ImportCategoryExcelForm,
    ImportCategoryExcelSchema
} from "@/schema/category-schema";
import { useImportCategoriesExcel } from "@/hooks/crud/use-categories";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function CategoryImportDialog({
    onOpenChange,
    open,
}: Props) {
    // Menggunakan hook useImportCategoriesExcel yang sudah kita buat
    const { mutate: importExcel, isPending: importing } = useImportCategoriesExcel();
    const { data: session } = authClient.useSession();

    const form = useForm<ImportCategoryExcelForm>({
        resolver: zodResolver(ImportCategoryExcelSchema),
        defaultValues: {
            file: undefined,
        },
    });
    const { errors } = form.formState;

    const onSubmit = (data: ImportCategoryExcelForm) => {
        if (!session?.session.activeOrganizationId) {
            toast.error("Organisasi tidak ditemukan");
            return;
        }
        if (!data.file) {
            toast.error("Pilih file terlebih dahulu");
            return;
        }

        const formData = new FormData();
        formData.append("file", data.file);

        // Menjalankan mutasi
        importExcel(formData, {
            onSuccess: () => {
                onOpenChange(false); // Tutup dialog jika berhasil
                form.reset(); // Kosongkan file untuk import berikutnya
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                if (!val) onOpenChange(val);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Impor Kategori</DialogTitle>
                    <DialogDescription>Impor kategori aset dari file Excel</DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Controller
                        name="file"
                        control={form.control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>File Excel</FieldLabel>
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        field.onChange(file);
                                    }}
                                />
                                <FieldError>{errors.file?.message}</FieldError>
                            </Field>
                        )}
                    />
                    <Button type="submit" disabled={importing}>
                        {importing ? "Mengimpor..." : "Impor Kategori"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}