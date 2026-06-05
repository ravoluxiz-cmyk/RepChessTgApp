import { NextRequest, NextResponse } from "next/server"
import { listTournaments, updateTournament } from "@/lib/db"
import { requireAdmin } from "@/lib/telegram"

type TelegramChat = {
  id: number
  title?: string
  username?: string
  first_name?: string
  last_name?: string
  type: string
}

type TelegramUpdate = {
  message?: { chat?: TelegramChat }
  edited_message?: { chat?: TelegramChat }
  channel_post?: { chat?: TelegramChat }
  edited_channel_post?: { chat?: TelegramChat }
}

function getToken() {
  return String(process.env.TELEGRAM_BOT_TOKEN || "").trim()
}

function getChatFromUpdate(update: TelegramUpdate) {
  return (
    update.message?.chat ||
    update.edited_message?.chat ||
    update.channel_post?.chat ||
    update.edited_channel_post?.chat ||
    null
  )
}

function getChatTitle(chat: TelegramChat) {
  return chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.username || String(chat.id)
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request.headers)
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const token = getToken()
    if (!token) {
      return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN не настроен" }, { status: 500 })
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`, {
      cache: "no-store",
    })
    const data = await response.json().catch(() => null)

    if (!response.ok || !data?.ok) {
      const description = data?.description || "Не удалось получить Telegram updates"
      return NextResponse.json({ error: description }, { status: 500 })
    }

    const chats = new Map<number, { id: number; title: string; type: string; username?: string }>()
    for (const update of (data.result || []) as TelegramUpdate[]) {
      const chat = getChatFromUpdate(update)
      if (!chat) continue
      chats.set(chat.id, {
        id: chat.id,
        title: getChatTitle(chat),
        type: chat.type,
        username: chat.username,
      })
    }

    return NextResponse.json({ chats: Array.from(chats.values()) })
  } catch (error) {
    console.error("Failed to discover Telegram chats:", error)
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request.headers)
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const chatId = String(body?.chat_id || "").trim()
    if (!chatId) {
      return NextResponse.json({ error: "chat_id обязателен" }, { status: 400 })
    }

    const token = getToken()
    if (!token) {
      return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN не настроен" }, { status: 500 })
    }

    const chatResponse = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(chatId)}`, {
      cache: "no-store",
    })
    const chatData = await chatResponse.json().catch(() => null)

    if (!chatResponse.ok || !chatData?.ok) {
      const description = chatData?.description || "Telegram не видит этот чат. Проверьте ID и что бот добавлен в чат."
      return NextResponse.json({ error: description }, { status: 400 })
    }

    const tournaments = await listTournaments()
    let updated = 0

    for (const tournament of tournaments) {
      if (!tournament.id) continue
      const ok = await updateTournament(tournament.id, {
        chat_id: chatId,
        registration_chat_id: chatId,
      })
      if (ok) updated += 1
    }

    return NextResponse.json({
      ok: true,
      chat_id: chatId,
      chat_title: getChatTitle(chatData.result),
      updated,
    })
  } catch (error) {
    console.error("Failed to apply Telegram chat to tournaments:", error)
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 })
  }
}
