import { Polar } from "@polar-sh/sdk"

export const APP_ENV = process.env.POLAR_ENV as "production" | "sandbox" ?? "sandbox"

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: APP_ENV,
  debugLogger: console,
})
