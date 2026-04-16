import { z } from 'zod';

export const AssetFormSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  condition: z.string().optional(),
  warrantyExpire: z.string().optional(),
  locationId: z.string().optional(),
  departmentId: z.string().optional(),
  notes: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  partNumber: z.string().optional(),
  barcode: z.string().optional(),
  vendorName: z.string().optional(),
  garansi_exp: z.string().optional(),
});

export type AssetForm = z.infer<typeof AssetFormSchema>;
