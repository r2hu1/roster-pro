import { drizzle } from "drizzle-orm/node-postgres"
import pkg from "pg"
import * as schema from "./schemas/index.js"
import "dotenv/config"

const { Pool } = pkg

declare global {
  var _pgPool: InstanceType<typeof Pool> | undefined
  var _drizzleDb: ReturnType<typeof drizzle> | undefined
}

const pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 15000,
    query_timeout: 15000,
  })

if (!global._pgPool) {
  pool.on("error", (err) => {
    console.error(
      JSON.stringify({ level: "error", msg: "pg_pool_error", error: err.message })
    )
  })
  global._pgPool = pool
}

const db = global._drizzleDb ?? drizzle(pool, { schema })

if (!global._drizzleDb) global._drizzleDb = db

export const closePool = () => pool.end()

export { db }
