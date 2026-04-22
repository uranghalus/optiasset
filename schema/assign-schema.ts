import { z } from 'zod';
export const AssignSchema = z.object({
  departmentId: z.string().min(1, 'Departemen Wajib di Isi!'),
  user_id: z.string().min(1, 'Anda Wajib Pilih 1 User'),
});
export type AssignForm = z.infer<typeof AssignSchema>;
