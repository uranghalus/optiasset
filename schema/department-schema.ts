import { z } from 'zod';

export const DepartmentFormSchema = z.object({
  id_department: z.string().optional(),
  kode_department: z.string().min(1, 'Kode Department is required'),
  nama_department: z.string().min(1, 'Nama Department is required'),
  id_hod: z.string().min(1, 'ID HOD is required'),
});

export type DepartmentForm = z.infer<typeof DepartmentFormSchema>;
