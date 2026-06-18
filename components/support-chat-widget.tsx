"use client"

import { FormEvent, useMemo, useState } from "react"
import { Bot, Headphones, MessageCircle, Send, X } from "lucide-react"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"

type ChatMessage = {
  id: number
  role: "bot" | "user"
  text: string
}

const QUICK_QUESTIONS = [
  "Как зарегистрироваться на турнир?",
  "Где посмотреть расписание?",
  "Как считается рейтинг?",
  "Позвать администратора",
]

export default function SupportChatWidget() {
  const { user } = useTelegramWebApp()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [contact, setContact] = useState("")
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "bot",
      text: "Привет! Я помощник Rep Chess KRD. Отвечу на частые вопросы, а если не справлюсь - передам администратору.",
    },
  ])

  const userName = useMemo(() => {
    if (!user) return "Гость"
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Гость"
  }, [user])

  async function send(text: string, forceAdmin = false) {
    const cleanText = text.trim()
    if (!cleanText || sending) return

    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: cleanText }])
    setMessage("")
    setSending(true)

    try {
      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanText,
          force_admin: forceAdmin || cleanText.toLowerCase().includes("администратор"),
          user_name: userName,
          user_contact: contact,
          telegram_id: user?.id || null,
          username: user?.username || null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      const reply = response.ok ? data.reply : data.error || "Не удалось отправить сообщение"
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: reply }])
    } catch {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: "Не удалось связаться с помощником. Попробуйте еще раз." }])
    } finally {
      setSending(false)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    send(message)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section className="flex h-[min(620px,calc(100vh-96px))] w-[calc(100vw-32px)] max-w-[390px] flex-col overflow-hidden rounded-[26px] border border-white/15 bg-[#151515]/95 text-white shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff200] text-[#151515]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="brand-font text-lg leading-none">Rep Bot</div>
                <div className="text-xs font-semibold text-white/55">FAQ и помощь администратора</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/15 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((item) => (
              <div key={item.id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] whitespace-pre-line rounded-[20px] px-4 py-3 text-sm leading-relaxed ${
                  item.role === "user"
                    ? "bg-white text-[#151515]"
                    : "bg-white/10 text-white"
                }`}>
                  {item.text}
                </div>
              </div>
            ))}
            {sending && <div className="text-xs font-semibold text-white/45">Помощник печатает...</div>}
          </div>

          <div className="border-t border-white/10 px-4 py-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => send(question, question.includes("администратора"))}
                  className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase text-white/75 hover:bg-white/15"
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
                className="mb-2 w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
              />
            )}
            <form onSubmit={submit} className="flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Напишите вопрос"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
              />
              <button disabled={sending || !message.trim()} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff200] text-[#151515] disabled:opacity-50">
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#151515] shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition hover:scale-105"
        title="Открыть чат помощи"
      >
        {open ? <Headphones className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  )
}
