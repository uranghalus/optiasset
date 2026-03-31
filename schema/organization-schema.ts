import { z } from "zod";

export const OrganizationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

export type OrganizationForm = z.infer<typeof OrganizationFormSchema>;
