import { NextRequest, NextResponse } from "next/server"
import { getAdminStats } from "@/lib/db"
import { requireAdmin } from "@/lib/telegram"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const stats = await getAdminStats()
  return NextResponse.json(stats)
}
