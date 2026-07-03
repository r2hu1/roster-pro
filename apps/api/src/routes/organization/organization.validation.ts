import { z } from "zod"

export const createOrganizationSchema = z.object({
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
})

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  websiteId: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
})
