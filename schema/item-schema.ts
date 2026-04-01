import { z } from "zod";

export const ItemFormSchema = z.object({
  code: z.string().min(1, "Kode Item is required"),
  name: z.string().min(1, "Nama Item is required"),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  partNumber: z.string().optional(),
  description: z.string().optional(),
  assetType: z.enum(["FIXED", "SUPPLY"]),
});

export type ItemForm = z.infer<typeof ItemFormSchema>;
