import { NextRequest, NextResponse } from "next/server"
import {
  createRepChessOsSessionCookie,
  getRepChessOsCookieName,
  getRepChessOsSessionMaxAge,
  isRepChessOsPasswordConfigured,
  verifyRepChessOsPassword,
} from "@/lib/rep-chess-os-auth"
import { requireAdmin } from "@/lib/telegram"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!isRepChessOsPasswordConfigured()) {
    return NextResponse.json(
      { error: "REPCHESS_OS_PASSWORD is not configured" },
      { status: 503 }
    )
  }

  const body = await request.json().catch(() => null) as { password?: string } | null
  const password = String(body?.password || "")

  if (!verifyRepChessOsPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: getRepChessOsCookieName(),
    value: createRepChessOsSessionCookie(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getRepChessOsSessionMaxAge(),
  })
  return response
}
