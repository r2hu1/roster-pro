import { zValidator } from "@hono/zod-validator"
import { flattenError, type ZodSchema } from "zod"
import { HTTP_STATUS_CODES } from "@workspace/shared/constants"
import type { ValidationTargets } from "hono"

export const parseFile = async (file: File): Promise<Buffer> => {
  if (!(file instanceof File)) {
    throw new Error("Expected a File")
  }

  return Buffer.from(await file.arrayBuffer())
}

export const zvalidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets = "json",
>(
  target: Target,
  schema: T
) =>
  zValidator(target, schema, (result, c) => {

    // console.log("result", result)    // ignore this
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

export { HTTP_STATUS_CODES }
