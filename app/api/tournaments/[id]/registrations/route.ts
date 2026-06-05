import { NextRequest, NextResponse } from "next/server"
import { listTournamentRegistrations, updateTournamentRegistrationAttendance } from "@/lib/db"
import { requireAdmin } from "@/lib/telegram"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await ctx.params
  const tournamentId = Number(id)
  if (!Number.isFinite(tournamentId)) {
    return NextResponse.json({ error: "Invalid tournament id" }, { status: 400 })
  }

  const registrations = await listTournamentRegistrations(tournamentId)
  return NextResponse.json({ registrations })
}

export async function PATCH(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as {
    id?: number
    attendance_status?: "registered" | "attended" | "no_show"
    result_place?: number | null
    result_points?: number | null
    admin_note?: string | null
  } | null

  if (!body?.id || !body.attendance_status) {
    return NextResponse.json({ error: "Некорректная запись" }, { status: 400 })
  }

  const updated = await updateTournamentRegistrationAttendance(body.id, {
    attendance_status: body.attendance_status,
    result_place: body.result_place ?? null,
    result_points: body.result_points ?? null,
    admin_note: body.admin_note ?? null,
  })

  if (!updated) {
    return NextResponse.json({ error: "Не удалось обновить посещаемость" }, { status: 500 })
  }

  return NextResponse.json({ registration: updated })
}
