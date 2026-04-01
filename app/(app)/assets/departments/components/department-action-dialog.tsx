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
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { department } from "@/generated/prisma/client";
import {
  useCreateDepartment,
  useUpdateDepartment,
} from "@/hooks/crud/use-department";
import {
  DepartmentForm,
  DepartmentFormSchema,
} from "@/schema/department-schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: department;
};

export function DepartmentActionDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const isEdit = !!currentRow;

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const form = useForm<DepartmentForm>({
    resolver: zodResolver(DepartmentFormSchema),
    defaultValues: {
      kode_department: "",
      nama_department: "",
      id_hod: "",
    },
  });

  useEffect(() => {
    if (currentRow) {
      form.reset({
        kode_department: currentRow.kode_department,
        nama_department: currentRow.nama_department,
        id_hod: currentRow.id_hod,
      });
    } else {
      form.reset({
        kode_department: "",
        nama_department: "",
        id_hod: "",
      });
    }
  }, [currentRow, form, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: DepartmentForm) => {
    const formData = new FormData();
    formData.append("kode_department", values.kode_department);
    formData.append("nama_department", values.nama_department);
    formData.append("id_hod", values.id_hod);

    try {
      if (isEdit && currentRow) {
        await updateMutation.mutateAsync({
          id: currentRow.id_department,
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
          <DialogTitle>
            {isEdit ? "Edit Department" : "Tambah Department"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui data department." : "Buat department baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="department-form"
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
              name="kode_department"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Kode Department</FieldLabel>
                  <Input
                    {...field}
                    placeholder="DEP-001"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="nama_department"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Nama Department</FieldLabel>
                  <Input
                    {...field}
                    placeholder="IT"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="id_hod"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>ID HOD</FieldLabel>
                  <Input
                    {...field}
                    placeholder="HOD-001"
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
