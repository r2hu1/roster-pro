import { defineEnv } from "envin"
import { vercel } from "envin/presets/zod"
import * as z from "zod"

const env: ReturnType<typeof defineEnv> = defineEnv({
  extends: [vercel],

  clientPrefix: "NEXT_PUBLIC_",

  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string(),
    NEXT_PUBLIC_MARKETING_URL: z.string(),
    NEXT_PUBLIC_CLIENT_WEB_BASE_URL: z.string(),
  },

  env: {
    ...process.env,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_MARKETING_URL: process.env.NEXT_PUBLIC_MARKETING_URL,
    NEXT_PUBLIC_CLIENT_WEB_BASE_URL:
      process.env.NEXT_PUBLIC_CLIENT_WEB_BASE_URL,
    API_KEY: process.env.API_KEY,
  },
})

export default env
