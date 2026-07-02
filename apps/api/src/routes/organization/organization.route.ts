import { Hono } from "hono"
import type { AppEnv } from "../../index.js"

export const organizationRouter = new Hono<AppEnv>()
