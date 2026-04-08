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
import { Checkbox } from "@/components/ui/checkbox";

import { useCreateUser, useUpdateUser } from "@/hooks/crud/use-users";
import { UserForm, UserFormSchema } from "@/schema/user-schema";
import { useRoles } from "@/hooks/crud/use-organization-roles";
import { useDepartments } from "@/hooks/crud/use-department";
import { useDivisi } from "@/hooks/crud/use-divisi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: any;
};

export function UserActionDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow;

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  // Fetch roles with a large limit string
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles(1, 100);
  const { data: deptData, isLoading: isLoadingDept } = useDepartments({
    page: 1,
    pageSize: 100,
  });
  const { data: divData, isLoading: isLoadingDiv } = useDivisi({
    page: 1,
    pageSize: 100,
  });

  const depts = deptData?.data || [];
  const divisis = divData?.data || [];
  const orgRoles = rolesData?.data || [];

  const form = useForm<UserForm>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      departmentId: "",
      divisiId: "",
      role: [],
    },
  });

  useEffect(() => {
    if (currentRow) {
      let userRoles: string[] = [];
      if (currentRow.role) {
        userRoles = currentRow.role.split(",").map((r: string) => r.trim());
      }
      form.reset({
        name: currentRow.name || "",
        email: currentRow.email || "",
        departmentId: currentRow.departmentId || "",
        divisiId: currentRow.divisiId || "",
        password: "", // Don't populate password on edit

        role: userRoles,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
        departmentId: "",
        divisiId: "",
        role: [],
      });
    }
  }, [currentRow, form, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: UserForm) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.email) formData.append("email", values.email);
    if (values.password) formData.append("password", values.password);
    if (values.role && values.role.length > 0) {
      formData.append("role", values.role.join(","));
    }
    if (values.departmentId)
      formData.append("departmentId", values.departmentId);
    if (values.divisiId) formData.append("divisiId", values.divisiId);

    try {
      if (isEdit && currentRow) {
        // Backend action currently only supports updating name according to the codebase
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
  // Only allow divisions that belong to the selected department
  const watchedDept = form.watch("departmentId");
  const filteredDivisis = divisis.filter(
    (d: any) => !watchedDept || d.department_id === watchedDept,
  );

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
          <DialogTitle>{isEdit ? "Edit User" : "Tambah User"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data user."
              : "Buat user baru untuk masuk ke sistem."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="user-form"
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
                  <FieldLabel>Nama</FieldLabel>
                  <Input
                    {...field}
                    placeholder="John Doe"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* EMAIL */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    {...field}
                    type="email"
                    placeholder="john@example.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* DEPARTMENT */}
            <Controller
              name="departmentId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Department (Opsional)</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Pilih department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDept ? (
                        <SelectItem value="loading" disabled>
                          Memuat...
                        </SelectItem>
                      ) : depts.length > 0 ? (
                        depts.map((d: any) => (
                          <SelectItem
                            key={d.id_department}
                            value={d.id_department}
                          >
                            {d.nama_department}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          Tidak ada department
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

            {/* DIVISI */}
            <Controller
              name="divisiId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Divisi (Opsional)</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      disabled={!watchedDept}
                    >
                      <SelectValue
                        placeholder={
                          watchedDept
                            ? "Pilih divisi..."
                            : "Pilih department dulu"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDiv ? (
                        <SelectItem value="loading" disabled>
                          Memuat...
                        </SelectItem>
                      ) : filteredDivisis.length > 0 ? (
                        filteredDivisis.map((d: any) => (
                          <SelectItem key={d.id_divisi} value={d.id_divisi}>
                            {d.nama_divisi}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          Tidak ada divisi
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
            {!isEdit && (
              <>
                {/* PASSWORD */}
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Password</FieldLabel>
                      <Input
                        {...field}
                        type="password"
                        placeholder="******"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

              </>
            )}
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
