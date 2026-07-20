import crypto from "crypto"
import { redisClient } from "../core/redis/client.js"

const SESSION_PREFIX = "qr:session:"
// tombstone left behind by staff-side revocation, so an ended session is
// distinguishable from one that idled out (client shows thank-you vs scanner)
const ENDED_PREFIX = "qr:session-ended:"
const TABLE_INDEX_PREFIX = "qr:table-sessions:"
const ISSUE_RATE_PREFIX = "qr:issue-rate:"
const ORDER_RATE_PREFIX = "qr:order-rate:"

export const QR_SESSION_IDLE_TTL_SEC = 30 * 60
export const QR_SESSION_MAX_TTL_SEC = 3 * 60 * 60
export const QR_MAX_ACTIVE_SESSIONS_PER_TABLE = 5
export const QR_MAX_ORDERS_PER_SESSION = 20
export const QR_ISSUE_RATE_PER_MIN = 10
export const QR_ORDER_RATE_PER_MIN = 5

export type QrSessionRecord = {
  organizationId: string
  tableId: string
  tableNumber: string
  tableSessionId: string
  secretHash: string
  createdAt: number
  lastActivityAt: number
  orderCount: number
}

export type QrSessionContext = {
  sessionId: string
  organizationId: string
  tableId: string
  tableNumber: string
  tableSessionId: string
  createdAt: number
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex")
}

export function hashIp(ip: string): string {
  return sha256(ip).slice(0, 32)
}

function parseCredential(
  credential: string
): { sessionId: string; secret: string } | null {
  const sep = credential.indexOf(".")
  if (sep <= 0 || sep === credential.length - 1) return null
  return {
    sessionId: credential.slice(0, sep),
    secret: credential.slice(sep + 1),
  }
}

export const qrSessionStore = {
  async create(data: {
    organizationId: string
    tableId: string
    tableNumber: string
    tableSessionId: string
  }): Promise<{ credential: string; sessionId: string; expiresAt: number }> {
    const sessionId = crypto.randomBytes(16).toString("base64url")
    const secret = crypto.randomBytes(32).toString("base64url")
    const now = Date.now()

    const record: QrSessionRecord = {
      ...data,
      secretHash: sha256(secret),
      createdAt: now,
      lastActivityAt: now,
      orderCount: 0,
    }

    await redisClient.set(
      `${SESSION_PREFIX}${sessionId}`,
      record,
      QR_SESSION_IDLE_TTL_SEC
    )
    await redisClient.sadd(`${TABLE_INDEX_PREFIX}${data.tableId}`, sessionId)
    await redisClient.expire(
      `${TABLE_INDEX_PREFIX}${data.tableId}`,
      QR_SESSION_MAX_TTL_SEC
    )

    return {
      credential: `${sessionId}.${secret}`,
      sessionId,
      expiresAt: now + QR_SESSION_MAX_TTL_SEC * 1000,
    }
  },

  async validate(
    credential: string
  ): Promise<
    | { ok: true; session: QrSessionContext }
    | {
        ok: false
        reason: "SESSION_EXPIRED" | "SESSION_INVALID" | "SESSION_ENDED"
      }
  > {
    const parsed = parseCredential(credential)
    if (!parsed) return { ok: false, reason: "SESSION_INVALID" }

    const key = `${SESSION_PREFIX}${parsed.sessionId}`
    const record = await redisClient.get<QrSessionRecord>(key)
    if (!record) {
      const ended = await redisClient.exists(
        `${ENDED_PREFIX}${parsed.sessionId}`
      )
      return { ok: false, reason: ended ? "SESSION_ENDED" : "SESSION_EXPIRED" }
    }

    const givenHash = Buffer.from(sha256(parsed.secret), "hex")
    const storedHash = Buffer.from(record.secretHash, "hex")
    if (
      givenHash.length !== storedHash.length ||
      !crypto.timingSafeEqual(givenHash, storedHash)
    ) {
      return { ok: false, reason: "SESSION_INVALID" }
    }

    // absolute TTL: sliding refreshes must never outlive the hard cap
    if (Date.now() - record.createdAt > QR_SESSION_MAX_TTL_SEC * 1000) {
      await qrSessionStore.destroy(parsed.sessionId, record.tableId)
      return { ok: false, reason: "SESSION_EXPIRED" }
    }

    const updated: QrSessionRecord = { ...record, lastActivityAt: Date.now() }
    void redisClient
      .set(key, updated, QR_SESSION_IDLE_TTL_SEC)
      .catch((err) => console.error("Failed to refresh qr session ttl", err))

    return {
      ok: true,
      session: {
        sessionId: parsed.sessionId,
        organizationId: record.organizationId,
        tableId: record.tableId,
        tableNumber: record.tableNumber,
        tableSessionId: record.tableSessionId,
        createdAt: record.createdAt,
      },
    }
  },

  async destroy(sessionId: string, tableId?: string): Promise<void> {
    await redisClient.del(`${SESSION_PREFIX}${sessionId}`)
    if (tableId) {
      await redisClient.srem(`${TABLE_INDEX_PREFIX}${tableId}`, sessionId)
    }
  },

  // Returns live session count for the table, pruning expired index members.
  async countActiveForTable(tableId: string): Promise<number> {
    const indexKey = `${TABLE_INDEX_PREFIX}${tableId}`
    const members = await redisClient.smembers(indexKey)
    if (members.length === 0) return 0

    let live = 0
    for (const sid of members) {
      if (await redisClient.exists(`${SESSION_PREFIX}${sid}`)) {
        live++
      } else {
        await redisClient.srem(indexKey, sid)
      }
    }
    return live
  },

  async incrementOrderCount(sessionId: string): Promise<number | null> {
    const key = `${SESSION_PREFIX}${sessionId}`
    const record = await redisClient.get<QrSessionRecord>(key)
    if (!record) return null
    const ttl = await redisClient.ttl(key)
    const orderCount = (record.orderCount ?? 0) + 1
    await redisClient.set(
      key,
      { ...record, orderCount },
      ttl > 0 ? ttl : QR_SESSION_IDLE_TTL_SEC
    )
    return orderCount
  },

  async checkIssueRateLimit(ip: string): Promise<boolean> {
    const n = await redisClient.incrWithTtl(
      `${ISSUE_RATE_PREFIX}${hashIp(ip)}`,
      60
    )
    return n <= QR_ISSUE_RATE_PER_MIN
  },

  async checkOrderRateLimit(sessionId: string): Promise<boolean> {
    const n = await redisClient.incrWithTtl(
      `${ORDER_RATE_PREFIX}${sessionId}`,
      60
    )
    return n <= QR_ORDER_RATE_PER_MIN
  },
}

export async function revokeTableQrSessions(tableId: string): Promise<number> {
  const indexKey = `${TABLE_INDEX_PREFIX}${tableId}`
  const members = await redisClient.smembers(indexKey)
  for (const sid of members) {
    await redisClient.del(`${SESSION_PREFIX}${sid}`)
    await redisClient.set(`${ENDED_PREFIX}${sid}`, 1, QR_SESSION_MAX_TTL_SEC)
  }
  await redisClient.del(indexKey)
  return members.length
}
