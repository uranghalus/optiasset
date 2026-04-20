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

import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import { Asset } from "@/generated/prisma/client";
import {
  useRequestLoan,
  useUsersForSelect,
} from "@/hooks/crud/use-asset-loans";
import { AssetLoanForm, AssetLoanSchema } from "@/schema/asset-loan-schema";

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

export function AssetLoanDialog({ open, onOpenChange, asset }: Props) {
  const loanMutation = useRequestLoan();
  const { data: users } = useUsersForSelect();

  const form = useForm<AssetLoanForm>({
    resolver: zodResolver(AssetLoanSchema),
    defaultValues: {
      assetId: asset.id,
      borrowerId: "",
      dueDate: "",
      conditionOnLoan: asset.condition || "GOOD",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        assetId: asset.id,
        borrowerId: "",
        dueDate: "",
        conditionOnLoan: asset.condition || "GOOD",
        notes: "",
      });
    }
  }, [asset, form, open]);

  const onSubmit = async (values: AssetLoanForm) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      await loanMutation.mutateAsync(formData);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pinjamkan Aset</DialogTitle>
          <DialogDescription>
            Pinjamkan aset{" "}
            <span className="font-bold text-foreground">
              {asset.kode_asset || asset.item.serialNumber}
            </span>{" "}
            kepada personil.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Controller
            name="borrowerId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Peminjam</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih personil..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
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
            name="dueDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Tanggal Kembali (Estimasi)</FieldLabel>
                <Input type="date" {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="conditionOnLoan"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Kondisi Saat Dipinjam</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOOD">Bagus</SelectItem>
                    <SelectItem value="REPAIR">Dalam Perbaikan</SelectItem>
                    <SelectItem value="BROKEN">Rusak</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="notes"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Catatan</FieldLabel>
                <Textarea
                  {...field}
                  placeholder="Tujuan peminjaman, proyek terkait, dll..."
                />
              </Field>
            )}
          />

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={loanMutation.isPending}
              className="w-full"
            >
              {loanMutation.isPending ? "Memproses..." : "Konfirmasi Pinjam"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
