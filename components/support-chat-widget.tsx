"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"

type ChatMessage = {
  id: number
  role: "bot" | "user"
  text: string
  suggestions?: string[]
}

const QUICK_TOPICS = [
  "Где расписание турниров?",
  "Как записаться на турнир?",
  "Я новичок, можно прийти?",
  "Как считается рейтинг?",
  "Хочу мерч",
  "Позвать администратора",
]

function shouldForceAdmin(text: string) {
  return /(админ|администратор|оператор|человек|поддержка|помоги|не работает|ошибка|сломал|завис|баг|проблема)/i.test(text)
}

export default function SupportChatWidget() {
  const { user } = useTelegramWebApp()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [contact, setContact] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "bot",
      text: "Привет! Я помощник Rep Chess KRD. Спроси про турниры, запись, рейтинг, мерч, уроки или правила. Если вопрос сложный, передам администратору.",
      suggestions: QUICK_TOPICS.slice(0, 4),
    },
  ])

  const userName = useMemo(() => {
    if (!user) return "Гость"
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Гость"
  }, [user])

  useEffect(() => {
    if (!open) return
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" })
  }, [messages, open, sending])

  async function send(text: string, forceAdmin = false) {
    const cleanText = text.trim()
    if (!cleanText || sending) return

    const now = Date.now()
    setMessages((prev) => [...prev, { id: now, role: "user", text: cleanText }])
    setMessage("")
    setSending(true)

    try {
      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanText,
          force_admin: forceAdmin || shouldForceAdmin(cleanText),
          user_name: userName,
          user_contact: contact,
          telegram_id: user?.id || null,
          username: user?.username || null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      const reply = response.ok ? data.reply : data.error || "Не удалось отправить сообщение"
      const suggestions = Array.isArray(data.suggestions) ? data.suggestions.slice(0, 4) : QUICK_TOPICS.slice(0, 4)
      setMessages((prev) => [...prev, { id: now + 1, role: "bot", text: reply, suggestions }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: now + 1,
          role: "bot",
          text: "Не удалось связаться с помощником. Напиши в Telegram @RepChessKRD или попробуй еще раз.",
          suggestions: ["Позвать администратора", "Где Telegram?", "Где расписание?"],
        },
      ])
    } finally {
      setSending(false)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    send(message)
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section className="flex h-[min(680px,calc(100vh-108px))] w-[calc(100vw-28px)] max-w-[430px] flex-col overflow-hidden rounded-[28px] border border-white/14 bg-[#111] text-white shadow-[0_14px_42px_rgba(0,0,0,0.46)]">
          <header className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.06] px-4 py-4">
            <div>
              <div className="brand-font text-xl leading-none">Rep Chess бот</div>
              <div className="mt-1 text-xs font-semibold leading-snug text-white/55">
                Отвечает по сайту и передает сложные вопросы администратору.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/10 px-3 py-2 text-sm font-black uppercase text-white/70 transition hover:bg-white/15 hover:text-white"
            >
              Закрыть
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((item) => (
              <div key={item.id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[86%] ${item.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                  <div
                    className={`whitespace-pre-line rounded-[22px] px-4 py-3 text-sm leading-relaxed ${
                      item.role === "user"
                        ? "bg-white text-[#151515]"
                        : "border border-white/[0.08] bg-white/10 text-white"
                    }`}
                  >
                    {item.text}
                  </div>
                  {item.role === "bot" && item.suggestions && item.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.suggestions.map((suggestion) => (
                        <button
                          key={`${item.id}-${suggestion}`}
                          type="button"
                          onClick={() => send(suggestion, shouldForceAdmin(suggestion))}
                          className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-left text-[0.7rem] font-black uppercase leading-tight text-white/75 transition hover:border-white/25 hover:bg-white/[0.12] hover:text-white"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="inline-flex rounded-full bg-white/[0.08] px-3 py-2 text-xs font-semibold text-white/50">
                Помощник печатает...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/10 px-4 py-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {QUICK_TOPICS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => send(question, shouldForceAdmin(question))}
                  className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase text-white/75 transition hover:bg-white/15 hover:text-white"
                >
                  {question}
                </button>
              ))}
            </div>
            {!user && (
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="Telegram / телефон для ответа"
                className="mb-2 w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
              />
            )}
            <form onSubmit={submit} className="flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Напиши вопрос своими словами"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="flex h-12 min-w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff200] px-4 text-lg font-black text-[#151515] transition hover:brightness-95 disabled:opacity-50"
              >
                →
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 min-w-14 items-center justify-center rounded-full bg-white px-5 text-sm font-black uppercase text-[#151515] shadow-[0_10px_28px_rgba(0,0,0,0.32)] transition hover:scale-[1.02] sm:h-16"
        title="Открыть чат помощи"
      >
        {open ? "закрыть" : "чат"}
      </button>
    </div>
  )
}
