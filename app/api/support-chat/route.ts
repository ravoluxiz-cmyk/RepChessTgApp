import { NextRequest, NextResponse } from "next/server"
import { createSupportRequest } from "@/lib/db"
import { getHelpBotReply } from "@/lib/help-bot"

export const dynamic = "force-dynamic"

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 12
const MAX_MESSAGE_LENGTH = 2000
const MAX_FIELD_LENGTH = 120

type RateLimitBucket = {
  count: number
  resetAt: number
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown"
  return request.headers.get("x-real-ip") || "unknown"
}

function checkRateLimit(key: string) {
  const now = Date.now()
  if (rateLimitBuckets.size > 1000) {
    for (const [bucketKey, bucket] of rateLimitBuckets.entries()) {
      if (bucket.resetAt <= now) rateLimitBuckets.delete(bucketKey)
    }
  }

  const current = rateLimitBuckets.get(key)

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { limited: false, retryAfter: 0 }
  }

  current.count += 1
  if (current.count <= RATE_LIMIT_MAX_REQUESTS) {
    return { limited: false, retryAfter: 0 }
  }

  return {
    limited: true,
    retryAfter: Math.ceil((current.resetAt - now) / 1000),
  }
}

function cleanText(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  return String(value || "").trim().slice(0, maxLength)
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(getClientIp(request))
  if (rateLimit.limited) {
    return NextResponse.json(
      {
        error: "Слишком много сообщений. Попробуйте чуть позже.",
        retry_after: rateLimit.retryAfter,
      },
      { status: 429 }
    )
  }

  const body = await request.json().catch(() => null) as {
    message?: string
    user_name?: string
    user_contact?: string
    telegram_id?: number
    username?: string
    force_admin?: boolean
  } | null

  const message = cleanText(body?.message, MAX_MESSAGE_LENGTH)
  if (!message) {
    return NextResponse.json({ error: "Напишите вопрос" }, { status: 400 })
  }

  const result = getHelpBotReply(message)
  const shouldEscalate = !!body?.force_admin || result.shouldEscalate
  const botText = result.answer.answer

  let supportRequest = null
  if (shouldEscalate) {
    const telegramId = Number(body?.telegram_id)
    supportRequest = await createSupportRequest({
      user_name: cleanText(body?.user_name) || "Гость",
      user_contact: cleanText(body?.user_contact) || null,
      telegram_id: Number.isFinite(telegramId) ? telegramId : null,
      username: cleanText(body?.username) || null,
      question: message,
      bot_answer: botText,
    })
  }

  return NextResponse.json({
    reply: shouldEscalate
      ? `${botText}\n\n${supportRequest ? "Заявка создана. Администратор увидит ее в кабинете." : "Я попытался создать заявку, но таблица support_requests пока недоступна."}`
      : botText,
    topic: result.answer.topic,
    title: result.answer.title,
    confidence: result.confidence,
    suggestions: result.suggestions,
    escalated: shouldEscalate,
    support_request_id: supportRequest?.id || null,
  })
}
