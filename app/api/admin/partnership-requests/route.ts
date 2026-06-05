import { NextRequest, NextResponse } from "next/server"
import { listPartnershipRequests, updatePartnershipRequestStatus } from "@/lib/db"
import { requireAdmin } from "@/lib/telegram"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "all"
  const requests = await listPartnershipRequests(status)
  return NextResponse.json({ requests })
}

export async function PATCH(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as {
    id?: number
    status?: "new" | "in_progress" | "done" | "rejected"
  } | null

  if (!body?.id || !body.status) {
    return NextResponse.json({ error: "Некорректная заявка" }, { status: 400 })
  }

  const updated = await updatePartnershipRequestStatus(body.id, body.status)
  if (!updated) {
    return NextResponse.json({ error: "Не удалось обновить заявку" }, { status: 500 })
  }

  return NextResponse.json({ request: updated })
}
