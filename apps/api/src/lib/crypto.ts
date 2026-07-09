import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY!)
  .digest()

export const cryptoUtil = {
  encrypt<T>(data: T): string {
    const iv = crypto.randomBytes(12)

    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)

    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), "utf8"),
      cipher.final(),
    ])

    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, encrypted]).toString("base64url")
  },

  decrypt<T>(token: string): T | null {
    try {
      const buffer = Buffer.from(token, "base64url")

      if (buffer.length < 28) return null

      const iv = buffer.subarray(0, 12)
      const authTag = buffer.subarray(12, 28)
      const encrypted = buffer.subarray(28)

      const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
      decipher.setAuthTag(authTag)

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ])

      return JSON.parse(decrypted.toString("utf8")) as T
    } catch {
      return null
    }
  },
}
