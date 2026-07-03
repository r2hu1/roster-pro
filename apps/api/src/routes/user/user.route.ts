import { Hono } from "hono"
import type { AppEnv } from "../../index.js"
import { userLogic } from "./user.logic.js"
import { sessionMiddleware } from "../../middleware/session.js"
import { HTTP_STATUS_CODES } from "../../lib/utils.js"

export const userRouter = new Hono<AppEnv>();

userRouter.use(sessionMiddleware);

userRouter.get("/me", async (c) => {
  const user = c.get("user");

  return c.json({
    status: "success",
    data: user,
    code: HTTP_STATUS_CODES.OK,
  })
});

userRouter.get("/organizations", async (c) => {
  const headers = c.req.raw.headers;
  const res = await userLogic.organization(headers);

  c.json(res)
});
