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
  partNumber: z.string().min(1, 'Part Number is required'),
  condition: z.string().min(1, 'Condition is required'),
  serialNumber: z.string().min(1, 'Serial Number is required'),
  no_spb: z.string().optional(),
  document_number: z.string().optional(),
  kode_asset: z.string().optional(),
  vendorName: z.string().optional(),
  garansi_exp: z.string().optional(),
  // 👇 TAMBAHKAN FIELD INI DI BAGIAN BAWAH SCHEMA ANDA 👇
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
  photo: z.instanceof(File).optional().nullable(),
});

export type AssetForm = z.infer<typeof AssetFormSchema>;
export const ImportFormSchema = z.object({
  categoryId: z.string().min(1, 'Kategori Item wajib dipilih'),
  file: z
    .any()
    .refine((file) => file instanceof File, 'File Excel wajib diunggah'),
});

export type ImportForm = z.infer<typeof ImportFormSchema>;

// Schema untuk form edit: biarkan field detail (brand, model, partNumber, serialNumber)
// bersifat opsional sehingga edit tidak wajib mengirim ulang semua detail.
export const AssetEditFormSchema = AssetFormSchema.partial({
  brand: true,
  model: true,
  partNumber: true,
  serialNumber: true,
});

export type AssetEditForm = z.infer<typeof AssetEditFormSchema>;
