/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { PasswordInput } from "@/components/password-input";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export default function PasswordForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: any) {
    setLoading(true);

    try {
      await toast.promise(
        async () => {
          const { error } = await authClient.changePassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          });

          if (error) {
            throw error;
          }

          return "Password updated successfully";
        },
        {
          loading: "Updating password...",
          success: (message) => {
            form.reset();
            return {
              message: "Berhasil!!",
              description: message,
            };
          },
          error: (error) => error?.message || "Failed to update password",
        },
      );
    } catch (error) {
      console.error("Update password error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border border-gray-100 rounded-lg">
      <div className="mb-6">
        <h3 className="text-sm font-semibold border-b pb-2">Update Password</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Ubah kata sandi anda untuk meningkatkan keamanan akun
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="currentPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Password Lama</FieldLabel>
              <PasswordInput
                {...field}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="newPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Password Baru</FieldLabel>
              <PasswordInput
                {...field}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Konfirmasi Password Baru</FieldLabel>
              <PasswordInput
                {...field}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
