import { auth } from "../../lib/better-auth/auth.js"
import { HTTP_STATUS_CODES } from "../../lib/utils.js"

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
}
