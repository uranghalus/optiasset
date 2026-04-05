import { z } from 'zod';

export const orgRoleFormSchema = z.object({
  role: z.string().min(2),
  permissions: z.record(z.string(), z.array(z.string())),
  isEdit: z.boolean().optional(),
});

export type OrgRoleForm = z.infer<typeof orgRoleFormSchema>;
