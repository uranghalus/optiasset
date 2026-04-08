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

import { Button } from "@/components/ui/button";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateMember, useUpdateMember } from "@/hooks/crud/use-members";
import { MemberForm, MemberFormSchema } from "@/schema/member-schema";

import { useRoles } from "@/hooks/crud/use-organization-roles";
import { useUsers } from "@/hooks/crud/use-users";
import { useDepartments } from "@/hooks/crud/use-department";
import { useDivisi } from "@/hooks/crud/use-divisi";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: any; // MemberWithRelations
};

export function MemberActionDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow;

  const createMutation = useCreateMember();
  const updateMutation = useUpdateMember();

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({
    page: 1,
    limit: 100,
  });
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles(1, 100);

  const users = usersData?.data || [];
  const orgRoles = rolesData?.data || [];


  const form = useForm<MemberForm>({
    resolver: zodResolver(MemberFormSchema),
    defaultValues: {
      userId: "",
      role: [],

    },
  });

  useEffect(() => {
    if (currentRow) {
      let currentRoles: string[] = [];
      if (currentRow.role) {
        currentRoles = currentRow.role.split(",").map((r: string) => r.trim());
      }
      form.reset({
        userId: currentRow.userId || "",
        role: currentRoles,

      });
    } else {
      form.reset({
        userId: "",
        role: [],

      });
    }
  }, [currentRow, form, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: MemberForm) => {
    const formData = new FormData();
    formData.append("userId", values.userId);
    if (values.role && values.role.length > 0) {
      formData.append("role", values.role.join(","));
    }

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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Member" : "Tambah Member"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui role dan divisi dari member ini."
              : "Masukkan user ke organisasi ini sebagai member."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="member-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {form.formState.errors.root?.message && (
            <p className="text-sm text-red-500">
              {form.formState.errors.root.message}
            </p>
          )}

          <FieldGroup>
            {/* USER ID (Only editable when creating) */}
            <Controller
              name="userId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Pilih User</FieldLabel>
                  <Select
                    disabled={isEdit}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Pilih user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled>
                          Memuat...
                        </SelectItem>
                      ) : users.length > 0 ? (
                        users.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          Tidak ada user
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* ROLE (MULTI SELECT) */}
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Role</FieldLabel>
                  <div className="grid grid-cols-2 gap-3 mt-1 border rounded-md p-3 max-h-40 overflow-y-auto bg-background">
                    {isLoadingRoles ? (
                      <p className="text-xs text-muted-foreground col-span-2">
                        Memuat role...
                      </p>
                    ) : orgRoles.length > 0 ? (
                      orgRoles.map((role: any) => (
                        <label
                          key={role.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={field.value?.includes(role.role)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              const updated = checked
                                ? [...current, role.role]
                                : current.filter((r) => r !== role.role);
                              field.onChange(updated);
                            }}
                          />
                          <span className="text-sm font-medium capitalize">
                            {role.role}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground col-span-2">
                        Tidak ada role ditemukan.
                      </p>
                    )}
                  </div>
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
