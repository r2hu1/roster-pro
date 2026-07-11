import { z } from "zod"

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
  metadata: z.record(z.string(), z.unknown()).optional(),
  websiteId: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  gstin: z.string().nullable().optional(),
  hsnSac: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  gstRate: z.number().nullable().optional(),
})

export type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>

export const defaultCreateOrganization: z.input<typeof CreateOrganizationSchema> = {
  name: "",
  slug: "",
}
