/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";

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

import { format } from "date-fns";
import { Camera, X } from "lucide-react";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import { Asset } from "@/generated/prisma/client";
import {
  useCreateAsset,
  useUpdateAsset,
  useItemsForSelect,
  useLocationsForSelect,
} from "@/hooks/crud/use-assets";
import { AssetForm, AssetFormSchema } from "@/schema/asset-schema";
import { getAssetFormAccess, isValidImageFile } from "@/lib/utils";
import { useActiveMemberRole } from "@/hooks/use-active-member";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Asset;
};

export function AssetActionDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const { data: role } = useActiveMemberRole()
  const { canView, isReadonly } = getAssetFormAccess(role)
  const { data: items } = useItemsForSelect();
  const { data: locations } = useLocationsForSelect();
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
      photo: undefined,
    },
  });

  useEffect(() => {
    if (currentRow) {
      form.reset({
        itemId: currentRow.itemId,
        purchaseDate: currentRow.purchaseDate
          ? format(new Date(currentRow.purchaseDate), "yyyy-MM-dd")
          : "",
        purchasePrice: currentRow.purchasePrice?.toString() ?? "",
        condition: currentRow.condition ?? "GOOD",
        warrantyExpire: currentRow.warrantyExpire
          ? format(new Date(currentRow.warrantyExpire), "yyyy-MM-dd")
          : "",
        brand: currentRow.brand ?? "",
        model: currentRow.model ?? "",
        partNumber: currentRow.partNumber ?? "",
        locationId: currentRow.locationId ?? "",
        departmentId: currentRow.departmentId ?? "",
        notes: currentRow.notes ?? "",
        kode_asset: currentRow.kode_asset ?? "",
        vendorName: currentRow.vendorName ?? "",
        garansi_exp: currentRow.garansi_exp
          ? format(new Date(currentRow.garansi_exp), "yyyy-MM-dd")
          : "",
        photo: undefined,
      });
      setImagePreview(currentRow.photoUrl ? `/uploads/${currentRow.photoUrl}` : null);
    } else {
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
        photo: undefined,
      });
      setImagePreview(null);
    }
    setImageError(null);
  }, [currentRow, form, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (!file) {
      setImagePreview(null);
      form.setValue("photo", undefined);
      return;
    }

    const validation = isValidImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || "File tidak valid");
      e.target.value = "";
      form.setValue("photo", undefined);
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
    form.setValue("photo", undefined);
    const fileInput = document.getElementById("photo-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = async (values: AssetForm) => {
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        if (key === "photo" && value instanceof File) {
          // Kirim file asli, bukan base64
          formData.append(key, value);
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    }

    try {
      if (isEdit && currentRow) {
        await updateMutation.mutateAsync({ id: currentRow.id, formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onOpenChange(false);
      form.reset();
      setImagePreview(null);
      setImageError(null);
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Aset" : "Tambah Aset"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui detail data aset."
              : "Daftarkan unit aset baru ke dalam sistem."}
          </DialogDescription>
        </DialogHeader>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KIRI: Informasi Utama */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-1">
                Informasi Item
              </h3>

              <Controller
                name="itemId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Master Item</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isReadonly}>
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Pilih item katalog..." />
                      </SelectTrigger>
                      <SelectContent>
                        {items?.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.code} - {item.name}
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
              {/* BRAND */}
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
              <div className="grid grid-cols-2 gap-4">
                {/* MODEL */}
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

                {/* PART NUMBER */}
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
              </div>

              <div className="grid grid-cols-2 gap-2">
                {canView && (
                  <Controller
                    name="kode_asset"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Asset Tag / kode_asset</FieldLabel>
                        <Input {...field} placeholder="AST-0001" readOnly={isReadonly} />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}
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
                          <SelectItem value="REPAIR">
                            Dalam Perbaikan
                          </SelectItem>
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
                    <Select value={field.value} onValueChange={field.onChange} disabled={isReadonly}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih lokasi..." />
                      </SelectTrigger>
                      <SelectContent>
                        {locations?.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Input type="number" {...field} placeholder="0" readOnly={isReadonly} />
                    </Field>
                  )}
                />
              </div>

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
                    <Input {...field} placeholder="e.g. PT Maju Bersama" readOnly={isReadonly} />
                  </Field>
                )}
              />
            </div>
          </div>

          {/* PHOTO UPLOAD SECTION */}
          <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
            <h3 className="font-semibold text-sm">Foto Aset</h3>

            {/* Image Preview */}
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

            {/* Image Error */}
            {imageError && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {imageError}
              </p>
            )}

            {/* File Input */}
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

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto"
            >
              {isPending ? "Menyimpan..." : "Simpan Data Aset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
