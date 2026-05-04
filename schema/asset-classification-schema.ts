import { z } from "zod";

export const ImportAssetExcelSchema = z.object({
  file: z.instanceof(File, { message: "File Excel diperlukan" }),
});

export type ImportAssetExcelForm = z.infer<typeof ImportAssetExcelSchema>;
