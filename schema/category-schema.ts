import { z } from 'zod';

export const CategoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type CategoryForm = z.infer<typeof CategoryFormSchema>;
