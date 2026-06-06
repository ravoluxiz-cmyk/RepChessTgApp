import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/telegram"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({
    disabled: true,
    requests: [],
    message: "Ручное подтверждение рейтинга отключено. Игроки стартуют с 1500 и проходят Glicko-2 калибровку.",
  })
}

export async function PATCH(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(
    { error: "Ручное подтверждение рейтинга отключено" },
    { status: 410 }
  )
}
