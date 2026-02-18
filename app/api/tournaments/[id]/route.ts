import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/telegram"
import { deleteTournament, getTournamentById, updateTournamentArchived, updateTournamentChatId } from "@/lib/db"

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

    const result: Record<string, unknown> = { ok: true, id: tournamentId }

    // Update archived if provided
    if (body.archived !== undefined) {
      const archived = typeof body.archived === "number" ? body.archived : (body.archived ? 1 : 0)
      if (archived !== 0 && archived !== 1) {
        return NextResponse.json({ error: "archived должен быть 0 или 1" }, { status: 400 })
      }
      const ok = await updateTournamentArchived(tournamentId, archived)
      if (!ok) {
        return NextResponse.json({ error: "Не удалось обновить archived" }, { status: 500 })
      }
      result.archived = archived
    }

    // Update chat_id if provided
    if (body.chat_id !== undefined) {
      const chatId = body.chat_id ? String(body.chat_id) : null
      const ok = await updateTournamentChatId(tournamentId, chatId)
      if (!ok) {
        return NextResponse.json({ error: "Не удалось обновить chat_id" }, { status: 500 })
      }
      result.chat_id = chatId
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error("Failed to patch tournament:", e)
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 })
  }
}