import { auth } from "../../lib/better-auth/auth.js"
import { HTTP_STATUS_CODES } from "../../lib/utils.js"

export const userLogic = {
  organization: async (headers:HeadersInit) => {
    const userOrg = await auth.api.listOrganizations({
      headers,
    });
    return {
      status: "success",
      data: userOrg[0],
      code:HTTP_STATUS_CODES.OK
    }
  }
}
