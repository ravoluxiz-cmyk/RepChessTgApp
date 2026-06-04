import { NextRequest, NextResponse } from "next/server"
import { addTournamentRegistration, getTournamentById, getTournamentRegistration, getUserByTelegramId } from "@/lib/db"
import { getTelegramUserFromHeaders, sendTelegramMessage } from "@/lib/telegram"
import { getWebProfileUserFromHeaders, type WebAppUser } from "@/lib/web-auth"

const CANCELLATION_HINT = "Чтобы отменить регистрацию, напишите в чат «-»."

function getDisplayName(user: { first_name?: string | null; last_name?: string | null; username?: string | null }) {
  const fullName = [user.first_name, user.last_name]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
  const username = String(user.username || "").trim()
  return fullName || username || "Участник"
}

function getRegistrationUser(request: NextRequest): WebAppUser | null {
  const telegramUser = request.headers.has("authorization")
    ? getTelegramUserFromHeaders(request.headers)
    : null
  return telegramUser || getWebProfileUserFromHeaders(request.headers)
}

function parseTournamentId(id: string) {
  const tournamentId = Number(id)
  return Number.isFinite(tournamentId) ? tournamentId : null
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const tournamentId = parseTournamentId(id)
    if (!tournamentId) {
      return NextResponse.json({ error: "Некорректный ID турнира" }, { status: 400 })
    }

    const user = getRegistrationUser(request)
    if (!user) {
      return NextResponse.json({ registered: false })
    }

    const registration = await getTournamentRegistration(tournamentId, user.id)
    return NextResponse.json({
      registered: Boolean(registration),
      registration_notice: registration ? `Вы уже зарегистрированы. ${CANCELLATION_HINT}` : null,
    })
  } catch (error) {
    console.error("Failed to get tournament registration status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const tournamentId = parseTournamentId(id)
    if (!tournamentId) {
      return NextResponse.json({ error: "Некорректный ID турнира" }, { status: 400 })
    }

    const user = getRegistrationUser(request)
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
    let telegramWarning: string | null = null
    const chatId = String(tournament.registration_chat_id || tournament.chat_id || "").trim()
    if (!result.alreadyRegistered && chatId) {
      messageSent = await sendTelegramMessage(chatId, `${userName}\n${tournamentTitle}\n+`)
      if (!messageSent) {
        telegramWarning = "Не удалось отправить сообщение в чат. Проверьте, что бот добавлен в чат и может писать сообщения."
      }
    } else if (!result.alreadyRegistered && !chatId) {
      telegramWarning = "Для турнира не указан чат регистрации."
      console.error(`[registration] tournamentId=${tournamentId} message skipped: registration_chat_id/chat_id is missing`)
    }

    return NextResponse.json({
      ok: true,
      already_registered: result.alreadyRegistered,
      message_sent: messageSent,
      telegram_warning: telegramWarning,
      registration_notice: result.alreadyRegistered
        ? `Вы уже зарегистрированы. ${CANCELLATION_HINT}`
        : CANCELLATION_HINT,
    })
  } catch (error) {
    console.error("Failed to register for tournament:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
