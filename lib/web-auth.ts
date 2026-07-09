import crypto from "crypto"

export interface WebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

const ADMIN_COOKIE = "repchess_web_admin"
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 14

function getAdminPassword() {
  return (process.env.WEB_ADMIN_PASSWORD || "").trim()
}

function getAdminSecret() {
  const password = getAdminPassword()
  const botToken = (process.env.TELEGRAM_BOT_TOKEN || "").trim()
  return password && botToken ? `${password}:${botToken}` : password
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

function signPayload(payload: string) {
  const secret = getAdminSecret()
  if (!secret) return ""
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

export function isWebAdminPasswordConfigured() {
  return Boolean(getAdminPassword())
}

export function verifyWebAdminPassword(password: string) {
  const expected = getAdminPassword()
  return Boolean(expected) && timingSafeEqual(password, expected)
}

export function createWebAdminSessionCookie() {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS
  const payload = `web-admin.${expiresAt}`
  const signature = signPayload(payload)
  return `${payload}.${signature}`
}

export function verifyWebAdminSessionFromHeaders(headers: Headers) {
  const cookieHeader = headers.get("cookie") || ""
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`))

  if (!cookie) return false

  const value = decodeURIComponent(cookie.slice(ADMIN_COOKIE.length + 1))
  const [subject, expiresAtRaw, signature] = value.split(".")
  if (subject !== "web-admin" || !expiresAtRaw || !signature) return false

  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false
  }

  const expected = signPayload(`${subject}.${expiresAtRaw}`)
  return Boolean(expected) && timingSafeEqual(signature, expected)
}

export function getWebAdminCookieName() {
  return ADMIN_COOKIE
}
