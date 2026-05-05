import { z } from "zod";

export const UserFormSchema = z.object({
  name: z.string().min(1, { message: "Nama wajib diisi" }),
  email: z
    .string()
    .email({ message: "Format email tidak valid" })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, { message: "Password minimal 6 karakter" })
    .optional()
    .or(z.literal("")),
  departmentId: z.string().optional(),
  divisiId: z.string().optional(),
  role: z
    .array(z.string())
    .min(1, { message: "Role wajib dipilih" })
    .optional()
    .or(z.array(z.string()).length(0)),
});

export type UserForm = z.infer<typeof UserFormSchema>;

export const banUserSchema = z.object({
  banReason: z.string().min(5, "Alasan ban minimal 5 karakter"),
  banExpiresInDays: z.number().min(1, "Minimal 1 hari"),
});

export type BanUserInput = z.infer<typeof banUserSchema>;