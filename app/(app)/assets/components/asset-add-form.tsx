"use client";

import { useActiveMemberRole } from "@/hooks/use-active-member";
import {
  useCreateAsset,
  useGenerateAssetCode,
  useItemsForSelect,
  useLocationsForSelect,
} from "@/hooks/crud/use-assets";
import { useDepartmentsForSelect } from "@/hooks/crud/use-divisi";
import {
  useAssetGroupsForSelect,
  useCategoriesByGroup,
  useClustersByCategory,
  useSubClustersByCluster,
} from "@/hooks/crud/use-asset-classification";
import { getAssetFormAccess, isValidImageFile } from "@/lib/utils";
import { AssetForm, AssetFormSchema } from "@/schema/asset-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { format } from "date-fns";
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Combobox } from "@/components/ui/combobox";
import { AssetType } from "@/generated/prisma/client";
import { Camera, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssetAddForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const router = useRouter(); //
  const createMutation = useCreateAsset();
  const { data: role } = useActiveMemberRole();
  const { canView, isReadonly } = getAssetFormAccess(role);
  const { data: items } = useItemsForSelect();
  const { data: locations } = useLocationsForSelect();
  const { data: dept } = useDepartmentsForSelect();

  // LINK Inisialisasi Form
  const form = useForm<AssetForm>({
    resolver: zodResolver(AssetFormSchema),
    defaultValues: {
      itemId: "",
      purchaseDate: "",
      purchasePrice: "",
      condition: "GOOD",
      warrantyExpire: "",
      locationId: "",
      departmentId: "",
      notes: "",
      kode_asset: "",
      vendorName: "",
      garansi_exp: "",
      assetGroupId: "",
      assetCategoryId: "",
      assetClusterId: "",
      assetSubClusterId: "",
      photo: null,
      brand: "",
      model: "",
      partNumber: "",
      serialNumber: "",
      document_number: "", // Sudah ditambahkan di state
      no_spb: "", // Sudah ditambahkan di state
    },
  });

  const setDefaultAssetFormValues = () => {
    form.reset({
      itemId: "",
      purchaseDate: format(new Date(), "yyyy-MM-dd"),
      purchasePrice: "",
      condition: "GOOD",
      warrantyExpire: "",
      locationId: "",
      departmentId: "",
      brand: "",
      model: "",
      partNumber: "",
      notes: "",
      kode_asset: "",
      vendorName: "",
      garansi_exp: "",
      document_number: "",
      no_spb: "",
      serialNumber: "",
      photo: null,
    });

    setImagePreview(null);
    setImageError(null);
  };

  // LINK Klasifikasi Asset
  const selectedGroup = form.watch("assetGroupId");
  const selectedCategory = form.watch("assetCategoryId");
  const selectedCluster = form.watch("assetClusterId");
  const selectedSubCluster = form.watch("assetSubClusterId");
  const { data: groups } = useAssetGroupsForSelect();
  const { data: categories } = useCategoriesByGroup(selectedGroup);
  const { data: clusters } = useClustersByCategory(selectedCategory);
  const { data: subClusters } = useSubClustersByCluster(selectedCluster);

  const { data: generatedCode } = useGenerateAssetCode(
    selectedGroup,
    selectedCategory,
    selectedCluster,
    selectedSubCluster,
  );

  useEffect(() => {
    if (!generatedCode) return;

    if (form.getValues("kode_asset")) return;

    form.setValue("kode_asset", generatedCode, {
      shouldDirty: true,
    });
  }, [generatedCode]);

  useEffect(() => {
    if (!selectedGroup) return;

    form.setValue("assetCategoryId", "");
    form.setValue("assetClusterId", "");
    form.setValue("assetSubClusterId", "");
  }, [selectedGroup]);

  useEffect(() => {
    if (!selectedCategory) return;

    form.setValue("assetClusterId", "");
    form.setValue("assetSubClusterId", "");
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedCluster) return;

    form.setValue("assetSubClusterId", "");
  }, [selectedCluster]);

  const [debouncedCluster, setDebouncedCluster] = useState(selectedCluster);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedCluster(selectedCluster);
    }, 300);

    return () => clearTimeout(t);
  }, [selectedCluster]);

  // LINK Handle Image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (!file) {
      setImagePreview(null);
      form.setValue("photo", null);
      return;
    }

    const validation = isValidImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || "File tidak valid");
      e.target.value = "";
      form.setValue("photo", null);
      return;
    }

    form.setValue("photo", file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageError(null);
    form.setValue("photo", null);
    const fileInput = document.getElementById(
      "photo-input",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // LINK Submit Data
  const onSubmit = async (values: AssetForm) => {
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        if (key === "photo" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    }

    try {
      await createMutation
        .mutateAsync(formData)
        .then(() => (form.reset(), setImagePreview(null), setImageError(null)))
        .catch((error: any) => {
          console.error(error);
          form.setError("root", {
            type: "server",
            message: error?.message ?? "Terjadi kesalahan saat menyimpan data",
          });
        });
    } catch (error: any) {
      console.error(error);
      form.setError("root", {
        type: "server",
        message: error?.message ?? "Terjadi kesalahan saat menyimpan data",
      });
    }
  };

  const isPending = createMutation.isPending;

  return (
    <div className="p-4 border border-gray-100 rounded-lg">
      <form
        id="asset-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {form.formState.errors.root?.message && (
          <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KIRI: Informasi Utama */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-1">
              Informasi Asset
            </h3>

            {/*LINK itemId */}
            <Controller
              name="itemId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Master Item</FieldLabel>
                  <Combobox<{
                    name: string;
                    id: string;
                    code: string;
                    assetType: AssetType;
                  }>
                    title="Cari Item"
                    valueKey="id"
                    value={items?.find((item) => item.id === field.value)}
                    searchFn={(search: string, offset: number, size: number) =>
                      Promise.resolve(
                        items
                          ?.filter((item) =>
                            item.name
                              .toLowerCase()
                              .includes(search.toLowerCase()),
                          )
                          .slice(offset, offset + size) || [],
                      )
                    }
                    renderText={(item) => item.name}
                    onChange={(item) => field.onChange(item.id)}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {canView && (
              <>
                <Controller
                  name="assetGroupId"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
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
                      />
                    </Field>
                  )}
                />
                <Controller
                  name="assetCategoryId"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
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
                        disabled={!selectedGroup}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name="assetClusterId"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
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
                        disabled={!selectedCategory}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name="assetSubClusterId"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
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
                        disabled={!selectedCluster}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name="kode_asset"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Kode Asset</FieldLabel>
                      <Input
                        {...field}
                        readOnly
                        placeholder="Auto generated from classification"
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Kode otomatis terbentuk dari Golongan → Kategori →
                        Cluster → Sub Cluster
                      </p>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </>
            )}
          </div>

          {/* TENGAH: Detail Asset */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-1">
              Detail Asset
            </h3>

            <Controller
              name="brand"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Brand</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Lenovo"
                    aria-invalid={fieldState.invalid}
                    readOnly={isReadonly}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="model"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Model</FieldLabel>
                  <Input
                    {...field}
                    placeholder="ThinkPad X1 Carbon"
                    aria-invalid={fieldState.invalid}
                    readOnly={isReadonly}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="partNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Part Number</FieldLabel>
                  <Input
                    {...field}
                    placeholder="TP-X1C-2024"
                    aria-invalid={fieldState.invalid}
                    readOnly={isReadonly}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="serialNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Serial Number</FieldLabel>
                  <Input
                    {...field}
                    placeholder="SN123456789"
                    aria-invalid={fieldState.invalid}
                    readOnly={isReadonly}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="condition"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Kondisi</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadonly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GOOD">Bagus (Good)</SelectItem>
                      <SelectItem value="REPAIR">Dalam Perbaikan</SelectItem>
                      <SelectItem value="BROKEN">Rusak (Broken)</SelectItem>
                      <SelectItem value="LOST">Hilang</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* KANAN: Penempatan & Pembelian */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-1">
              Penempatan & Pembelian
            </h3>

            <Controller
              name="locationId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Lokasi</FieldLabel>
                  <Combobox<{
                    id: string;
                    name: string;
                  }>
                    title="Cari Lokasi"
                    valueKey="id"
                    value={locations?.find((loc) => loc.id === field.value)}
                    searchFn={(search: string, offset: number, size: number) =>
                      Promise.resolve(
                        locations
                          ?.filter((loc) =>
                            loc.name
                              .toLowerCase()
                              .includes(search.toLowerCase()),
                          )
                          .slice(offset, offset + size) || [],
                      )
                    }
                    renderText={(loc) => loc.name}
                    onChange={(loc) => field.onChange(loc.id)}
                    disabled={isReadonly}
                  />
                </Field>
              )}
            />

            {canView && (
              <Controller
                name="departmentId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Departemen</FieldLabel>
                    <Combobox<{
                      id_department: string;
                      nama_department: string;
                    }>
                      title="Cari Departemen"
                      valueKey="id_department"
                      value={dept?.find(
                        (loc) => loc.id_department === field.value,
                      )}
                      searchFn={(
                        search: string,
                        offset: number,
                        size: number,
                      ) =>
                        Promise.resolve(
                          dept
                            ?.filter((loc) =>
                              loc.nama_department
                                .toLowerCase()
                                .includes(search.toLowerCase()),
                            )
                            .slice(offset, offset + size) || [],
                        )
                      }
                      renderText={(loc) => loc.nama_department}
                      onChange={(loc) => field.onChange(loc.id_department)}
                      disabled={isReadonly}
                    />
                  </Field>
                )}
              />
            )}

            {/* 👇 TAMBAHAN UI: document_number 👇 */}
            <Controller
              name="document_number"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>No. Dokumen</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Contoh: DOC-001"
                    aria-invalid={fieldState.invalid}
                    readOnly={isReadonly}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* 👇 TAMBAHAN UI: no_spb 👇 */}
            <Controller
              name="no_spb"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>No. SPB</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Contoh: SPB-2024-001"
                    aria-invalid={fieldState.invalid}
                    readOnly={isReadonly}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="purchaseDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tgl. Beli</FieldLabel>
                  <Input type="date" {...field} readOnly={isReadonly} />
                </Field>
              )}
            />

            <Controller
              name="purchasePrice"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Harga Beli</FieldLabel>
                  <Input
                    type="number"
                    {...field}
                    placeholder="0"
                    readOnly={isReadonly}
                  />
                </Field>
              )}
            />

            <Controller
              name="garansi_exp"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Garansi Selesai</FieldLabel>
                  <Input type="date" {...field} readOnly={isReadonly} />
                </Field>
              )}
            />

            <Controller
              name="vendorName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Vendor / Toko</FieldLabel>
                  <Input
                    {...field}
                    placeholder="e.g. PT Maju Bersama"
                    readOnly={isReadonly}
                  />
                </Field>
              )}
            />
          </div>
        </div>

        {/* PHOTO UPLOAD SECTION */}
        <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
          <h3 className="font-semibold text-sm">Foto Aset</h3>

          {imagePreview && (
            <div className="relative w-full flex justify-center">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Asset preview"
                  className="h-40 w-40 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {imageError && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {imageError}
            </p>
          )}

          <div className="flex items-center gap-2">
            <label htmlFor="photo-input" className="flex-1">
              <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <Camera className="h-4 w-4" />
                <span className="text-sm text-slate-600">
                  {imagePreview
                    ? "Klik untuk ubah foto"
                    : "Pilih atau drag foto aset"}
                </span>
              </div>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isPending}
                readOnly={isReadonly}
              />
            </label>
          </div>
          <p className="text-xs text-slate-500">
            Format: JPG, PNG, WebP, GIF | Max: 5MB
          </p>
        </div>

        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Catatan</FieldLabel>
              <Textarea
                {...field}
                placeholder="Tambahkan keterangan tambahan jika perlu..."
                rows={2}
                readOnly={isReadonly}
              />
            </Field>
          )}
        />

        <div className="pt-4 flex flex-col-reverse md:flex-row justify-end gap-3 border-t mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/assets")} // 👈 Arahkan ke halaman daftar aset
            disabled={isPending}
            className="w-full md:w-auto"
          >
            Batal
          </Button>

          <Button
            form="asset-form"
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto"
          >
            {isPending ? "Menyimpan..." : "Simpan Data Aset"}
          </Button>
        </div>
      </form>
    </div>
  );
}
