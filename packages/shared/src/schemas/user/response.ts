import { z } from "zod"
import { UserSchema } from "./base.js"

export const UserResponseSchema = UserSchema

export type UserResponse = z.infer<typeof UserResponseSchema>
