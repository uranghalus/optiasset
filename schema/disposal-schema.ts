import { z } from 'zod';

export const DisposalFormSchema = z.object({
  assetId: z.string().min(1, 'Aset wajib dipilih'),
  reason: z.string().min(1, 'Alasan penghapusan wajib diisi'),
});

export type DisposalForm = z.infer<typeof DisposalFormSchema>;
