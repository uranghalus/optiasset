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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { divisi } from "@/generated/prisma/client";
import {
  useCreateDivisi,
  useDepartmentsForSelect,
  useUpdateDivisi,
} from "@/hooks/crud/use-divisi";
import { DivisiForm, DivisiFormSchema } from "@/schema/divisi-schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: divisi;
};

export function DivisiActionDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow;

  const createMutation = useCreateDivisi();
  const updateMutation = useUpdateDivisi();
  const { data: departments } = useDepartmentsForSelect();

  const form = useForm<DivisiForm>({
    resolver: zodResolver(DivisiFormSchema),
    defaultValues: {
      department_id: "",
      nama_divisi: "",
      ext_tlp: "",
    },
  });

  useEffect(() => {
    if (currentRow) {
      form.reset({
        department_id: currentRow.department_id,
        nama_divisi: currentRow.nama_divisi,
        ext_tlp: currentRow.ext_tlp,
      });
    } else {
      form.reset({
        department_id: "",
        nama_divisi: "",
        ext_tlp: "",
      });
    }
  }, [currentRow, form, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: DivisiForm) => {
    const formData = new FormData();
    formData.append("department_id", values.department_id);
    formData.append("nama_divisi", values.nama_divisi);
    formData.append("ext_tlp", values.ext_tlp);

    try {
      if (isEdit && currentRow) {
        await updateMutation.mutateAsync({
          id: currentRow.id_divisi,
          formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);
      form.setError("root", {
        type: "server",
        message: "Terjadi kesalahan saat menyimpan data",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Divisi" : "Tambah Divisi"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui data divisi." : "Buat divisi baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="divisi-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {form.formState.errors.root?.message && (
            <p className="text-sm text-red-500">
              {form.formState.errors.root.message}
            </p>
          )}

          <FieldGroup>
            <Controller
              name="department_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Department</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Pilih department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem
                          key={dept.id_department}
                          value={dept.id_department}
                        >
                          {dept.kode_department} - {dept.nama_department}
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
              name="nama_divisi"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Nama Divisi</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Divisi IT"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="ext_tlp"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Ext. Telepon</FieldLabel>
                  <Input
                    {...field}
                    placeholder="101"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
