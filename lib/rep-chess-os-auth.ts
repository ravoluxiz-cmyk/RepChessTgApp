import crypto from "crypto"

const OS_COOKIE = "repchess_os_access"
const OS_SESSION_TTL_SECONDS = 60 * 60 * 12

function getOsPassword() {
  return (process.env.REPCHESS_OS_PASSWORD || "").trim()
}

function getOsSecret() {
  const password = getOsPassword()
  const adminPassword = (process.env.WEB_ADMIN_PASSWORD || "").trim()
  const botToken = (process.env.TELEGRAM_BOT_TOKEN || "").trim()
  return [password, adminPassword, botToken].filter(Boolean).join(":")
}

function timingSafeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue)
  const right = Buffer.from(rightValue)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

function signPayload(payload: string) {
  const secret = getOsSecret()
  if (!secret) return ""
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

export function isRepChessOsPasswordConfigured() {
  return Boolean(getOsPassword())
}

export function verifyRepChessOsPassword(password: string) {
  const expected = getOsPassword()
  return Boolean(expected) && timingSafeEqual(password, expected)
}

export function createRepChessOsSessionCookie() {
  const expiresAt = Math.floor(Date.now() / 1000) + OS_SESSION_TTL_SECONDS
  const payload = `repchess-os.${expiresAt}`
  const signature = signPayload(payload)
  return `${payload}.${signature}`
}

export function verifyRepChessOsSessionFromHeaders(headers: Headers) {
  const cookieHeader = headers.get("cookie") || ""
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${OS_COOKIE}=`))

  if (!cookie) return false

  const value = decodeURIComponent(cookie.slice(OS_COOKIE.length + 1))
  const [subject, expiresAtRaw, signature] = value.split(".")
  if (subject !== "repchess-os" || !expiresAtRaw || !signature) return false

  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false
  }

  const expected = signPayload(`${subject}.${expiresAtRaw}`)
  return Boolean(expected) && timingSafeEqual(signature, expected)
}

export function getRepChessOsCookieName() {
  return OS_COOKIE
}

export function getRepChessOsSessionMaxAge() {
  return OS_SESSION_TTL_SECONDS
}
