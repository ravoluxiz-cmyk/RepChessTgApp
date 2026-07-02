import { NextRequest, NextResponse } from "next/server"
import { deleteSiteUserSession } from "@/lib/db"
import { SITE_AUTH_COOKIE, getSiteSessionSecretFromHeaders, hashSessionSecret } from "@/lib/site-auth"

export async function POST(request: NextRequest) {
  const secret = getSiteSessionSecretFromHeaders(request.headers)
  if (secret) {
    await deleteSiteUserSession(hashSessionSecret(secret))
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: SITE_AUTH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return response
}
