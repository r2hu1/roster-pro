import type { Config } from "drizzle-kit"
import "dotenv/config"

const dbUrl =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_DATABASE_URL
    : process.env.DEV_DATABASE_URL

export default {
  schema: "./src/core/db/schemas/index.ts",
  out: "../../drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl!,
  },
  verbose: true,
} satisfies Config
