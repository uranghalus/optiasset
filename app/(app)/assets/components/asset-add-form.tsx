"use client";

import { useActiveMemberRole } from "@/hooks/use-active-member";
import {
  useCreateAsset,
  useGenerateAssetCode,
  useItemsForSelect,
  useLocationsForSelect,
} from "@/hooks/crud/use-assets";
import { getAssetFormAccess, isValidImageFile } from "@/lib/utils";
import { AssetForm, AssetFormSchema, AssetDraftSchema } from "@/schema/asset-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useCallback } from "react";
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
import { Camera, X, Info, FileText, Upload, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelectDepartment } from "@/hooks/crud/use-department";

export default function AssetAddForm() {
  const [photoPreviews, setPhotoPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const router = useRouter();
  const createMutation = useCreateAsset();
  const { data: role } = useActiveMemberRole();
  const { canView, isReadonly } = getAssetFormAccess(role);
  const { data: items } = useItemsForSelect();
  const { data: locations } = useLocationsForSelect();
  const { data: dept } = useSelectDepartment();

  // Inisialisasi Form
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
      photos: [],
      documentUrl: null,
      brand: "",
      model: "",
      partNumber: "",
      serialNumber: "",
      document_number: "",
      no_spb: "",
      isAparOrHydrant: "NONE",
      jenisApar: undefined,
      sizeApar: undefined,
      ukuranHydrant: "",
      PIC: "", // 👈 Field PIC sudah ada di defaultValues Anda
    },
  } as any);

  const selectedItemId = form.watch("itemId");
  const [activeCategoryCode, setActiveCategoryCode] = useState<string>("");

  useEffect(() => {
    if (!selectedItemId || !items) {
      setActiveCategoryCode("");
      form.setValue("kode_asset", "");
      return;
    }

    const currentItem = items.find((item) => item.id === selectedItemId);

    if (currentItem && (currentItem as any).category) {
      const cat = (currentItem as any).category;
      const categoryCode = cat.code || "";

      setActiveCategoryCode(categoryCode);
      form.setValue("assetGroupId", cat.assetGroupId || "", {
        shouldDirty: true,
      });
      form.setValue("assetCategoryId", cat.assetCategoryId || "", {
        shouldDirty: true,
      });
      form.setValue("assetClusterId", cat.assetClusterId || "", {
        shouldDirty: true,
      });
      form.setValue("assetSubClusterId", cat.assetSubClusterId || "", {
        shouldDirty: true,
      });
      form.setValue("kode_asset", "", { shouldDirty: true });
    } else {
      setActiveCategoryCode("");
      form.setValue("kode_asset", "");
    }
  }, [selectedItemId, items, form]);

  const { data: generatedCode } = useGenerateAssetCode(activeCategoryCode);

  useEffect(() => {
    if (!generatedCode) return;
    form.setValue("kode_asset", generatedCode, { shouldDirty: true });
  }, [generatedCode, form]);

  const activeItemDetails = items?.find((item) => item.id === selectedItemId);
  const itemName = activeItemDetails?.name?.toLowerCase() || "";
  const categoryName =
    (activeItemDetails as any)?.category?.name?.toLowerCase() || "";

  const isApar = itemName.includes("apar") || categoryName.includes("apar");
  const isHydrant =
    itemName.includes("hydrant") || categoryName.includes("hydrant");

  useEffect(() => {
    if (isApar) {
      form.setValue("isAparOrHydrant", "APAR");
    } else if (isHydrant) {
      form.setValue("isAparOrHydrant", "HYDRANT");
    } else {
      form.setValue("isAparOrHydrant", "NONE");
      form.setValue("jenisApar", undefined as any);
      form.setValue("sizeApar", undefined as any);
      form.setValue("ukuranHydrant", "");
    }
  }, [isApar, isHydrant, form]);

  const addPhotos = useCallback((files: FileList | File[]) => {
    setPhotoError(null);
    const validFiles = Array.from(files).filter((file) => {
      const validation = isValidImageFile(file);
      if (!validation.valid) {
        setPhotoError(validation.error || "File tidak valid");
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    const newEntries = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotoPreviews((prev) => {
      const updated = [...prev, ...newEntries];
      form.setValue("photos", updated.map((e) => e.file));
      return updated;
    });
  }, [form]);

  const handlePhotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addPhotos(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addPhotos(e.dataTransfer.files);
  }, [addPhotos]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => {
      const entry = prev[index];
      if (entry) URL.revokeObjectURL(entry.preview);
      const updated = prev.filter((_, i) => i !== index);
      form.setValue("photos", updated.map((e) => e.file));
      return updated;
    });
  };

  // 👇 Handle Document Upload 👇
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setDocumentName(null);
      form.setValue("documentUrl", null);
      return;
    }

    // Optional: Validasi ukuran file (misal max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran dokumen maksimal 5MB.");
      e.target.value = "";
      return;
    }

    form.setValue("documentUrl", file);
    setDocumentName(file.name);
  };

  const handleRemoveDocument = () => {
    setDocumentName(null);
    form.setValue("documentUrl", null);
    const fileInput = document.getElementById(
      "document-input",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Submit Data
  const onSubmit = async (values: AssetForm, status: string = "ACTIVE") => {
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== null) {
        if (key === "photos" && Array.isArray(value)) {
          for (const file of value) {
            if (file instanceof File) formData.append("photos", file);
          }
        } else if (key === "documentUrl" && value instanceof File) {
          formData.append(key, value);
        } else if (key !== "photos") {
          formData.append(key, value as string | Blob);
        }
      }
    }

    formData.append("status", status);

    try {
      await createMutation.mutateAsync(formData);
      form.reset();
      setPhotoPreviews([]);
      setPhotoError(null);
      setDocumentName(null);
      router.push("/assets");
    } catch (error: any) {
      console.error(error);
      form.setError("root", {
        type: "server",
        message: error?.message || "Terjadi kesalahan saat menyimpan data",
      });
    }
  };

  const isPending = createMutation.isPending;

  // Submit as Draft — validate only itemId
  const onSubmitDraft = async () => {
    const valid = await form.trigger("itemId");
    if (!valid) return;
    const values = form.getValues();
    onSubmit(values as any, "DRAFT");
  };

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

        <p className="text-xs text-muted-foreground">
          <span className="text-destructive font-medium">*</span> Wajib diisi untuk publikasi aset. Field lain bisa dilengkapi nanti via edit.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KIRI: Informasi Utama & Klasifikasi Terkunci */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-1">
              Informasi Asset Utama
            </h3>

            <Controller
              name="itemId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Pilih Master Item (Katalog)
                    <span className="text-destructive ml-0.5">*</span>
                  </FieldLabel>
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

            {selectedItemId && activeItemDetails && (
              <div className="p-3 bg-slate-50 border rounded-lg space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <span>Klasifikasi Terbaca Otomatis:</span>
                </div>
                <div className="grid grid-cols-3 text-slate-500 gap-y-1 pl-5">
                  <span className="col-span-1">Kategori Master:</span>
                  <span className="col-span-2 font-mono text-slate-800">
                    {(activeItemDetails as any).category?.name || "-"}
                  </span>

                  <span className="col-span-1">Kode Silsilah:</span>
                  <span className="col-span-2 font-mono font-bold text-primary">
                    {(activeItemDetails as any).category?.code || "00.00.00"}
                  </span>
                </div>
              </div>
            )}

            <Controller
              name="kode_asset"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Kode Inventaris Tergenerate</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    readOnly
                    placeholder="Menunggu pemilihan master item..."
                    className="font-mono bg-slate-50 border-slate-200 font-bold text-primary text-base"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Nomor inventaris urut berkelanjutan dikalkulasi otomatis
                    oleh sistem berdasarkan rumpun kategori.
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
                  <FieldLabel>
                    Brand / Merk
                    <span className="text-destructive ml-0.5">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Lenovo / Yamato"
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
                  <FieldLabel>
                    Model / Tipe
                    <span className="text-destructive ml-0.5">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="ThinkPad / Powder 4.5Kg"
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
                    value={field.value ?? ""}
                    placeholder="P/N Code"
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
                  <FieldLabel>Serial Number (S/N)</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Nomor Seri Unik Pabrik"
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
                  <FieldLabel>
                    Kondisi Awal
                    <span className="text-destructive ml-0.5">*</span>
                  </FieldLabel>
                  <Select
                    value={field.value || "GOOD"}
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
                      <SelectItem value="SOLD">Terjual</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                  <Combobox<{ id: string; name: string }>
                    title="Pilih Area Gedung..."
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    <Combobox<{
                      id_department: string;
                      nama_department: string;
                    }>
                      key={`dept-combo-${dept?.length || 0}`}
                      title="Cari Departemen..."
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            {/* 👇 PENAMBAHAN FIELD PIC DI SINI 👇 */}
            <Controller
              name="PIC"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>PIC (Person In Charge)</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Nama Penanggung Jawab Aset"
                    readOnly={isReadonly}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="document_number"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>No. Dokumen Kontrak / Berkas</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="DOC-001"
                    readOnly={isReadonly}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="no_spb"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>No. SPB (Surat Penyerahan Barang)</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="SPB-2024-001"
                    readOnly={isReadonly}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="purchaseDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Tgl. Beli</FieldLabel>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ?? ""}
                      readOnly={isReadonly}
                      className="text-xs"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
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
                      value={field.value ?? ""}
                      placeholder="0"
                      readOnly={isReadonly}
                      className="text-xs"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="garansi_exp"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Garansi Toko</FieldLabel>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ?? ""}
                      readOnly={isReadonly}
                      className="text-xs"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="vendorName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Nama Vendor</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="PT Maju Bersama"
                      readOnly={isReadonly}
                      className="text-xs"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* FORM DINAMIS: MUNCUL JIKA ITEM ADALAH APAR ATAU HYDRANT               */}
        {/* ===================================================================== */}
        {isApar && (
          <div className="space-y-4 border p-5 rounded-lg bg-red-50/80 border-red-200 mt-6 shadow-sm">
            <h3 className="font-bold text-sm text-red-800 border-b border-red-200 pb-2 flex items-center gap-2">
              🔥 Spesifikasi Khusus APAR (Alat Pemadam Api Ringan)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="jenisApar"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-red-900">
                      Jenis Media APAR
                    </FieldLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={isReadonly}
                    >
                      <SelectTrigger className="bg-white border-red-200 focus:ring-red-500">
                        <SelectValue placeholder="Pilih Jenis Media..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CO2">
                          CO2 (Karbon Dioksida)
                        </SelectItem>
                        <SelectItem value="Powder">
                          Dry Chemical Powder
                        </SelectItem>
                        <SelectItem value="Foam">Foam (Busa)</SelectItem>
                        <SelectItem value="Air">Water (Air)</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="sizeApar"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-red-900">
                      Kapasitas / Berat (Kg)
                    </FieldLabel>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Contoh: 4.5"
                      disabled={isReadonly}
                      className="bg-white border-red-200 focus-visible:ring-red-500"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>
        )}

        {isHydrant && (
          <div className="space-y-4 border p-5 rounded-lg bg-blue-50/80 border-blue-200 mt-6 shadow-sm">
            <h3 className="font-bold text-sm text-blue-800 border-b border-blue-200 pb-2 flex items-center gap-2">
              💧 Spesifikasi Khusus Instalasi Hydrant
            </h3>
            <div className="w-full md:w-1/2">
              <Controller
                name="ukuranHydrant"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-blue-900">
                      Ukuran Hydrant (Pipa/Valve)
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Contoh: 1.5 Inch atau 2.5 Inch"
                      disabled={isReadonly}
                      className="bg-white border-blue-200 focus-visible:ring-blue-500"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>
        )}
        {/* ===================================================================== */}

        {/* UPLOAD SECTION: PHOTOS & DOCUMENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* MULTI-PHOTO UPLOAD */}
          <div className="space-y-4 border rounded-xl p-5 bg-white shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              Foto Fisik Unit
              <span className="text-xs text-muted-foreground font-normal">(bisa banyak)</span>
            </h3>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photoPreviews.map((entry, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted/30">
                    <img
                      src={entry.preview}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-lg"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {photoError && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{photoError}</p>
            )}

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <label htmlFor="photo-input">
                <div
                  className={`flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-slate-300 hover:border-primary/50 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-full bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {isDragging ? "Lepaskan foto di sini" : "Klik atau seret foto ke sini"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG, WebP — Maks 5MB per file
                  </span>
                </div>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoInput}
                  disabled={isPending}
                />
              </label>
            </div>

            {photoPreviews.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {photoPreviews.length} foto dipilih
              </p>
            )}
          </div>

          {/* DOCUMENT UPLOAD */}
          <div className="space-y-4 border rounded-xl p-5 bg-white shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Lampiran Dokumen
              <span className="text-xs text-muted-foreground font-normal">(opsional)</span>
            </h3>
            {documentName && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                  <span className="text-sm text-slate-700 truncate font-medium">
                    {documentName}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-500 flex-shrink-0"
                  onClick={handleRemoveDocument}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {!documentName && (
              <label htmlFor="document-input">
                <div className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400/50 hover:bg-blue-50/50 transition-all">
                  <div className="p-2 rounded-full bg-blue-100">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Unggah file dokumen</span>
                  <span className="text-xs text-muted-foreground">PDF, Word, Excel — Maks 5MB</span>
                </div>
                <input
                  id="document-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  onChange={handleDocumentChange}
                  disabled={isPending}
                />
              </label>
            )}
          </div>
        </div>

        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Catatan / Keterangan Kondisi Tambahan</FieldLabel>
              <Textarea
                {...field}
                value={field.value ?? ""}
                placeholder="Tulis catatan tambahan penempatan atau info teknis di sini..."
                rows={3}
                readOnly={isReadonly}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <div className="pt-4 flex flex-col-reverse md:flex-row justify-end gap-3 border-t mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/assets")}
            disabled={isPending}
            className="w-full md:w-auto"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSubmitDraft}
            disabled={isPending}
            className="w-full md:w-auto"
          >
            Simpan Draft
          </Button>
          <Button
            form="asset-form"
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto"
          >
            {isPending ? "Menyimpan Unit..." : "Simpan Data Unit Aset"}
          </Button>
        </div>
      </form>
    </div>
  );
}