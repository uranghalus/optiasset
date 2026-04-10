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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import { Asset } from "@/generated/prisma/client";
import {
  useCreateAsset,
  useUpdateAsset,
  useItemsForSelect,
  useLocationsForSelect,
} from "@/hooks/crud/use-assets";
import { AssetForm, AssetFormSchema } from "@/schema/asset-schema";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Asset;
};

export function AssetActionDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow;

  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();

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
      barcode: "",
      vendorName: "",
      garansi_exp: "",
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
        locationId: currentRow.locationId ?? "",
        departmentId: currentRow.departmentId ?? "",
        notes: currentRow.notes ?? "",
        barcode: currentRow.barcode ?? "",
        vendorName: currentRow.vendorName ?? "",
        garansi_exp: currentRow.garansi_exp
          ? format(new Date(currentRow.garansi_exp), "yyyy-MM-dd")
          : "",
      });
    } else {
      form.reset({
        itemId: "",
        purchaseDate: format(new Date(), "yyyy-MM-dd"),
        purchasePrice: "",
        condition: "GOOD",
        warrantyExpire: "",
        locationId: "",
        departmentId: "",
        notes: "",
        barcode: "",
        vendorName: "",
        garansi_exp: "",
      });
    }
  }, [currentRow, form, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: AssetForm) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

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
                    <Select value={field.value} onValueChange={field.onChange}>
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

              <div className="grid grid-cols-2 gap-2">
                <Controller
                  name="barcode"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Asset Tag / Barcode</FieldLabel>
                      <Input {...field} placeholder="AST-0001" />
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                      <Input type="number" {...field} placeholder="0" />
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
                    <Input type="date" {...field} />
                  </Field>
                )}
              />

              <Controller
                name="vendorName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Vendor / Toko</FieldLabel>
                    <Input {...field} placeholder="e.g. PT Maju Bersama" />
                  </Field>
                )}
              />
            </div>
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
