import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/telegram"
import { deleteTournament, getTournamentById, updateTournament } from "@/lib/db"

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const tournamentId = Number(id)
    if (!Number.isFinite(tournamentId)) {
      return NextResponse.json({ error: "Некорректный ID турнира" }, { status: 400 })
    }

    const tournament = await getTournamentById(tournamentId)
    if (!tournament) {
      return NextResponse.json({ error: "Турнир не найден" }, { status: 404 })
    }

    return NextResponse.json(tournament)
  } catch (e) {
    console.error("Failed to get tournament:", e)
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await requireAdmin(request.headers)
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await ctx.params
    const tournamentId = Number(id)
    if (!Number.isFinite(tournamentId)) {
      return NextResponse.json({ error: "Некорректный ID турнира" }, { status: 400 })
    }

    const exists = await getTournamentById(tournamentId)
    if (!exists) {
      return NextResponse.json({ error: "Турнир не найден" }, { status: 404 })
    }

    const ok = await deleteTournament(tournamentId)
    if (!ok) {
      return NextResponse.json({ error: "Не удалось удалить турнир" }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Failed to delete tournament:", e)
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await requireAdmin(request.headers)
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await ctx.params
    const tournamentId = Number(id)
    if (!Number.isFinite(tournamentId)) {
      return NextResponse.json({ error: "Некорректный ID турнира" }, { status: 400 })
    }

    const exists = await getTournamentById(tournamentId)
    if (!exists) {
      return NextResponse.json({ error: "Турнир не найден" }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Тело запроса обязательно" }, { status: 400 })
    }

    // Build update fields from allowed keys
    const allowedKeys = [
      'title', 'format', 'points_win', 'points_loss', 'points_draw',
      'bye_points', 'rounds', 'tiebreakers', 'chat_id', 'archived',
      'forbid_repeat_bye', 'late_join_points', 'hide_rating', 'hide_new_rating',
      'compute_performance', 'hide_color_names', 'show_opponent_names',
    ]

    const updates: Record<string, unknown> = {}
    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        // Handle chat_id special case (empty string → null)
        if (key === 'chat_id') {
          updates[key] = body[key] ? String(body[key]) : null
        } else {
          updates[key] = body[key]
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Нет полей для обновления" }, { status: 400 })
    }

    const ok = await updateTournament(tournamentId, updates)
    if (!ok) {
      return NextResponse.json({ error: "Не удалось обновить турнир" }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: tournamentId, ...updates })
  } catch (e) {
    console.error("Failed to patch tournament:", e)
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 })
  }
}