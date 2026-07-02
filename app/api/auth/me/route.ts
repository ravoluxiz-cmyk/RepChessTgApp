import { NextRequest, NextResponse } from "next/server"
import { getSiteUserBySessionHash } from "@/lib/db"
import { getSiteSessionSecretFromHeaders, hashSessionSecret } from "@/lib/site-auth"

export async function GET(request: NextRequest) {
  const secret = getSiteSessionSecretFromHeaders(request.headers)
  const sessionUser = secret ? await getSiteUserBySessionHash(hashSessionSecret(secret)) : null

  if (!sessionUser) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user: sessionUser.user,
    account: {
      id: sessionUser.account.id,
      login: sessionUser.account.login,
    },
  })
}
