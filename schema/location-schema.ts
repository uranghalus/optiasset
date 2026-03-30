import { z } from "zod";

export const LocationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type LocationForm = z.infer<typeof LocationFormSchema>;
