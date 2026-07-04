import { z } from "zod"
import { Role } from "../../enums/index.js"

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  logoKey: z.string().nullable(),
  createdAt: z.date(),
  metadata: z.string().nullable(),
  websiteId: z.string().nullable(),
  address: z.string().nullable(),
  gstin: z.string().nullable(),
  phone: z.string().nullable(),
})

export type Organization = z.infer<typeof OrganizationSchema>

export const MemberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: Role,
  createdAt: z.date(),
})

export type Member = z.infer<typeof MemberSchema>

export const InvitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string().email(),
  role: Role.nullable(),
  status: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
  inviterId: z.string(),
})

export type Invitation = z.infer<typeof InvitationSchema>
