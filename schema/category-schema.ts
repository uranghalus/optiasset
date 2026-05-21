import { z } from 'zod';

export const CategoryFormSchema = z.object({
  assetGroupId: z.string().optional(),
  assetCategoryId: z.string().optional(),
  assetClusterId: z.string().optional(),
  assetSubClusterId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
});

export type CategoryForm = z.infer<typeof CategoryFormSchema>;
export const ImportCategoryExcelSchema = z.object({
  file: z
    .custom<File>((val) => val instanceof File, 'File wajib diunggah')
    .refine(
      (file) =>
        [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
        ].includes(file.type),
      'Format file harus .xlsx atau .xls',
    ),
});

export type ImportCategoryExcelForm = z.infer<typeof ImportCategoryExcelSchema>;
