"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";


import { Category } from "@/generated/prisma/client";
import { useCreateCategory, useUpdateCategory } from "@/hooks/crud/use-categories";
import { CategoryForm, CategoryFormSchema } from "@/schema/category-schema";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow?: Category;
};

export function CategoryActionDialog({
    open,
    onOpenChange,
    currentRow,
}: Props) {
    const isEdit = !!currentRow;

    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    const form = useForm<CategoryForm>({
        resolver: zodResolver(CategoryFormSchema),
        defaultValues: {
            name: "",
        },
    });

    useEffect(() => {
        if (currentRow) {
            form.reset({
                name: currentRow.name,
            });
        } else {
            form.reset({
                name: "",
            });
        }
    }, [currentRow, form, open]);

    const isPending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = async (values: CategoryForm) => {
        const formData = new FormData();
        formData.append("name", values.name);

        try {
            if (isEdit && currentRow) {
                await updateMutation.mutateAsync({
                    id: currentRow.id,
                    formData,
                });
            } else {
                await createMutation.mutateAsync(formData);
            }

            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error(error);

            form.setError("root", {
                type: "server",
                message: "Terjadi kesalahan saat menyimpan data",
            });
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(state) => {
                form.reset();
                onOpenChange(state);
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Kategori" : "Tambah Kategori"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Perbarui data kategori."
                            : "Buat kategori baru untuk aset."}
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="category-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {/* GLOBAL ERROR */}
                    {form.formState.errors.root?.message && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.root.message}
                        </p>
                    )}

                    <FieldGroup>
                        {/* NAME */}
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Nama</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Elektronik"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                    </FieldGroup>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}