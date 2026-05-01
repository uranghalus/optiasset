"use client";

import { useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Camera, X, Loader2 } from "lucide-react";

import { AssetForm, AssetFormSchema } from "@/schema/asset-schema";
import { getAssetFormAccess, isValidImageFile } from "@/lib/utils";
import { AssetType } from "@/generated/prisma/client";

import { useActiveMemberRole } from "@/hooks/use-active-member";
import {
  useItemsForSelect,
  useLocationsForSelect,
  useAssetById,
  useUpdateAsset,
} from "@/hooks/crud/use-assets";
import { useDepartmentsForSelect } from "@/hooks/crud/use-divisi";
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

export default function AssetEditForm({ assetId }: { assetId: string }) {
  const { data: session } = authClient.useSession();
  const activeOrgId = session?.session?.activeOrganizationId || "";
  const router = useRouter(); //
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Flag agar saat pre-fill awal, dropdown anak tidak ter-reset
  const isPreFilling = useRef(true);

  const updateMutation = useUpdateAsset();
  const { data: role } = useActiveMemberRole();
  const { canView, isReadonly } = getAssetFormAccess(role);

  // Fetching Data Pendukung
  const { data: items } = useItemsForSelect();
  const { data: locations } = useLocationsForSelect();
  const { data: dept } = useDepartmentsForSelect();

  // Fetching Data Asset
  const { data: assetData, isLoading: isFetching } = useAssetById({
    id: assetId,
    organizationId: activeOrgId,
  });

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
      photo: null,
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
    },
  });

  // Watchers untuk Dropdown Klasifikasi
  const selectedGroup = form.watch("assetGroupId");
  const selectedCategory = form.watch("assetCategoryId");
  const selectedCluster = form.watch("assetClusterId");

  const { data: groups } = useAssetGroupsForSelect();
  const { data: categories } = useCategoriesByGroup(selectedGroup);
  const { data: clusters } = useClustersByCategory(selectedCategory);
  const { data: subClusters } = useSubClustersByCluster(selectedCluster);

  // LOGIKA PRE-FILL DATA KE FORM
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

        // Klasifikasi (Jika API backend me-return data ini)
        assetGroupId: assetData.assetGroupId || "",
        assetCategoryId: assetData.assetCategoryId || "",
        assetClusterId: assetData.assetClusterId || "",
        assetSubClusterId: assetData.assetSubClusterId || "",

        photo: null,
      });

      if (assetData.photoUrl) setImagePreview(assetData.photoUrl);

      // Matikan kunci setelah render selesai agar user bisa mengganti dropdown
      setTimeout(() => {
        isPreFilling.current = false;
      }, 500);
    }
  }, [assetData, form]);

  // LOGIKA RESET CASCADING DROPDOWN
  useEffect(() => {
    if (isPreFilling.current) return; // Jangan reset jika sedang loading dari DB
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

  const isPending = updateMutation.isPending;
  // Handle Submit
  const onSubmit = async (values: AssetForm) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value !== null && value !== undefined && value !== "") {
        if (key === "photo" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    }
    // Flag jika foto lama dihapus
    if (!imagePreview && assetData?.photoUrl) {
      formData.append("removePhoto", "true");
    }
    updateMutation.mutate({ id: assetId, formData });
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Memuat data aset...</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-100 rounded-lg bg-white">
      <form
        id="asset-edit-form"
        onSubmit={form.handleSubmit(onSubmit)}
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
              Informasi Asset
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
                    disabled={isReadonly}
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
              render={({ field }) => (
                <Field>
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
                    disabled={isReadonly}
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
                    className="font-mono bg-slate-50"
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
              Detail Asset
            </h3>
            <Controller
              name="brand"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Brand</FieldLabel>
                  <Input {...field} readOnly={isReadonly} />
                </Field>
              )}
            />
            <Controller
              name="model"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Model</FieldLabel>
                  <Input {...field} readOnly={isReadonly} />
                </Field>
              )}
            />
            <Controller
              name="partNumber"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Part Number</FieldLabel>
                  <Input {...field} readOnly={isReadonly} />
                </Field>
              )}
            />
            <Controller
              name="serialNumber"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Serial Number</FieldLabel>
                  <Input {...field} readOnly={isReadonly} />
                </Field>
              )}
            />
            <Controller
              name="condition"
              control={form.control}
              render={({ field }) => (
                <Field>
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
                </Field>
              )}
            />
          </div>

          {/* KOLOM KANAN */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-1">
              Penempatan & Pembelian
            </h3>
            <Controller
              name="locationId"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Lokasi</FieldLabel>
                  <Combobox<{ id: string; name: string }>
                    title="Cari Lokasi"
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
                    disabled={isReadonly}
                  />
                </Field>
              )}
            />

            {canView && (
              <Controller
                name="departmentId"
                control={form.control}
                render={({ field }) => (
                  <Field>
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
                      disabled={isReadonly}
                    />
                  </Field>
                )}
              />
            )}

            <Controller
              name="document_number"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>No. Dokumen</FieldLabel>
                  <Input {...field} readOnly={isReadonly} />
                </Field>
              )}
            />
            <Controller
              name="no_spb"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>No. SPB</FieldLabel>
                  <Input {...field} readOnly={isReadonly} />
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="purchaseDate"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Tgl. Beli</FieldLabel>
                    <Input type="date" {...field} readOnly={isReadonly} />
                  </Field>
                )}
              />
              <Controller
                name="garansi_exp"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Garansi Selesai</FieldLabel>
                    <Input type="date" {...field} readOnly={isReadonly} />
                  </Field>
                )}
              />
            </div>
            <Controller
              name="purchasePrice"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Harga Beli</FieldLabel>
                  <Input type="number" {...field} readOnly={isReadonly} />
                </Field>
              )}
            />
            <Controller
              name="vendorName"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Vendor</FieldLabel>
                  <Input {...field} readOnly={isReadonly} />
                </Field>
              )}
            />
          </div>
        </div>

        {/* PHOTO */}
        <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
          <h3 className="font-semibold text-sm">Foto Aset</h3>
          {imagePreview && (
            <div className="relative w-full flex justify-center">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Asset preview"
                  className="h-40 w-40 object-cover rounded-lg border bg-white"
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
              <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 bg-white">
                <Camera className="h-4 w-4" />
                <span className="text-sm text-slate-600">
                  {imagePreview ? "Klik ubah foto" : "Pilih foto"}
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

        <Controller
          name="notes"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Catatan</FieldLabel>
              <Textarea {...field} rows={2} readOnly={isReadonly} />
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
