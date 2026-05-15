"use client";

import { useActiveMemberRole } from "@/hooks/use-active-member";
import {
  useCreateAsset,
  useGenerateAssetCode,
  useItemsForSelect,
  useLocationsForSelect,
} from "@/hooks/crud/use-assets";
import { getAssetFormAccess, isValidImageFile } from "@/lib/utils";
import { AssetForm, AssetFormSchema } from "@/schema/asset-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Camera, X, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelectDepartment } from "@/hooks/crud/use-department";

export default function AssetAddForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const router = useRouter();
  const createMutation = useCreateAsset();
  const { data: role } = useActiveMemberRole();
  const { canView, isReadonly } = getAssetFormAccess(role);
  const { data: items } = useItemsForSelect();
  const { data: locations } = useLocationsForSelect();
  const { data: dept } = useSelectDepartment();

  // Inisialisasi Form
  const form = useForm<AssetForm>(({
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
      document_number: "",
      no_spb: "",
    },
  }) as any);

  // Pantau perubahan Master Item yang dipilih
  const selectedItemId = form.watch("itemId");

  // Mengambil state silsilah untuk mentrigger auto-generate kode asset
  const selectedGroup = form.watch("assetGroupId");
  const selectedCategory = form.watch("assetCategoryId");
  const selectedCluster = form.watch("assetClusterId");
  const selectedSubCluster = form.watch("assetSubClusterId");

  // 👇 1. EFFECT AUTO-FILL SILSIALAH KLASIFIKASI BERDASARKAN MASTER ITEM SELECTED 👇
  useEffect(() => {
    if (!selectedItemId || !items) return;

    // Cari item yang dipilih dari daftar item select
    const currentItem = items.find((item) => item.id === selectedItemId);

    // Asumsi: Anda sudah melakukan include relasi silsilah dari model `Item` di hooks `useItemsForSelect`
    if (currentItem && (currentItem as any).category) {
      const cat = (currentItem as any).category;

      // Suntik silsilah langsung ke form values secara otomatis
      form.setValue("assetGroupId", cat.assetGroupId || "");
      form.setValue("assetCategoryId", cat.assetCategoryId || "");
      form.setValue("assetClusterId", cat.assetClusterId || "");
      form.setValue("assetSubClusterId", cat.assetSubClusterId || "");

      // Kosongkan kode asset lama agar ditrigger ulang oleh hook generate
      form.setValue("kode_asset", "");
    }
  }, [selectedItemId, items, form]);

  // Hook generate nomor urut berkelanjutan dari Server Action asset-action
  const { data: generatedCode } = useGenerateAssetCode(
    selectedGroup,
    selectedCategory,
    selectedCluster,
    selectedSubCluster,
  );

  useEffect(() => {
    if (!generatedCode) return;
    form.setValue("kode_asset", generatedCode, { shouldDirty: true });
  }, [generatedCode, form]);

  // Handle Image
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
    const fileInput = document.getElementById("photo-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Submit Data
  const onSubmit = async (values: AssetForm) => {
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== null) {
        if (key === "photo" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    }

    try {
      await createMutation.mutateAsync(formData);
      form.reset();
      setImagePreview(null);
      setImageError(null);
      router.push("/assets"); // Alihkan langsung ke daftar aset jika sukses
    } catch (error: any) {
      console.error(error);
      form.setError("root", {
        type: "server",
        message: error?.message || "Terjadi kesalahan saat menyimpan data",
      });
    }
  };

  const isPending = createMutation.isPending;

  // Temukan nama klasifikasi lengkap saat ini untuk ditampilkan sebagai Preview teks ke Admin
  const activeItemDetails = items?.find((item) => item.id === selectedItemId);

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
          {/* KIRI: Informasi Utama & Klasifikasi Terkunci */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-1">
              Informasi Asset Utama
            </h3>

            {/* itemId */}
            <Controller
              name="itemId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Pilih Master Item (Katalog)</FieldLabel>
                  <Combobox<{
                    name: string;
                    id: string;
                    code: string;
                    assetType: AssetType;
                  }>
                    title="Cari katalog barang..."
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
                    renderText={(item) => `[${item.assetType}] ${item.name}`}
                    onChange={(item) => field.onChange(item.id)}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* 🔍 👇 PANEL INFO AUTOMATISASI KELOMPOK ASSET 👇 */}
            {selectedItemId && activeItemDetails && (
              <div className="p-3 bg-slate-50 border rounded-lg space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <span>Klasifikasi Terbaca Otomatis:</span>
                </div>
                <div className="grid grid-cols-3 text-slate-500 gap-y-1 pl-5">
                  <span className="col-span-1">Kategori Master:</span>
                  <span className="col-span-2 font-mono text-slate-800">{(activeItemDetails as any).category?.name || "-"}</span>

                  <span className="col-span-1">Kode Silsilah:</span>
                  <span className="col-span-2 font-mono font-bold text-primary">{(activeItemDetails as any).category?.code || "00.00.00"}</span>
                </div>
              </div>
            )}

            {/* KODE ASSET (READ ONLY - GENERATED BY SERVER) */}
            <Controller
              name="kode_asset"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Kode Inventaris Tergenerate</FieldLabel>
                  <Input
                    {...field}
                    readOnly
                    placeholder="Menunggu pemilihan master item..."
                    className="font-mono bg-slate-50 border-slate-200 font-bold text-primary text-base"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Nomor inventaris urut berkelanjutan dikalkulasi otomatis oleh sistem berdasarkan rumpun kategori.
                  </p>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* TENGAH: Detail Spesifikasi Fisik */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-1">
              Spesifikasi Fisik Unit
            </h3>

            <Controller
              name="brand"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Brand / Merk</FieldLabel>
                  <Input {...field} placeholder="Lenovo / Yamato" readOnly={isReadonly} />
                </Field>
              )}
            />
            <Controller
              name="model"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Model / Tipe</FieldLabel>
                  <Input {...field} placeholder="ThinkPad / Powder 4.5Kg" readOnly={isReadonly} />
                </Field>
              )}
            />
            <Controller
              name="partNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Part Number</FieldLabel>
                  <Input {...field} placeholder="P/N Code" readOnly={isReadonly} />
                </Field>
              )}
            />
            <Controller
              name="serialNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Serial Number (S/N)</FieldLabel>
                  <Input {...field} placeholder="Nomor Seri Unik Pabrik" readOnly={isReadonly} />
                </Field>
              )}
            />
            <Controller
              name="condition"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Kondisi Awal</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isReadonly}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GOOD">Bagus (Good)</SelectItem>
                      <SelectItem value="REPAIR">Dalam Perbaikan</SelectItem>
                      <SelectItem value="BROKEN">Rusak (Broken)</SelectItem>
                      <SelectItem value="LOST">Hilang</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          {/* KANAN: Penempatan Logistik & Legalitas Dokumen */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-1">
              Logistik & Legalitas
            </h3>

            <Controller
              name="locationId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Penempatan Lokasi</FieldLabel>
                  <Combobox<{ id: string; name: string; }>
                    title="Pilih Area Gedung..."
                    valueKey="id"
                    value={locations?.find((loc) => loc.id === field.value)}
                    searchFn={(search: string, offset: number, size: number) =>
                      Promise.resolve(
                        locations?.filter((loc) => loc.name.toLowerCase().includes(search.toLowerCase())).slice(offset, offset + size) || [],
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
                    <FieldLabel>Departemen Penanggung Jawab</FieldLabel>
                    <Combobox<{ id_department: string; nama_department: string; }>
                      key={`dept-combo-${dept?.length || 0}`}
                      title="Cari Departemen..."
                      valueKey="id_department"
                      value={dept?.find((loc) => loc.id_department === field.value)}
                      searchFn={(search: string, offset: number, size: number) =>
                        Promise.resolve(
                          dept?.filter((loc) => loc.nama_department.toLowerCase().includes(search.toLowerCase())).slice(offset, offset + size) || [],
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

            <Controller
              name="document_number"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>No. Dokumen Kontrak / Berkas</FieldLabel>
                  <Input {...field} placeholder="DOC-001" readOnly={isReadonly} />
                </Field>
              )}
            />

            <Controller
              name="no_spb"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>No. SPB (Surat Penyerahan Barang)</FieldLabel>
                  <Input {...field} placeholder="SPB-2024-001" readOnly={isReadonly} />
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="purchaseDate"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Tgl. Beli</FieldLabel>
                    <Input type="date" {...field} readOnly={isReadonly} className="text-xs" />
                  </Field>
                )}
              />
              <Controller
                name="purchasePrice"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Harga Beli</FieldLabel>
                    <Input type="number" {...field} placeholder="0" readOnly={isReadonly} className="text-xs" />
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="garansi_exp"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Garansi Toko</FieldLabel>
                    <Input type="date" {...field} readOnly={isReadonly} className="text-xs" />
                  </Field>
                )}
              />
              <Controller
                name="vendorName"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Nama Vendor</FieldLabel>
                    <Input {...field} placeholder="PT Maju Bersama" readOnly={isReadonly} className="text-xs" />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        {/* PHOTO UPLOAD SECTION */}
        <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
          <h3 className="font-semibold text-sm">Lampiran Foto Fisik Unit</h3>
          {imagePreview && (
            <div className="relative w-full flex justify-center">
              <div className="relative">
                <img src={imagePreview} alt="Asset preview" className="h-40 w-40 object-cover rounded-lg border" />
                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={handleRemoveImage}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          {imageError && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{imageError}</p>}
          <div className="flex items-center gap-2">
            <label htmlFor="photo-input" className="flex-1">
              <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <Camera className="h-4 w-4" />
                <span className="text-sm text-slate-600">{imagePreview ? "Ubah foto lampiran" : "Pilih dokumen foto aset"}</span>
              </div>
              <input id="photo-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isPending} />
            </label>
          </div>
        </div>

        <Controller
          name="notes"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Catatan / Keterangan Kondisi Tambahan</FieldLabel>
              <Textarea {...field} placeholder="Tulis catatan tambahan penempatan gedung di sini..." rows={2} readOnly={isReadonly} />
            </Field>
          )}
        />

        <div className="pt-4 flex flex-col-reverse md:flex-row justify-end gap-3 border-t mt-6">
          <Button type="button" variant="outline" onClick={() => router.push("/assets")} disabled={isPending} className="w-full md:w-auto">
            Batal
          </Button>
          <Button form="asset-form" type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending ? "Menyimpan Unit..." : "Simpan Data Unit Aset"}
          </Button>
        </div>
      </form>
    </div>
  );
}