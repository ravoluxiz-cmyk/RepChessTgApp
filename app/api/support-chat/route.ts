import { NextRequest, NextResponse } from "next/server"
import { createSupportRequest } from "@/lib/db"
import { getHelpBotReply } from "@/lib/help-bot"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    message?: string
    user_name?: string
    user_contact?: string
    telegram_id?: number
    username?: string
    force_admin?: boolean
  } | null

  const message = String(body?.message || "").trim()
  if (!message) {
    return NextResponse.json({ error: "Напишите вопрос" }, { status: 400 })
  }

  const { answer, confidence } = getHelpBotReply(message)
  const shouldEscalate = !!body?.force_admin || !answer || confidence < 0.5
  const botText = answer
    ? answer.answer
    : "Я не уверен, что правильно понял вопрос. Передам его администратору, чтобы вам помогли лично."

  let supportRequest = null
  if (shouldEscalate) {
    supportRequest = await createSupportRequest({
      user_name: String(body?.user_name || "").trim() || "Гость",
      user_contact: String(body?.user_contact || "").trim() || null,
      telegram_id: body?.telegram_id ? Number(body.telegram_id) : null,
      username: String(body?.username || "").trim() || null,
      question: message,
      bot_answer: botText,
    })
  }

  return NextResponse.json({
    reply: shouldEscalate
      ? `${botText}\n\nЗаявка для администратора ${supportRequest ? "создана" : "будет создана после настройки таблицы support_requests"}.`
      : botText,
    topic: answer?.topic || null,
    escalated: shouldEscalate,
    support_request_id: supportRequest?.id || null,
  })
}
