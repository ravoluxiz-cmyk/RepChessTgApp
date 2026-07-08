import { NextRequest, NextResponse } from "next/server"
import { getRepChessOsAccessError } from "@/lib/rep-chess-os-guard"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const accessError = await getRepChessOsAccessError(request.headers)
  if (accessError) {
    return NextResponse.json({ error: accessError.error }, { status: accessError.status })
  }

  return NextResponse.json({ ok: true })
}
