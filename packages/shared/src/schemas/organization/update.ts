import { z } from "zod"

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  websiteId: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  gstin: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
})

export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationSchema>

export const UpdateMemberSchema = z.object({
  role: z.string().optional(),
})

export type UpdateMemberDto = z.infer<typeof UpdateMemberSchema>
