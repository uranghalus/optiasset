import { z } from 'zod';

export const orgRoleFormSchema = z.object({
  role: z.string().min(2, 'Role name minimal 2 karakter'),
  permissions: z.record(z.string(), z.array(z.string())).refine(
    (permissions) => {
      // Cek apakah ada minimal satu permission yang dipilih
      return Object.values(permissions).some((actions) => actions.length > 0);
    },
    {
      message: 'Pilih minimal satu permission',
    },
  ),
  isEdit: z.boolean().optional(),
});

export type OrgRoleForm = z.infer<typeof orgRoleFormSchema>;
