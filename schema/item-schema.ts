import { z } from 'zod';

export const ItemFormSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Nama Item is required'),
  categoryId: z.string().optional(),

  description: z.string().optional(),
  assetType: z.enum(['FIXED', 'SUPPLY']),
});

export type ItemForm = z.infer<typeof ItemFormSchema>;
