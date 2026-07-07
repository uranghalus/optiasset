"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Camera, X, Loader2, FileText, Upload } from "lucide-react";

import { type AssetEditForm, AssetEditFormSchema, parsePhotoUrls } from "@/schema/asset-schema";
import { getAssetFormAccess, isValidImageFile } from "@/lib/utils";
import { AssetType } from "@/generated/prisma/client";

import { useActiveMemberRole } from "@/hooks/use-active-member";
import {
  useItemsForSelect,
  useLocationsForSelect,
  useAssetById,
  useUpdateAsset,
} from "@/hooks/crud/use-assets";
import {
  useAssetGroupsForSelect,
  useCategoriesByGroup,
  useClustersByCategory,
  useSubClustersByCluster,
} from "@/hooks/crud/use-asset-classification";

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
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useSelectDepartment } from "@/hooks/crud/use-department";

export default function AssetEditForm({ assetId }: { assetId: string }) {
  const { data: session } = authClient.useSession();
  const activeOrgId = session?.session?.activeOrganizationId || "";
  const router = useRouter();

  // State untuk Foto (multi-file)
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [removedPhotoIndexes, setRemovedPhotoIndexes] = useState<Set<number>>(new Set());
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // State untuk Dokumen
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [hasExistingDocument, setHasExistingDocument] = useState<boolean>(false);

  const isPreFilling = useRef(true);

  const updateMutation = useUpdateAsset();
  const { data: role } = useActiveMemberRole();
  const { canView } = getAssetFormAccess(role);

  // Fetching Data Pendukung
  const { data: items } = useItemsForSelect();
  const { data: locations } = useLocationsForSelect();
  const { data: dept } = useSelectDepartment();

  // Fetching Data Asset
  const { data: assetData, isLoading: isFetching } = useAssetById({
    id: assetId,
    organizationId: activeOrgId,
  });

  const form = useForm<AssetEditForm>({
    resolver: zodResolver(AssetEditFormSchema),
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
      photos: [],
      documentUrl: null,
      brand: "",
      model: "",
      partNumber: "",
      serialNumber: "",
      document_number: "",
      no_spb: "",
      assetGroupId: "",
      assetCategoryId: "",
      assetClusterId: "",
      assetSubClusterId: "",
      isAparOrHydrant: "NONE",
      jenisApar: undefined,
      sizeApar: undefined,
      ukuranHydrant: "",
      PIC: "",
    },
  } as any);

  // Watchers untuk Dropdown Klasifikasi & Item
  const selectedGroup = form.watch("assetGroupId");
  const selectedCategory = form.watch("assetCategoryId");
  const selectedCluster = form.watch("assetClusterId");
  const selectedItemId = form.watch("itemId");
  const currentAssetType = form.watch("isAparOrHydrant");

  const { data: groups } = useAssetGroupsForSelect();
  const { data: categories } = useCategoriesByGroup(selectedGroup);
  const { data: clusters } = useClustersByCategory(selectedCategory);
  const { data: subClusters } = useSubClustersByCluster(selectedCluster);

  // =========================================================================
  // LOGIKA PRE-FILL DATA KE FORM (TERMASUK APAR/HYDRANT)
  // =========================================================================
  useEffect(() => {
    if (assetData) {
      isPreFilling.current = true; // Aktifkan kunci

      const formatDate = (dateValue?: Date | string | null) => {
        if (!dateValue) return "";
        try {
          return format(new Date(dateValue), "yyyy-MM-dd");
        } catch (e) {
          return "";
        }
      };

      // Handle data APAR atau Hydrant jika ada di balikan API
      const aparInfo =
        assetData.aparDetails?.[0] || (assetData as any).aparDetail;
      const hydrantInfo =
        assetData.hydrantDetails?.[0] || (assetData as any).hydrantDetail;

      let initialType = "NONE";
      if (aparInfo) initialType = "APAR";
      else if (hydrantInfo) initialType = "HYDRANT";

      form.reset({
        itemId: assetData.itemId || "",
        purchaseDate: formatDate(assetData.purchaseDate),
        purchasePrice: assetData.purchasePrice
          ? assetData.purchasePrice.toString()
          : "",
        condition: assetData.condition || "GOOD",
        warrantyExpire: formatDate(assetData.warrantyExpire),
        locationId: assetData.locationId || "",
        departmentId: assetData.departmentId || "",
        notes: assetData.notes || "",
        kode_asset: assetData.kode_asset || "",
        vendorName: assetData.vendorName || "",
        garansi_exp: formatDate(assetData.garansi_exp),
        brand: assetData.brand || "",
        model: assetData.model || "",
        partNumber: assetData.partNumber || "",
        serialNumber: assetData.serialNumber || "",
        document_number: assetData.document_number || "",
        no_spb: assetData.no_spb || "",

        assetGroupId: assetData.assetGroupId || "",
        assetCategoryId: assetData.assetCategoryId || "",
        assetClusterId: assetData.assetClusterId || "",
        assetSubClusterId: assetData.assetSubClusterId || "",

        isAparOrHydrant: initialType as any,
        jenisApar: aparInfo?.jenis || undefined,
        sizeApar: aparInfo?.size ? Number(aparInfo.size) : undefined,
        ukuranHydrant: hydrantInfo?.ukuran || "",
        PIC: (assetData as any).PIC || "",

        photos: [],
        documentUrl: null,
      });

      if (assetData.photoUrl) {
        setExistingPhotoUrls(parsePhotoUrls(assetData.photoUrl));
        setRemovedPhotoIndexes(new Set());
        setNewPhotoPreviews([]);
      }

      // 👇 Pre-fill UI Document jika exist dari database
      if ((assetData as any).documentUrl) {
        // Ambil nama file dari URL S3 (mengambil text setelah slash terakhir)
        const docUrl = (assetData as any).documentUrl as string;
        const decodedUrl = decodeURIComponent(docUrl);
        const urlWithoutQuery = decodedUrl.split('?')[0]; // 👈 Buang query string S3
        const fileName = urlWithoutQuery.substring(urlWithoutQuery.lastIndexOf('/') + 1);
        setDocumentName(fileName);
        setHasExistingDocument(true);
      }

      // Matikan kunci setelah render selesai agar user bisa mengganti dropdown
      setTimeout(() => {
        isPreFilling.current = false;
      }, 500);
    }
  }, [assetData, form]);

  // =========================================================================
  // LOGIKA DETEKSI JIKA USER MENGGANTI ITEM SAAT EDIT
  // =========================================================================
  const activeItemDetails = items?.find((item) => item.id === selectedItemId);
  const itemName = activeItemDetails?.name?.toLowerCase() || "";
  const categoryName =
    (activeItemDetails as any)?.category?.name?.toLowerCase() || "";

  const isAparItem = itemName.includes("apar") || categoryName.includes("apar");
  const isHydrantItem =
    itemName.includes("hydrant") || categoryName.includes("hydrant");

  useEffect(() => {
    // Jangan overwrite data saat proses pre-filling dari database
    if (isPreFilling.current) return;

    if (isAparItem) {
      form.setValue("isAparOrHydrant", "APAR");
    } else if (isHydrantItem) {
      form.setValue("isAparOrHydrant", "HYDRANT");
    } else {
      form.setValue("isAparOrHydrant", "NONE");
      form.setValue("jenisApar", undefined as any);
      form.setValue("sizeApar", undefined as any);
      form.setValue("ukuranHydrant", "");
    }
  }, [isAparItem, isHydrantItem, form]);

  // =========================================================================
  // LOGIKA RESET CASCADING DROPDOWN
  // =========================================================================
  useEffect(() => {
    if (isPreFilling.current) return;
    form.setValue("assetCategoryId", "");
    form.setValue("assetClusterId", "");
    form.setValue("assetSubClusterId", "");
  }, [selectedGroup, form]);

  useEffect(() => {
    if (isPreFilling.current) return;
    form.setValue("assetClusterId", "");
    form.setValue("assetSubClusterId", "");
  }, [selectedCategory, form]);

  useEffect(() => {
    if (isPreFilling.current) return;
    form.setValue("assetSubClusterId", "");
  }, [selectedCluster, form]);

  // Handle Multi-Photo
  const addNewPhotos = useCallback((files: FileList | File[]) => {
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
    setNewPhotoPreviews((prev) => {
      const updated = [...prev, ...newEntries];
      form.setValue("photos", updated.map((e) => e.file));
      return updated;
    });
  }, [form]);

  const handlePhotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addNewPhotos(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addNewPhotos(e.dataTransfer.files);
  }, [addNewPhotos]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeExistingPhoto = (index: number) => {
    setRemovedPhotoIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotoPreviews((prev) => {
      const entry = prev[index];
      if (entry) URL.revokeObjectURL(entry.preview);
      const updated = prev.filter((_, i) => i !== index);
      form.setValue("photos", updated.map((e) => e.file));
      return updated;
    });
  };

  // 👇 Handle Dokumen 👇
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setDocumentName(
        hasExistingDocument && (assetData as any).documentUrl
          ? decodeURIComponent((assetData as any).documentUrl).split('/').pop() || "Dokumen Tersimpan"
          : null
      );
      form.setValue("documentUrl", null);
      return;
    }

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
    setHasExistingDocument(false);
    form.setValue("documentUrl", null);
    const fileInput = document.getElementById(
      "document-input",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Handle Submit
  const isPending = updateMutation.isPending;
  const onSubmit = async (values: AssetEditForm) => {
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null) continue;
      if (key === "photos" && Array.isArray(value)) {
        for (const file of value) {
          if (file instanceof File) formData.append("photos", file);
        }
      } else if (key === "documentUrl" && value instanceof File) {
        formData.append(key, value);
      } else if (key !== "photos") {
        formData.append(key, String(value));
      }
    }

    // Mark removed existing photos
    for (const idx of removedPhotoIndexes) {
      formData.append(`removePhoto_${idx}`, "true");
    }

    if (!documentName && (assetData as any)?.documentUrl) {
      formData.append("removeDocument", "true");
    }

    updateMutation.mutate({ id: assetId, formData });
  };

  const onError = (errors: any) => {
    console.error("Zod Validation Errors:", errors);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 space-y-2 py-12 h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Memuat data aset...</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-100 rounded-lg bg-white">
      <form
        id="asset-edit-form"
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-6"
      >
        {form.formState.errors.root?.message && (
          <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KOLOM KIRI */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-1">
              Informasi Asset Utama
            </h3>
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
                    value={items?.find((i) => i.id === field.value)}
                    searchFn={(s, o, sz) =>
                      Promise.resolve(
                        items
                          ?.filter((i) =>
                            i.name.toLowerCase().includes(s.toLowerCase()),
                          )
                          .slice(o, o + sz) || [],
                      )
                    }
                    renderText={(i) => i.name}
                    onChange={(i) => field.onChange(i.id)}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* CASCADING DROPDOWN KLASIFIKASI */}
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
                    searchFn={(s, o, sz) =>
                      Promise.resolve(
                        groups
                          ?.filter((g) =>
                            g.name.toLowerCase().includes(s.toLowerCase()),
                          )
                          .slice(o, o + sz) || [],
                      )
                    }
                    renderText={(item) => `${item.code} - ${item.name}`}
                    onChange={(item) => field.onChange(item.id)}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
                    searchFn={(s, o, sz) =>
                      Promise.resolve(
                        categories
                          ?.filter((x) =>
                            x.name.toLowerCase().includes(s.toLowerCase()),
                          )
                          .slice(o, o + sz) || [],
                      )
                    }
                    renderText={(x) => `${x.code} - ${x.name}`}
                    onChange={(x) => field.onChange(x.id)}
                    disabled={!selectedGroup}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
                    searchFn={(s, o, sz) =>
                      Promise.resolve(
                        clusters
                          ?.filter((x) =>
                            x.name.toLowerCase().includes(s.toLowerCase()),
                          )
                          .slice(o, o + sz) || [],
                      )
                    }
                    renderText={(x) => `${x.code} - ${x.name}`}
                    onChange={(x) => field.onChange(x.id)}
                    disabled={!selectedCategory}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
                    searchFn={(s, o, sz) =>
                      Promise.resolve(
                        subClusters
                          ?.filter((x) =>
                            x.name.toLowerCase().includes(s.toLowerCase()),
                          )
                          .slice(o, o + sz) || [],
                      )
                    }
                    renderText={(x) => `${x.code} - ${x.name}`}
                    onChange={(x) => field.onChange(x.id)}
                    disabled={!selectedCluster}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    value={field.value ?? ""}
                    // readOnly
                    className="font-mono bg-slate-50 font-semibold"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* KOLOM TENGAH */}
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
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Lenovo / Yamato"
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
              render={({ field }) => (
                <Field>
                  <FieldLabel>Model</FieldLabel>
                  <Input {...field} value={field.value ?? ""} />
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
                    placeholder="Opsional (Isi - jika tidak ada)"
                  />
                </Field>
              )}
            />

            <Controller
              name="serialNumber"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Serial Number</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Opsional (Isi - jika tidak ada)"
                  />
                </Field>
              )}
            />

            <Controller
              name="condition"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Kondisi Awal</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
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

          {/* KOLOM KANAN */}
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
                    searchFn={(s, o, sz) =>
                      Promise.resolve(
                        locations
                          ?.filter((l) =>
                            l.name.toLowerCase().includes(s.toLowerCase()),
                          )
                          .slice(o, o + sz) || [],
                      )
                    }
                    renderText={(loc) => loc.name}
                    onChange={(loc) => field.onChange(loc.id)}
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
                      title="Cari Departemen..."
                      valueKey="id_department"
                      value={dept?.find(
                        (loc) => loc.id_department === field.value,
                      )}
                      searchFn={(s, o, sz) =>
                        Promise.resolve(
                          dept
                            ?.filter((d) =>
                              d.nama_department
                                .toLowerCase()
                                .includes(s.toLowerCase()),
                            )
                            .slice(o, o + sz) || [],
                        )
                      }
                      renderText={(loc) => loc.nama_department}
                      onChange={(loc) => field.onChange(loc.id_department)}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            <Controller
              name="document_number"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>No. Dokumen Kontrak</FieldLabel>
                  <Input {...field} value={field.value ?? ""} />
                </Field>
              )}
            />
            <Controller
              name="no_spb"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>No. SPB</FieldLabel>
                  <Input {...field} value={field.value ?? ""} />
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
                    <Input type="date" {...field} />
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
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Garansi Selesai</FieldLabel>
                    <Input type="date" {...field} />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="vendorName"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Vendor</FieldLabel>
                  <Input {...field} value={field.value ?? ""} />
                </Field>
              )}
            />
            <Controller
              name="PIC"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>PIC (Person in Charge)</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Nama penanggung jawab aset"
                  />
                </Field>
              )}
            />
          </div>
        </div>

        {/* ===================================================================== */}
        {/* FIELD DINAMIS APAR / HYDRANT */}
        {/* ===================================================================== */}
        {currentAssetType === "APAR" && (
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

        {currentAssetType === "HYDRANT" && (
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

        {/* UPLOAD SECTION: PHOTOS & DOCUMENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* MULTI-PHOTO UPLOAD */}
          <div className="space-y-4 border rounded-xl p-5 bg-white shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              Foto Fisik Unit
              <span className="text-xs text-muted-foreground font-normal">(bisa banyak)</span>
            </h3>

            {/* Existing photos */}
            {existingPhotoUrls.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Foto tersimpan:</p>
                <div className="grid grid-cols-3 gap-3">
                  {existingPhotoUrls.map((url, index) => {
                    const isRemoved = removedPhotoIndexes.has(index);
                    return (
                      <div
                        key={`existing-${index}`}
                        className={`relative group aspect-square rounded-lg overflow-hidden border transition-all ${
                          isRemoved ? "opacity-40 ring-2 ring-destructive" : "bg-muted/30"
                        }`}
                      >
                        {url.startsWith('data:') || url.startsWith('http') ? (
                          <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={`/api/image?key=${encodeURIComponent(url)}`}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button
                            type="button"
                            variant={isRemoved ? "secondary" : "destructive"}
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-lg"
                            onClick={() => removeExistingPhoto(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                          {index + 1}
                        </span>
                        {isRemoved && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-destructive text-white text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap">
                            Akan dihapus
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New photos */}
            {newPhotoPreviews.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Foto baru:</p>
                <div className="grid grid-cols-3 gap-3">
                  {newPhotoPreviews.map((entry, index) => (
                    <div key={`new-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted/30">
                      <img src={entry.preview} alt={`Foto baru ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-full shadow-lg"
                          onClick={() => removeNewPhoto(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {existingPhotoUrls.length - removedPhotoIndexes.size + index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {photoError && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{photoError}</p>
            )}

            <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
              <label htmlFor="edit-photo-input">
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
                    {isDragging ? "Lepaskan foto di sini" : "Klik atau seret foto tambahan"}
                  </span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WebP — Maks 5MB per file</span>
                </div>
                <input
                  id="edit-photo-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoInput}
                  disabled={isPending}
                />
              </label>
            </div>
          </div>

          {/* DOCUMENT SECTION */}
          <div className="space-y-4 border rounded-xl p-5 bg-white shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Lampiran Dokumen
              <span className="text-xs text-muted-foreground font-normal">(opsional)</span>
            </h3>
            {documentName && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700 truncate font-medium" title={documentName}>
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
              <label htmlFor="edit-document-input">
                <div className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400/50 hover:bg-blue-50/50 transition-all">
                  <div className="p-2 rounded-full bg-blue-100">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Unggah file dokumen baru</span>
                  <span className="text-xs text-muted-foreground">PDF, Word, Excel — Maks 5MB</span>
                </div>
                <input
                  id="edit-document-input"
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
          render={({ field }) => (
            <Field>
              <FieldLabel>Catatan</FieldLabel>
              <Textarea {...field} value={field.value ?? ""} rows={3} />
            </Field>
          )}
        />

        <div className="pt-4 flex flex-col-reverse md:flex-row justify-end gap-3 border-t mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
            className="w-full md:w-auto"
          >
            Batal
          </Button>

          <Button
            form="asset-edit-form"
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