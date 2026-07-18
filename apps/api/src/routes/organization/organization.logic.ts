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

    const { name, slug, metadata, phone } = body

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
        phone: body.phone ?? null,
      })
      .where(eq(organization.id, newOrg.id))

    return {
      status: "success",
      data: newOrg,
      code: HTTP_STATUS_CODES.CREATED,
    }
  },
  me: async (organizationId: string) => {
    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, organizationId))
    if (!org) {
      return {
        status: "error",
        code: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Organization not found",
      }
    }
    return {
      status: "success",
      data: org,
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

    const updateData: Record<string, unknown> = {
      logo,
      logoKey,
    }
    if ("name" in body) updateData.name = body.name
    if ("phone" in body) updateData.phone = body.phone
    if ("address" in body) updateData.address = body.address
    if ("gstin" in body) updateData.gstin = body.gstin
    if ("hsnSac" in body) updateData.hsnSac = body.hsnSac
    if ("gstRate" in body) updateData.gstRate = body.gstRate
    if ("websiteId" in body) updateData.websiteId = body.websiteId
    if (body.metadata !== undefined) {
      updateData.metadata = body.metadata ? JSON.stringify(body.metadata) : null
    }

    const [updatedOrg] = await db
      .update(organization)
      .set(updateData)
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
