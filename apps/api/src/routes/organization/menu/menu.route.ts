import { Hono } from "hono"
import type { AppEnv } from "../../../index.js"

export const menuRouter = new Hono<AppEnv>()
