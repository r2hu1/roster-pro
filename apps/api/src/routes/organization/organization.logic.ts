import { eq } from "drizzle-orm"
import { db } from "../../core/db/client.js"
import { organization } from "../../core/db/schemas/auth.js"
import { auth } from "../../lib/better-auth/auth.js"
import { HTTP_STATUS_CODES } from "../../lib/utils.js"
import type {
  UpdateOrganizationDto,
  CreateOrganizationDto,
} from "@workspace/shared/types/organization/dto"
import { uploadFile } from "../../core/imagekit/upload.js"
import { deleteFile } from "../../core/imagekit/delete.js"
import { cryptoUtil } from "../../lib/crypto.js"

export const organizationLogic = {
  create: async (
    headers: HeadersInit,
    body: CreateOrganizationDto,
    file?: File
  ) => {
    let logo: string | null = null
    let logoKey: string | null = null

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())

      const uploadResult = await uploadFile(buffer, file.name)

      if (uploadResult.status === "success") {
        logo = uploadResult.url ?? null
        logoKey = uploadResult.id ?? null
      }
    }

    const { name, slug, metadata } = body

    const newOrg = await auth.api.createOrganization({
      headers,
      body: {
        name,
        slug,
        metadata,
        logo,
      },
    })

    if (!newOrg) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Failed to create organization",
      }
    }

    await db
      .update(organization)
      .set({
        logoKey,
        address: body.address ?? null,
      })
      .where(eq(organization.id, newOrg.id))

    return {
      status: "success",
      data: newOrg,
      code: HTTP_STATUS_CODES.CREATED,
    }
  },
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
  update: async (
    headers: HeadersInit,
    body: UpdateOrganizationDto,
    file?: File
  ) => {
    const userOrg = await auth.api.getFullOrganization({
      headers,
    })

    if (!userOrg) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    const [getOrg] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, userOrg.id as string))

    if (!getOrg) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }

    let logo = getOrg.logo
    let logoKey = getOrg.logoKey

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())

      const uploadResult = await uploadFile(buffer, file.name)

      if (uploadResult.status === "success") {
        if (getOrg.logoKey) {
          await deleteFile(getOrg.logoKey)
        }

        logo = uploadResult.url ?? null
        logoKey = uploadResult.id ?? null
      }
    }

    const [updatedOrg] = await db
      .update(organization)
      .set({
        name: body.name ?? getOrg.name,
        logo,
        logoKey,
        address: body.address ?? getOrg.address,
        metadata: body.metadata
          ? JSON.stringify(body.metadata)
          : getOrg.metadata,
        websiteId: body.websiteId ?? getOrg.websiteId,
      })
      .where(eq(organization.id, getOrg.id))
      .returning()

    if (!updatedOrg) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Cannot update organization",
      }
    }

    return {
      status: "success",
      code: HTTP_STATUS_CODES.OK,
      data: updatedOrg,
    }
  },
}
