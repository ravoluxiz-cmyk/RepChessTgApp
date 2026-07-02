import { NextRequest, NextResponse } from "next/server"
import {
  createSiteUserAccount,
  createSiteUserSession,
  createUser,
  getSiteUserAccountByLogin,
  isSiteAuthStorageReady,
} from "@/lib/db"
import {
  SITE_AUTH_COOKIE,
  SITE_SESSION_TTL_SECONDS,
  createPasswordHash,
  createSessionSecret,
  getSiteSessionExpiresAt,
  hashSessionSecret,
  normalizeAccountLogin,
  validateAccountLogin,
  validateAccountPassword,
} from "@/lib/site-auth"

const DEFAULT_RATING = 1500

function normalizeName(value: unknown) {
  return String(value || "").trim().replace(/\s+/g, " ")
}

function createWebTelegramId() {
  return 900000000 + Math.floor(Math.random() * 89999999)
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    login?: string
    password?: string
    first_name?: string
    last_name?: string
  } | null

  const login = normalizeAccountLogin(String(body?.login || ""))
  const password = String(body?.password || "")
  const firstName = normalizeName(body?.first_name)
  const lastName = normalizeName(body?.last_name)

  if (!validateAccountLogin(login)) {
    return NextResponse.json({ error: "Логин: 3-32 символа, латиница, цифры, точка, дефис или нижнее подчеркивание" }, { status: 400 })
  }

  if (!validateAccountPassword(password)) {
    return NextResponse.json({ error: "Пароль должен быть от 8 до 128 символов" }, { status: 400 })
  }

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Имя и фамилия обязательны" }, { status: 400 })
  }

  const storageReady = await isSiteAuthStorageReady()
  if (!storageReady) {
    return NextResponse.json({ error: "Система аккаунтов еще не включена в Supabase. Выполните supabase_migration_site_user_auth.sql." }, { status: 503 })
  }

  const existing = await getSiteUserAccountByLogin(login)
  if (existing) {
    return NextResponse.json({ error: "Такой логин уже занят" }, { status: 409 })
  }

  let user = null
  for (let attempt = 0; attempt < 5 && !user; attempt += 1) {
    user = await createUser({
      telegram_id: createWebTelegramId(),
      username: login,
      first_name: firstName,
      last_name: lastName,
      rating: DEFAULT_RATING,
      chesscom_url: null,
      lichess_url: null,
      bio: null,
      role: "user",
    })
  }

  if (!user?.id) {
    return NextResponse.json({ error: "Не удалось создать профиль игрока" }, { status: 500 })
  }

  const passwordData = createPasswordHash(password)
  const account = await createSiteUserAccount({
    user_id: user.id,
    login,
    password_hash: passwordData.hash,
    password_salt: passwordData.salt,
    last_login_at: new Date().toISOString(),
  })

  if (!account?.id) {
    return NextResponse.json({ error: "Не удалось создать аккаунт. Возможно, нужна SQL-миграция site_user_accounts." }, { status: 500 })
  }

  const sessionSecret = createSessionSecret()
  const session = await createSiteUserSession({
    account_id: account.id,
    session_hash: hashSessionSecret(sessionSecret),
    user_agent: request.headers.get("user-agent") || null,
    expires_at: getSiteSessionExpiresAt(),
  })

  if (!session) {
    return NextResponse.json({ error: "Аккаунт создан, но не удалось открыть сессию" }, { status: 500 })
  }

  const response = NextResponse.json({ ok: true, user, account: { id: account.id, login: account.login } }, { status: 201 })
  response.cookies.set({
    name: SITE_AUTH_COOKIE,
    value: sessionSecret,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SITE_SESSION_TTL_SECONDS,
  })
  return response
}
