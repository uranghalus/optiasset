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

import { Organization } from "@/generated/prisma/client";
import {
  useCreateOrganization,
  useUpdateOrganization,
} from "@/hooks/crud/use-organizations";
import {
  OrganizationForm,
  OrganizationFormSchema,
} from "@/schema/organization-schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Organization;
};

export function OrganizationActionDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const isEdit = !!currentRow;

  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();

  const form = useForm<OrganizationForm>({
    resolver: zodResolver(OrganizationFormSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name,
        slug: currentRow.slug,
      });
    } else {
      form.reset({
        name: "",
        slug: "",
      });
    }
  }, [currentRow, form, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: OrganizationForm) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("slug", values.slug);

    try {
      if (isEdit && currentRow) {
        await updateMutation.mutateAsync({
          id: currentRow.id,
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
            {isEdit ? "Edit Organisasi" : "Tambah Organisasi"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui data organisasi." : "Buat organisasi baru."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="organization-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* GLOBAL ERROR */}
          {form.formState.errors.root?.message && (
            <p className="text-sm text-red-500">
              {form.formState.errors.root.message}
            </p>
          )}

          <FieldGroup>
            {/* NAME */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Nama Organisasi</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Contoh: PT. Maju Bersama"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* SLUG */}
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Slug</FieldLabel>
                  <Input
                    {...field}
                    placeholder="contoh-pt-maju"
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
