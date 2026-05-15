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
import { useAssetGroupsForSelect, useCategoriesByGroup, useClustersByCategory, useSubClustersByCluster } from "@/hooks/crud/use-asset-classification";
import { Combobox } from "@/components/ui/combobox";

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
      assetGroupId: "",
      assetCategoryId: "",
      assetClusterId: "",
      assetSubClusterId: "",
    },
  });

  const selectedGroup = form.watch("assetGroupId");
  const selectedCategory = form.watch("assetCategoryId");
  const selectedCluster = form.watch("assetClusterId");

  const { data: groups } = useAssetGroupsForSelect();
  const { data: categories } = useCategoriesByGroup(selectedGroup);
  const { data: clusters } = useClustersByCategory(selectedCategory);
  const { data: subClusters } = useSubClustersByCluster(selectedCluster);
  useEffect(() => {
    form.setValue("assetCategoryId", "");
    form.setValue("assetClusterId", "");
    form.setValue("assetSubClusterId", "");
  }, [selectedGroup, form]);

  useEffect(() => {
    form.setValue("assetClusterId", "");
    form.setValue("assetSubClusterId", "");
  }, [selectedCategory, form]);

  // 👇 TAMBAHKAN EFEK INI UNTUK OTOMATISASI NAMA KATEGORI 👇
  useEffect(() => {
    // Cari objek data lengkap dari ID yang sedang aktif terpilih
    const currentSubCluster = subClusters?.find((x) => x.id === form.getValues("assetSubClusterId"));
    const currentCluster = clusters?.find((x) => x.id === selectedCluster);
    const currentCategory = categories?.find((x) => x.id === selectedCategory);
    const currentGroup = groups?.find((x) => x.id === selectedGroup);

    // Tentukan nama dari level terdalam yang dipilih
    let autoName = "";
    if (currentSubCluster) {
      autoName = currentSubCluster.name;
    } else if (currentCluster) {
      autoName = currentCluster.name;
    } else if (currentCategory) {
      autoName = currentCategory.name;
    } else if (currentGroup) {
      autoName = currentGroup.name;
    }

    // Set nilai field "name" di React Hook Form secara otomatis
    form.setValue("name", autoName, {
      shouldValidate: true, // Paksa validasi Zod agar tombol simpan aktif
      shouldDirty: true,
    });
  }, [selectedGroup, selectedCategory, selectedCluster, form.watch("assetSubClusterId"), groups, categories, clusters, subClusters, form]);
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
    // 👇 TAMBAHKAN ID KLASIFIKASI KEDALAM FORMDATA 👇
    if (values.assetGroupId) formData.append("assetGroupId", values.assetGroupId);
    if (values.assetCategoryId) formData.append("assetCategoryId", values.assetCategoryId);
    if (values.assetClusterId) formData.append("assetClusterId", values.assetClusterId);
    if (values.assetSubClusterId) formData.append("assetSubClusterId", values.assetSubClusterId);
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
          <div className="space-y-4">

            <>
              <h3 className="font-semibold text-sm border-b pb-1">
                Tentukan Klasifikasi Global (Wajib)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GOLONGAN */}
                <Controller
                  name="assetGroupId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Golongan</FieldLabel>
                      <Combobox
                        title="Pilih Golongan"
                        valueKey="id"
                        value={groups?.find((g) => g.id === field.value)}
                        searchFn={(search, offset, size) =>
                          Promise.resolve(
                            groups
                              ?.filter((g) =>
                                g.name
                                  .toLowerCase()
                                  .includes(search.toLowerCase()),
                              )
                              .slice(offset, offset + size) || [],
                          )
                        }
                        renderText={(item) => `${item.code} - ${item.name}`}
                        onChange={(item) => field.onChange(item.id)}
                        disabled={isPending}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* KATEGORI */}
                <Controller
                  name="assetCategoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Kategori</FieldLabel>
                      <Combobox
                        title="Pilih Kategori"
                        valueKey="id"
                        value={categories?.find((x) => x.id === field.value)}
                        searchFn={(search, offset, size) =>
                          Promise.resolve(
                            categories
                              ?.filter((x) =>
                                x.name
                                  .toLowerCase()
                                  .includes(search.toLowerCase()),
                              )
                              .slice(offset, offset + size) || [],
                          )
                        }
                        renderText={(x) => `${x.code} - ${x.name}`}
                        onChange={(x) => field.onChange(x.id)}
                        disabled={!selectedGroup || isPending}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* CLUSTER */}
                <Controller
                  name="assetClusterId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Cluster</FieldLabel>
                      <Combobox
                        title="Pilih Cluster"
                        valueKey="id"
                        value={clusters?.find((x) => x.id === field.value)}
                        searchFn={(search, offset, size) =>
                          Promise.resolve(
                            clusters
                              ?.filter((x) =>
                                x.name
                                  .toLowerCase()
                                  .includes(search.toLowerCase()),
                              )
                              .slice(offset, offset + size) || [],
                          )
                        }
                        renderText={(x) => `${x.code} - ${x.name}`}
                        onChange={(x) => field.onChange(x.id)}
                        disabled={!selectedCategory || isPending}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* SUB CLUSTER */}
                <Controller
                  name="assetSubClusterId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Sub Cluster</FieldLabel>
                      <Combobox
                        title="Pilih Sub Cluster"
                        valueKey="id"
                        value={subClusters?.find((x) => x.id === field.value)}
                        searchFn={(search, offset, size) =>
                          Promise.resolve(
                            subClusters
                              ?.filter((x) =>
                                x.name
                                  .toLowerCase()
                                  .includes(search.toLowerCase()),
                              )
                              .slice(offset, offset + size) || [],
                          )
                        }
                        renderText={(x) => `${x.code} - ${x.name}`}
                        onChange={(x) => field.onChange(x.id)}
                        disabled={!selectedCluster || isPending}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </>

          </div>
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