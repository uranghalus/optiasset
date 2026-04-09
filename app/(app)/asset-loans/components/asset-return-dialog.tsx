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
import { useReturnAsset } from "@/hooks/crud/use-asset-loans";
import { AssetReturnForm, AssetReturnSchema } from "@/schema/asset-loan-schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: any; // Using any for simplicity in relation data
};

export function AssetReturnDialog({ open, onOpenChange, loan }: Props) {
  const returnMutation = useReturnAsset();

  const form = useForm<AssetReturnForm>({
    resolver: zodResolver(AssetReturnSchema),
    defaultValues: {
      conditionOnReturn: "GOOD",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        conditionOnReturn: "GOOD",
        notes: "",
      });
    }
  }, [form, open]);

  const onSubmit = async (values: AssetReturnForm) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      await returnMutation.mutateAsync({ loanId: loan.id, formData });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kembalikan Aset</DialogTitle>
          <DialogDescription>
            Proses pengembalian aset dari{" "}
            <span className="font-bold text-foreground">
              {loan?.borrower?.name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Controller
            name="conditionOnReturn"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Kondisi Pengembalian</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOOD">Bagus / Utuh</SelectItem>
                    <SelectItem value="REPAIR">Perlu Perbaikan</SelectItem>
                    <SelectItem value="BROKEN">
                      Rusak / Tidak Bisa Pakai
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="notes"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Catatan Pengembalian</FieldLabel>
                <Textarea
                  {...field}
                  placeholder="Tambahkan keterangan jika ada kerusakan atau kelengkapan hilang..."
                />
              </Field>
            )}
          />

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={returnMutation.isPending}
              className="w-full"
            >
              {returnMutation.isPending ? "Memproses..." : "Konfirmasi Kembali"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
