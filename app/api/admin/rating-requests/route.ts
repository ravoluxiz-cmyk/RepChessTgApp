import { NextRequest, NextResponse } from "next/server"
import { listRatingRequests, resolveRatingRequest } from "@/lib/db"
import { requireAdmin } from "@/lib/telegram"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "pending"
  const requests = await listRatingRequests(status)
  return NextResponse.json({ requests })
}

export async function PATCH(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as {
    id?: number
    status?: "approved" | "rejected"
    approved_rating?: number
    admin_note?: string
  } | null

  if (!body?.id || (body.status !== "approved" && body.status !== "rejected")) {
    return NextResponse.json({ error: "Некорректная заявка" }, { status: 400 })
  }

  if (body.status === "approved") {
    const rating = Number(body.approved_rating)
    if (!Number.isFinite(rating) || rating < 100 || rating > 3000) {
      return NextResponse.json({ error: "Рейтинг должен быть от 100 до 3000" }, { status: 400 })
    }
  }

  const updated = await resolveRatingRequest(
    body.id,
    body.status,
    body.status === "approved" ? Number(body.approved_rating) : null,
    body.admin_note || null
  )

  if (!updated) {
    return NextResponse.json({ error: "Не удалось обработать заявку" }, { status: 500 })
  }

  return NextResponse.json({ request: updated })
}
