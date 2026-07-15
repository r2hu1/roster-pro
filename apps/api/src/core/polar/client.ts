import { Polar } from "@polar-sh/sdk"

export const APP_ENV = process.env.POLAR_ENV as "production" | "sandbox" ?? "sandbox"
console.log("token length:", process.env.POLAR_ACCESS_TOKEN?.length);
console.log("token first/last chars:",
  process.env.POLAR_ACCESS_TOKEN?.slice(0,4),
  process.env.POLAR_ACCESS_TOKEN?.slice(-4));
export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: APP_ENV,
  debugLogger: console,
})
