import { z } from "zod"
import { OrganizationSchema, MemberSchema } from "./base.js"

export const OrganizationResponseSchema = OrganizationSchema

export type OrganizationResponse = z.infer<typeof OrganizationResponseSchema>

export const OrganizationListResponseSchema = z.array(OrganizationSchema)

export type OrganizationListResponse = z.infer<
  typeof OrganizationListResponseSchema
>

export const MemberResponseSchema = MemberSchema

export type MemberResponse = z.infer<typeof MemberResponseSchema>
