import { z } from "zod";

export const MemberFormSchema = z.object({
  userId: z.string().min(1, { message: "User wajib dipilih" }),
  role: z.array(z.string()).min(1, { message: "Pilih minimal satu role" }),

});

export type MemberForm = z.infer<typeof MemberFormSchema>;
