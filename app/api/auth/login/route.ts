import { NextRequest, NextResponse } from "next/server"
import {
  createSiteUserSession,
  getSiteUserAccountByLogin,
  getUserById,
  isSiteAuthStorageReady,
  touchSiteUserAccountLogin,
} from "@/lib/db"
import {
  SITE_AUTH_COOKIE,
  SITE_SESSION_TTL_SECONDS,
  createSessionSecret,
  getSiteSessionExpiresAt,
  hashSessionSecret,
  normalizeAccountLogin,
  verifyPasswordHash,
} from "@/lib/site-auth"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { login?: string; password?: string } | null
  const login = normalizeAccountLogin(String(body?.login || ""))
  const password = String(body?.password || "")

  const storageReady = await isSiteAuthStorageReady()
  if (!storageReady) {
    return NextResponse.json({ error: "Система аккаунтов еще не включена в Supabase. Выполните supabase_migration_site_user_auth.sql." }, { status: 503 })
  }

  const account = await getSiteUserAccountByLogin(login)
  if (!account || !verifyPasswordHash(password, account.password_salt, account.password_hash)) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 })
  }

  const user = await getUserById(account.user_id)
  if (!user) {
    return NextResponse.json({ error: "Профиль игрока не найден" }, { status: 404 })
  }

  const sessionSecret = createSessionSecret()
  const session = await createSiteUserSession({
    account_id: account.id!,
    session_hash: hashSessionSecret(sessionSecret),
    user_agent: request.headers.get("user-agent") || null,
    expires_at: getSiteSessionExpiresAt(),
  })

  if (!session) {
    return NextResponse.json({ error: "Не удалось открыть сессию" }, { status: 500 })
  }

  await touchSiteUserAccountLogin(account.id!)

  const response = NextResponse.json({ ok: true, user, account: { id: account.id, login: account.login } })
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
