import crypto from "crypto"

export const SITE_AUTH_COOKIE = "repchess_user_session"
export const SITE_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30

const PASSWORD_KEY_LENGTH = 64

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function normalizeAccountLogin(login: string) {
  return login.trim().toLowerCase().replace(/^@/, "")
}

export function validateAccountLogin(login: string) {
  return /^[a-z0-9_.-]{3,32}$/.test(normalizeAccountLogin(login))
}

export function validateAccountPassword(password: string) {
  return password.length >= 8 && password.length <= 128
}

export function createPasswordHash(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex")
  return { hash, salt }
}

export function verifyPasswordHash(password: string, salt: string, expectedHash: string) {
  const { hash } = createPasswordHash(password, salt)
  return timingSafeEqual(hash, expectedHash)
}

export function createSessionSecret() {
  return crypto.randomBytes(32).toString("base64url")
}

export function hashSessionSecret(secret: string) {
  return crypto.createHash("sha256").update(secret).digest("hex")
}

export function getSiteSessionSecretFromHeaders(headers: Headers) {
  const cookieHeader = headers.get("cookie") || ""
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SITE_AUTH_COOKIE}=`))

  return cookie ? decodeURIComponent(cookie.slice(SITE_AUTH_COOKIE.length + 1)) : ""
}

export function getSiteSessionExpiresAt() {
  return new Date(Date.now() + SITE_SESSION_TTL_SECONDS * 1000).toISOString()
}
