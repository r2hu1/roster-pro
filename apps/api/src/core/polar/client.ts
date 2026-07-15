import { Polar } from "@polar-sh/sdk"

export const APP_ENV =
  process.env.NODE_ENV === "production" ? "production" : "sandbox"

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: APP_ENV,
  debugLogger: console,
})
