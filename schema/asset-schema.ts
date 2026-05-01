import { z } from "zod";

export const AssetFormSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  warrantyExpire: z.string().optional(),
  locationId: z.string().optional(),
  departmentId: z.string().optional(),
  notes: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  partNumber: z.string().min(1, "Part Number is required"),
  condition: z.string().min(1, "Condition is required"),
  serialNumber: z.string().min(1, "Serial Number is required"),
  no_spb: z.string().optional(),
  document_number: z.string().optional(),
  kode_asset: z.string().optional(),
  vendorName: z.string().optional(),
  garansi_exp: z.string().optional(),
  assetGroupId: z.string().min(1, "Golongan wajib dipilih"),
  assetCategoryId: z.string().min(1),
  assetClusterId: z.string().min(1),
  assetSubClusterId: z.string().min(1),
  photo: z.instanceof(File).optional().nullable(),
});

export type AssetForm = z.infer<typeof AssetFormSchema>;
