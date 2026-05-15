import { z } from 'zod';

export const CategoryFormSchema = z.object({
  assetGroupId: z.string().optional(),
  assetCategoryId: z.string().optional(),
  assetClusterId: z.string().optional(),
  assetSubClusterId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
});

export type CategoryForm = z.infer<typeof CategoryFormSchema>;
