import { createHmac } from "crypto"

const ALG = "HS256"
const MFA_TOKEN_TTL_MS = 2 * 60 * 1000 // 2 minutes

function base64UrlEncode(data: Buffer | string): string {
  const buf = typeof data === "string" ? Buffer.from(data, "utf8") : data
  return buf.toString("base64url")
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  return Buffer.from(base64, "base64").toString("utf8")
}

export type MfaTokenPayload = {
  sub: string // userId
  purpose: "mfa"
  iat: number
  exp: number
}

export function signMfaToken(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for MFA token")

  const now = Math.floor(Date.now() / 1000)
  const payload: MfaTokenPayload = {
    sub: userId,
    purpose: "mfa",
    iat: now,
    exp: now + Math.floor(MFA_TOKEN_TTL_MS / 1000),
  }
  const header = { alg: ALG, typ: "JWT" }
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const signatureInput = `${headerB64}.${payloadB64}`
  const signature = createHmac("sha256", secret).update(signatureInput).digest("base64url")
  return `${signatureInput}.${signature}`
}

export function verifyMfaToken(token: string): MfaTokenPayload | null {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) return null

  const parts = token.split(".")
  if (parts.length !== 3) return null

  const [headerB64, payloadB64, signature] = parts
  const signatureInput = `${headerB64}.${payloadB64}`
  const expectedSig = createHmac("sha256", secret).update(signatureInput).digest("base64url")
  if (signature !== expectedSig) return null

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as MfaTokenPayload
    if (payload.purpose !== "mfa" || !payload.sub) return null
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return null
    return payload
  } catch {
    return null
  }
}
