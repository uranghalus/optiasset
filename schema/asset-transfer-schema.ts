import { z } from "zod";

export const AssetTransferSchema = z.object({
  assetId: z.string().min(1, "ID Aset diperlukan"),
  toLocationId: z.string().optional(),
  toDeptId: z.string().optional(),
  toDivId: z.string().optional(),
  reason: z.string().optional(),
});

export type AssetTransferForm = z.infer<typeof AssetTransferSchema>;
