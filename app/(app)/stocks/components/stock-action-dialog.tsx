"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { useRecordStockTransaction } from "@/hooks/crud/use-stocks";

const TransactionSchema = z.object({
  quantity: z.number().min(1, "Jumlah harus minimal 1"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionForm = z.infer<typeof TransactionSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "IN" | "OUT" | "ADJUSTMENT";
  stock: any;
};

export default function StockActionDialog({
  open,
  onOpenChange,
  type,
  stock,
}: Props) {
  const mutation = useRecordStockTransaction();

  const form = useForm<TransactionForm>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      quantity: 1,
      reference: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        quantity: 1,
        reference: "",
        notes: "",
      });
    }
  }, [open, form]);

  const onSubmit = async (values: TransactionForm) => {
    try {
      await mutation.mutateAsync({
        stockId: stock.id,
        type,
        quantity: values.quantity,
        reference: values.reference,
        notes: values.notes,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getTitle = () => {
    switch (type) {
      case "IN":
        return "Stok Masuk";
      case "OUT":
        return "Stok Keluar";
      case "ADJUSTMENT":
        return "Penyesuaian Stok";
    }
  };

  const getDescription = () => {
    return `${getTitle()} untuk ${stock?.item?.name} (${stock?.item?.code})`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            {/* QUANTITY */}
            <Controller
              name="quantity"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Jumlah</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    placeholder="Masukkan jumlah..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* REFERENCE */}
            <Controller
              name="reference"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Referensi (Opsional)</FieldLabel>
                  <Input {...field} placeholder="Contoh: No. Invoice, dsb..." />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* NOTES */}
            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Catatan (Opsional)</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Tambahkan keterangan tambahan jika ada..."
                    className="resize-none"
                    rows={3}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Memproses..." : "Simpan Transaksi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
