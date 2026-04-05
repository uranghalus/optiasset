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

import { PermissionCheckboxGroup } from "@/components/permission-checkbox-group";

import {
  useCreateOrganization,
  useUpdateOrganization,
} from "@/hooks/crud/use-organizations";
import { OrgRoleForm, orgRoleFormSchema } from "@/schema/org-role-schema";

type OrgRoleRow = {
  id: string;
  role: string;
  permission: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: OrgRoleRow;
};

export function OrgRoleActionDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow;

  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();

  const form = useForm<OrgRoleForm>({
    resolver: zodResolver(orgRoleFormSchema),
    defaultValues: {
      role: "",
      permissions: {},
      isEdit,
    },
  });

  useEffect(() => {
    if (currentRow) {
      form.reset({
        role: currentRow.role,
        permissions:
          typeof currentRow.permission === "string"
            ? JSON.parse(currentRow.permission)
            : (currentRow.permission ?? {}),
        isEdit: true,
      });
    } else {
      form.reset({
        role: "",
        permissions: {},
        isEdit: false,
      });
    }
  }, [currentRow, form, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: OrgRoleForm) => {
    try {
      const formData = new FormData();
      formData.append("role", values.role);
      formData.append("permissions", JSON.stringify(values.permissions));

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
        message: "Terjadi kesalahan saat menyimpan role",
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "Tambah Role"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui role dan permissions."
              : "Buat role baru untuk organisasi."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="org-role-form"
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
            {/* ROLE */}
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Role Name</FieldLabel>
                  <Input
                    {...field}
                    placeholder="manager"
                    disabled={isEdit}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* PERMISSIONS */}
            <Controller
              name="permissions"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Permissions</FieldLabel>
                  <PermissionCheckboxGroup
                    value={field.value}
                    onChange={field.onChange}
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
