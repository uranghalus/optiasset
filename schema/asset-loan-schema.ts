import { z } from "zod";

export const AssetLoanSchema = z.object({
  assetId: z.string().min(1, "ID Aset diperlukan"),
  borrowerId: z.string().min(1, "Peminjam diperlukan"),
  dueDate: z.string().optional(),
  conditionOnLoan: z.string().optional(),
  notes: z.string().optional(),
});

export type AssetLoanForm = z.infer<typeof AssetLoanSchema>;

export const AssetReturnSchema = z.object({
  conditionOnReturn: z.string().min(1, "Kondisi pengembalian diperlukan"),
  notes: z.string().optional(),
});

export type AssetReturnForm = z.infer<typeof AssetReturnSchema>;
