import { z } from 'zod';

export const AssetFormSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  warrantyExpire: z.string().optional(),
  locationId: z.string().optional(),
  departmentId: z.string().optional(),
  notes: z.string().optional(),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),

  partNumber: z
    .string()
    .optional()
    .transform((val) => (val === '-' || val?.trim() === '' ? null : val)),

  condition: z.string().min(1, 'Condition is required'),

  serialNumber: z
    .string()
    .optional()
    .transform((val) => (val === '-' || val?.trim() === '' ? null : val)),

  no_spb: z.string().optional(),
  document_number: z.string().optional(),
  kode_asset: z.string().optional(),
  vendorName: z.string().optional(),
  garansi_exp: z.string().optional(),
  isAparOrHydrant: z
    .enum(['APAR', 'HYDRANT', 'NONE'])
    .optional()
    .default('NONE'),
  jenisApar: z.enum(['CO2', 'Powder', 'Foam', 'Air']).optional(),
  sizeApar: z.coerce.number().optional(),
  ukuranHydrant: z.string().optional(),
  assetGroupId: z.string().optional(),
  assetCategoryId: z.string().optional(),
  assetClusterId: z.string().optional(),
  assetSubClusterId: z.string().optional(),
  PIC: z.string().optional(),
  photos: z.array(z.instanceof(File)).optional().default([]),
  documentUrl: z.instanceof(File).optional().nullable(),
});

export type AssetForm = z.infer<typeof AssetFormSchema>;

export const ImportFormSchema = z.object({
  categoryId: z.string().min(1, 'Kategori Item wajib dipilih'),
  file: z
    .any()
    .refine((file) => file instanceof File, 'File Excel wajib diunggah'),
});

export type ImportForm = z.infer<typeof ImportFormSchema>;

export const AssetEditFormSchema = AssetFormSchema.partial({
  brand: true,
  model: true,
  partNumber: true,
  serialNumber: true,
});

export type AssetEditForm = z.infer<typeof AssetEditFormSchema>;

export function parsePhotoUrls(photoUrl: string | null): string[] {
  if (!photoUrl) return [];
  try {
    if (photoUrl.startsWith('[')) return JSON.parse(photoUrl);
    return [photoUrl];
  } catch {
    return [photoUrl];
  }
}

export function serializePhotoUrls(urls: string[]): string | null {
  if (!urls.length) return null;
  return JSON.stringify(urls);
}
