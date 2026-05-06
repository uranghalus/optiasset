/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(1, "Name wajib diisi"),
  username: z.string().min(1, "Username wajib diisi"),
  email: z.string().email(),
});

export default function FormProfile() {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
    },
  });

  // Fetch session & autofill
  useEffect(() => {
    async function loadUser() {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        form.reset({
          name: session.data?.user.name ?? "",
          username: session.data?.user.username ?? "",
          email: session.data?.user.email ?? "",
        });
      }
    }
    loadUser();
  }, []);

  async function onSubmit(values: any) {
    setLoading(true);

    try {
      await toast.promise(
        async () => {
          const { error } = await authClient.updateUser({
            name: values.name,
            username: values.username,
            image: null,
          });

          if (error) throw error;

          return "User updated successfully";
        },
        {
          loading: "Updating user...",
          success: (message) => ({
            message: "Berhasil!!",
            description: message,
          }),
          error: (error) => error?.message || "Failed to update user",
        },
      );
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border border-gray-100 rounded-lg">
      <div className="mb-6">
        <h3 className="text-sm font-semibold border-b pb-2">
          Informasi Profil
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Kelola informasi dasar akun Anda
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Nama</FieldLabel>
              <Input placeholder="Nama lengkap" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Username</FieldLabel>
              <Input placeholder="username" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Email</FieldLabel>
              <Input
                placeholder="email@example.com"
                {...field}
                readOnly
                className="bg-slate-50 cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Email tidak dapat diubah dari menu ini
              </p>
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
