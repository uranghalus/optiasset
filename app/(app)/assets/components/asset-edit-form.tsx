"use client";

import { useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Camera, X, Loader2, FileText } from "lucide-react"; // 👈 Tambah FileText

import { type AssetEditForm, AssetEditFormSchema } from "@/schema/asset-schema";
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

  // State untuk Foto
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // 👇 State untuk Dokumen 👇
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [hasExistingDocument, setHasExistingDocument] = useState<boolean>(false);

  // Flag agar saat pre-fill awal, dropdown anak tidak ter-reset
  const isPreFilling = useRef(true);

  const updateMutation = useUpdateAsset();
  const { data: role } = useActiveMemberRole();
  const { canView, isReadonly } = getAssetFormAccess(role);

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
      photo: null,
      documentUrl: null, // 👈 Tambahkan inisialisasi form document
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

        photo: null,
        documentUrl: null,
      });

      if (assetData.photoUrl) setImagePreview(assetData.photoUrl);

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

  // Handle Foto
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    if (!file) {
      setImagePreview(assetData?.photoUrl || null);
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
    reader.onload = (e) => setImagePreview(e.target?.result as string);
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
      // 👇 Mencegah bug typeof untuk File object 👇
      if ((key === "photo" || key === "documentUrl") && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value === null || value === undefined ? "" : String(value));
      }
    }

    // Flag hapus file existing ke API
    if (!imagePreview && assetData?.photoUrl) {
      formData.append("removePhoto", "true");
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
                    disabled={!selectedGroup || isReadonly}
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
                    disabled={!selectedCategory || isReadonly}
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
                    disabled={!selectedCluster || isReadonly}
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

        {/* UPLOAD SECTION: PHOTO & DOCUMENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* PHOTO SECTION */}
          <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
            <h3 className="font-semibold text-sm">Lampiran Foto Fisik Unit</h3>
            {imagePreview && (
              <div className="relative w-full flex justify-center">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview.startsWith('data:') ? imagePreview : `/api/image?key=${encodeURIComponent(imagePreview)}`}
                    alt="Asset preview"
                    className="h-40 w-40 object-cover rounded-lg border bg-white shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
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
                <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-colors">
                  <Camera className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600 font-medium">
                    {imagePreview ? "Klik ubah foto" : "Pilih dokumen foto aset"}
                  </span>
                </div>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={updateMutation.isPending}
                />
              </label>
            </div>
          </div>

          {/* 👇 DOCUMENT SECTION 👇 */}
          <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
            <h3 className="font-semibold text-sm">Lampiran Dokumen (Opsional)</h3>
            {documentName && (
              <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
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
              <div className="flex items-center gap-2">
                <label htmlFor="document-input" className="flex-1">
                  <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 bg-white transition-colors h-[52px]">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 font-medium">
                      Unggah file dokumen baru
                    </span>
                  </div>
                  <input
                    id="document-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={handleDocumentChange}
                    disabled={updateMutation.isPending}
                  />
                </label>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              Format didukung: PDF, Word, Excel. Maksimal 5MB.
            </p>
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