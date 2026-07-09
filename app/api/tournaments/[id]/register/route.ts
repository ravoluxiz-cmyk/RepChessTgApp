import { NextRequest, NextResponse } from "next/server"
import {
  addTournamentRegistration,
  getSiteUserBySessionHash,
  getTournamentById,
  getTournamentRegistration,
  getUserByTelegramId,
} from "@/lib/db"
import { getTelegramUserFromHeaders, sendTelegramMessage } from "@/lib/telegram"
import { type WebAppUser } from "@/lib/web-auth"
import { getSiteSessionSecretFromHeaders, hashSessionSecret } from "@/lib/site-auth"

const CANCELLATION_HINT = "Чтобы отменить регистрацию, напишите в чат «-»."

function getDisplayName(user: { first_name?: string | null; last_name?: string | null; username?: string | null }) {
  const fullName = [user.first_name, user.last_name]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
  const username = String(user.username || "").trim()
  return fullName || username || "Участник"
}

async function getRegistrationUser(request: NextRequest): Promise<WebAppUser | null> {
  const telegramUser = request.headers.has("authorization")
    ? getTelegramUserFromHeaders(request.headers)
    : null
  if (telegramUser) return telegramUser

  const sessionSecret = getSiteSessionSecretFromHeaders(request.headers)
  if (!sessionSecret) return null

  const session = await getSiteUserBySessionHash(hashSessionSecret(sessionSecret))
  if (!session?.user) return null

  return {
    id: session.user.telegram_id,
    first_name: session.user.first_name,
    last_name: session.user.last_name,
    username: session.user.username || undefined,
    photo_url: "",
    auth_date: Math.floor(Date.now() / 1000),
    hash: "site-session",
  }
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

    const user = await getRegistrationUser(request)
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

    const user = await getRegistrationUser(request)
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
