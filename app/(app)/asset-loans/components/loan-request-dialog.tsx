"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";

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
import {
  useRequestLoan,
  useLoanDepartments,
  useLoanDivisis,
  useAvailableLoanAssets,
  useUsersForSelect,
} from "@/hooks/crud/use-asset-loans";

const RequestSchema = z.object({
  departmentId: z.string().min(1, "Departemen tujuan diperlukan"),
  divisiId: z.string().optional(),
  assetId: z.string().min(1, "Aset yang dipinjam diperlukan"),
  borrowerId: z.string().min(1, "Peminjam diperlukan"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type RequestForm = z.infer<typeof RequestSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LoanRequestDialog({ open, onOpenChange }: Props) {
  const loanMutation = useRequestLoan();
  const { data: users } = useUsersForSelect();
  const { data: depts } = useLoanDepartments();

  const form = useForm<RequestForm>({
    resolver: zodResolver(RequestSchema),
    defaultValues: {
      departmentId: "",
      divisiId: "",
      assetId: "",
      borrowerId: "",
      dueDate: "",
      notes: "",
    },
  });

  const selectedDept = form.watch("departmentId");
  const selectedDiv = form.watch("divisiId");

  const { data: divisis } = useLoanDivisis(selectedDept);
  const { data: assets, isLoading: assetsLoading } = useAvailableLoanAssets(
    selectedDept,
    selectedDiv,
  );

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: RequestForm) => {
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
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Buat Pengajuan Peminjaman</DialogTitle>
          <DialogDescription>
            Ajukan permintaan peminjaman aset untuk diri sendiri atau personil
            lain.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="departmentId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Departemen Tujuan</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue("assetId", ""); // Reset asset on dept change
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih departemen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {depts?.map((d: any) => (
                        <SelectItem
                          key={d.id_department}
                          value={d.id_department}
                        >
                          {d.nama_department}
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
              name="divisiId"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Divisi (Opsional)</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue("assetId", ""); // Reset asset on divisi change
                    }}
                    disabled={!selectedDept}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua divisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Divisi</SelectItem>
                      {divisis?.map((d: any) => (
                        <SelectItem key={d.id_divisi} value={d.id_divisi}>
                          {d.nama_divisi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          <Controller
            name="assetId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Pilih Aset</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedDept || assetsLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        assetsLoading
                          ? "Memuat aset..."
                          : "Pilih aset yang tersedia..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {assets?.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.item.name} (
                        {a.barcode || a.item.serialNumber || "Tanpa Kode"})
                      </SelectItem>
                    ))}
                    {assets?.length === 0 && (
                      <div className="p-2 text-xs text-center text-muted-foreground">
                        Tidak ada aset tersedia
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

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
                    {users?.map((u: any) => (
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
            render={({ field }) => (
              <Field>
                <FieldLabel>Tgl. Kembali Estimasi</FieldLabel>
                <Input type="date" {...field} />
              </Field>
            )}
          />

          <Controller
            name="notes"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Keperluan / Catatan</FieldLabel>
                <Textarea {...field} placeholder="Tujuan meminjam barang..." />
              </Field>
            )}
          />

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={loanMutation.isPending}
              className="w-full"
            >
              {loanMutation.isPending ? "Mengirim..." : "Kirim Pengajuan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
