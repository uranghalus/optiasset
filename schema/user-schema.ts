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
  role: z
    .array(z.string())
    .min(1, { message: "Role wajib dipilih" })
    .optional()
    .or(z.array(z.string()).length(0)),
});

export type UserForm = z.infer<typeof UserFormSchema>;
