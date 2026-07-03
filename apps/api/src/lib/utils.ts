import { zValidator } from "@hono/zod-validator"
import { flattenError, type ZodSchema } from "zod"

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  PAYMENT_REQUIRED: 402,
} as const

export const parseFile = async (file: File): Promise<Buffer> => {
  if (!(file instanceof File)) {
    throw new Error("Expected a File")
  }

  return Buffer.from(await file.arrayBuffer())
}

export const zvalidator = <T extends ZodSchema>(schema: T) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          status: "error",
          code: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed",
          errors: flattenError(result.error).fieldErrors,
        },
        HTTP_STATUS_CODES.BAD_REQUEST
      )
    }
  })
