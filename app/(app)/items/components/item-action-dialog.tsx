/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { Item } from "@/generated/prisma/client";
import {
  useCreateItem,
  useUpdateItem,
  useCategoriesForSelect,
  useNextItemCode,
} from "@/hooks/crud/use-items";
import { ItemForm, ItemFormSchema } from "@/schema/item-schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Item;
};

export function ItemActionDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow;

  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const { data: categories } = useCategoriesForSelect();

  const form = useForm<ItemForm>({
    resolver: zodResolver(ItemFormSchema),
    defaultValues: {
      code: "",
      name: "",
      categoryId: "",

      description: "",
      assetType: "FIXED",
    },
  });

  const assetType = form.watch("assetType");
  const { data: nextCode } = useNextItemCode(assetType, !isEdit && open);

  useEffect(() => {
    if (currentRow) {
      form.reset({
        code: currentRow.code,
        name: currentRow.name,
        categoryId: currentRow.categoryId ?? "",
        description: currentRow.description ?? "",
        assetType: currentRow.assetType,
      });
    } else {
      form.reset({
        code: nextCode ?? "",
        name: "",
        categoryId: "",
        description: "",
        assetType: "FIXED",
      });
    }
  }, [currentRow, form, open]); // Only reset on open or row change

  // Update code when nextCode changes (for new items)
  useEffect(() => {
    if (!isEdit && nextCode) {
      form.setValue("code", nextCode);
    }
  }, [nextCode, isEdit, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: ItemForm) => {
    const formData = new FormData();
    formData.append("code", values.code || "");
    formData.append("name", values.name);
    formData.append("assetType", values.assetType);
    if (values.categoryId) formData.append("categoryId", values.categoryId);
    if (values.description) formData.append("description", values.description);

    try {
      if (isEdit && currentRow) {
        await updateMutation.mutateAsync({ id: currentRow.id, formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error(error);
      form.setError("root", {
        type: "server",
        message: error?.message ?? "Terjadi kesalahan saat menyimpan data",
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Master Item" : "Tambah Master Item"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data master item."
              : "Buat master item baru untuk katalog aset."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="item-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {form.formState.errors.root?.message && (
            <p className="text-sm text-red-500">
              {form.formState.errors.root.message}
            </p>
          )}

          <FieldGroup>
            {/* TIPE ASET */}
            <Controller
              name="assetType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tipe Aset</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Pilih tipe..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED">Aset Tetap (Fixed)</SelectItem>
                      <SelectItem value="SUPPLY">
                        Supply / Habis Pakai
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* KODE */}
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Kode Item</FieldLabel>
                    <Input
                      {...field}
                      placeholder={
                        isEdit ? "ITM-001" : "Otomatis (F-ITM-xxx / S-ITM-xxx)"
                      }
                      readOnly={!isEdit}
                      className={!isEdit ? "bg-muted" : ""}
                      aria-invalid={fieldState.invalid}
                    />
                    {!isEdit && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Kode akan dibuat otomatis berdasarkan tipe aset.
                      </p>
                    )}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* NAMA */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Nama Item</FieldLabel>
                    <Input
                      {...field}
                      placeholder="Laptop Lenovo ThinkPad"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* KATEGORI */}
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Kategori</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Pilih kategori..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />


            </div>


            {/* DESKRIPSI */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Deskripsi</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Keterangan tambahan..."
                    aria-invalid={fieldState.invalid}
                    rows={3}
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
