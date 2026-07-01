import { Hono } from "hono"
import type { AppEnv } from "../../../index.js"

export const orderRouter = new Hono<AppEnv>()
