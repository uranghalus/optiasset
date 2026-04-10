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

import { Asset } from "@/generated/prisma/client";
import {
  useAssetTransfers,
  useTransferAsset,
  useDivisiForSelect,
} from "@/hooks/crud/use-asset-transfers";
import {
  useLocationsForSelect,
  useDepartmentsForAssetSelect,
} from "@/hooks/crud/use-assets";
import {
  AssetTransferForm,
  AssetTransferSchema,
} from "@/schema/asset-transfer-schema";

type AssetWithItem = Asset & {
  item: {
    name: string;
    serialNumber?: string | null;
  };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: AssetWithItem;
};

export function AssetTransferDialog({ open, onOpenChange, asset }: Props) {
  const transferMutation = useTransferAsset();
  const { data: locations } = useLocationsForSelect();
  const { data: departments } = useDepartmentsForAssetSelect();

  const form = useForm<AssetTransferForm>({
    resolver: zodResolver(AssetTransferSchema),
    defaultValues: {
      assetId: asset.id,
      toLocationId: asset.locationId || "",
      toDeptId: asset.departmentId || "",
      toDivId: "",
      reason: "",
    },
  });

  const selectedDeptId = form.watch("toDeptId");
  const { data: divisions } = useDivisiForSelect(selectedDeptId);

  useEffect(() => {
    if (open) {
      form.reset({
        assetId: asset.id,
        toLocationId: asset.locationId || "",
        toDeptId: asset.departmentId || "",
        toDivId: "",
        reason: "",
      });
    }
  }, [asset, form, open]);

  const onSubmit = async (values: AssetTransferForm) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      await transferMutation.mutateAsync(formData);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mutasi Aset</DialogTitle>
          <DialogDescription>
            Pindahkan aset{" "}
            <span className="font-bold text-foreground">
              {asset.barcode || asset.item.serialNumber}
            </span>{" "}
            ke lokasi atau departemen baru.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Controller
            name="toLocationId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Lokasi Baru</FieldLabel>
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="toDeptId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Departemen Baru</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept) => (
                      <SelectItem
                        key={dept.id_department}
                        value={dept.id_department}
                      >
                        {dept.nama_department}
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

          <Controller
            name="toDivId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Divisi Baru (Opsional)</FieldLabel>
                <Select
                  disabled={!selectedDeptId}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih divisi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions?.map((div) => (
                      <SelectItem key={div.id_divisi} value={div.id_divisi}>
                        {div.nama_divisi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="reason"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Alasan Mutasi</FieldLabel>
                <Textarea
                  {...field}
                  placeholder="Contoh: Perpindahan meja kerja, penugasan baru..."
                />
              </Field>
            )}
          />

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={transferMutation.isPending}
              className="w-full"
            >
              {transferMutation.isPending
                ? "Memproses..."
                : "Konfirmasi Mutasi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
