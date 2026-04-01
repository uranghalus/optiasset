import { z } from "zod";

export const DivisiFormSchema = z.object({
  department_id: z.string().min(1, "Department is required"),
  nama_divisi: z.string().min(1, "Nama Divisi is required"),
  ext_tlp: z.string().min(1, "Ext. Telepon is required"),
});

export type DivisiForm = z.infer<typeof DivisiFormSchema>;
