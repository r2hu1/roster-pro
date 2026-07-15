import { Polar } from "@polar-sh/sdk"

export const APP_ENV =
  process.env.NODE_ENV === "production" ? "production" : "sandbox"
export const accessToken =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_POLAR_ACCESS_TOKEN
    : process.env.DEV_POLAR_ACCESS_TOKEN

console.log({
  nodeEnv: process.env.NODE_ENV,
  appEnv: APP_ENV,
  hasToken: !!accessToken,
  tokenPrefix: accessToken?.slice(0, 12),
  server: APP_ENV,
})

export const polarClient = new Polar({
  accessToken,
  server: APP_ENV,
  // debugLogger: console,
})
