import { eq } from "drizzle-orm"
import { db } from "../../core/db/client.js"
import { organization } from "../../core/db/schemas/auth.js"
import { auth } from "../../lib/better-auth/auth.js"
import { HTTP_STATUS_CODES } from "../../lib/utils.js"
import type { UpdateOrganizationDto } from "@workspace/shared/types/organization/dto"

export const organizationLogic = {
  me: async (headers: HeadersInit) => {
    let organization = await auth.api.getFullOrganization({
      headers,
    })
    if (!organization) {
      const organizations = await auth.api.listOrganizations({
        headers,
      })
      const firstOrganization = organizations?.[0]
      if (!firstOrganization) {
        return {
          status: "error",
          message: "No organization found",
          code: HTTP_STATUS_CODES.NOT_FOUND,
        }
      }
      organization = await auth.api.getFullOrganization({
        headers,
        query: {
          organizationId: firstOrganization.id,
        },
      })
    }
    return {
      status: "success",
      data: organization,
      code: HTTP_STATUS_CODES.OK,
    }
  },
  update: async (headers: HeadersInit, body: UpdateOrganizationDto) => {
    const userOrg = await auth.api.getFullOrganization({
      headers,
    })
    if (!userOrg)
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    const [getOrg] = await db
      .select()
      .from(organization)
      .where(eq(userOrg.id as any, organization.id))

    const updOrg = await db
      .update(organization)
      .set({
        name: body.name ?? getOrg.name,
        logo: body.logo ?? getOrg.logo,
        logoKey: body.logoKey ?? getOrg.logoKey,
        address: body.address ?? getOrg.address,
        metadata: JSON.stringify(body.metadata) ?? getOrg.metadata,
        websiteId: body.websiteId ?? getOrg.websiteId,
      })
      .returning()

    if (updOrg!) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Cannot update organization",
      }
    }
    return {
      status: "success",
      code: HTTP_STATUS_CODES.OK,
      data: updOrg[0],
    }
  },
}
