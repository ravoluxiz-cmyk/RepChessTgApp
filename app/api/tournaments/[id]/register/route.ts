import { NextRequest, NextResponse } from "next/server"
import { addTournamentRegistration, getTournamentById, getUserByTelegramId } from "@/lib/db"
import { getTelegramUserFromHeaders, sendTelegramMessage } from "@/lib/telegram"
import { getWebProfileUserFromHeaders } from "@/lib/web-auth"

function getDisplayName(user: { first_name?: string | null; last_name?: string | null; username?: string | null }) {
  const fullName = [user.first_name, user.last_name]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
  const username = String(user.username || "").trim()
  return fullName || username || "Участник"
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const tournamentId = Number(id)
    if (!Number.isFinite(tournamentId)) {
      return NextResponse.json({ error: "Некорректный ID турнира" }, { status: 400 })
    }

    const user =
      getTelegramUserFromHeaders(request.headers) ||
      getWebProfileUserFromHeaders(request.headers)

    if (!user) {
      return NextResponse.json({ error: "Нужно открыть приложение через Telegram или профиль веб-версии" }, { status: 401 })
    }

    const tournament = await getTournamentById(tournamentId)
    if (!tournament) {
      return NextResponse.json({ error: "Турнир не найден" }, { status: 404 })
    }

    if (Number(tournament.allow_join ?? 0) !== 1) {
      return NextResponse.json({ error: "Регистрация закрыта" }, { status: 400 })
    }

    const profile = await getUserByTelegramId(user.id)
    const userName = profile ? getDisplayName(profile) : getDisplayName(user)
    const tournamentTitle = tournament.title
    const result = await addTournamentRegistration({
      tournament_id: tournamentId,
      user_telegram_id: user.id,
      user_name: userName,
      venue_title: tournamentTitle,
    })

    if (!result.registration) {
      return NextResponse.json({ error: "Не удалось зарегистрироваться" }, { status: 500 })
    }

    let messageSent = false
    const chatId = tournament.registration_chat_id || tournament.chat_id
    if (!result.alreadyRegistered && chatId) {
      messageSent = await sendTelegramMessage(chatId, `${userName}\n${tournamentTitle}\n+`)
    }

    return NextResponse.json({
      ok: true,
      already_registered: result.alreadyRegistered,
      message_sent: messageSent,
    })
  } catch (error) {
    console.error("Failed to register for tournament:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
