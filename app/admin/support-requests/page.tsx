"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { ArrowLeft, Headphones } from "lucide-react"

type SupportRequest = {
  id: number
  user_name: string
  user_contact?: string | null
  telegram_id?: number | null
  username?: string | null
  question: string
  bot_answer?: string | null
  status: "new" | "in_progress" | "done"
  created_at: string
}

const STATUSES = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "done", label: "Закрыта" },
] as const

export default function AdminSupportRequestsPage() {
  const router = useRouter()
  const { initData, isReady } = useTelegramWebApp()
  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!isReady) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/support-requests?status=${filter}`, {
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
        cache: "no-store",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось загрузить заявки")
      setRequests(Array.isArray(data.requests) ? data.requests : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить заявки")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, initData, isReady])

  async function updateStatus(id: number, status: SupportRequest["status"]) {
    const response = await fetch("/api/admin/support-requests", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
      },
      body: JSON.stringify({ id, status }),
    })
    if (response.ok) {
      setRequests((prev) => prev.map((request) => request.id === id ? { ...request, status } : request))
    }
  }

  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <button onClick={() => router.push("/admin")} className="mb-6 inline-flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            Админ-меню
          </button>

          <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
            <div className="brand-chip mb-4 w-fit px-3 py-1 text-xs font-black uppercase">Support Desk</div>
            <div className="flex items-start gap-3">
              <Headphones className="mt-1 h-8 w-8 text-[#fff200]" />
              <div>
                <h1 className="brand-title text-4xl text-white sm:text-6xl">Заявки из чат-бота</h1>
                <p className="mt-3 max-w-2xl text-white/62">
                  Вопросы, которые бот не понял, и обращения пользователей к администратору.
                </p>
              </div>
            </div>
          </section>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setFilter("all")} className={`shrink-0 rounded-full px-4 py-2 text-sm font-black uppercase ${filter === "all" ? "bg-white text-[#151515]" : "bg-white/10 text-white/75"}`}>
              Все
            </button>
            {STATUSES.map((status) => (
              <button key={status.value} onClick={() => setFilter(status.value)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-black uppercase ${filter === status.value ? "bg-[#fff200] text-[#151515]" : "bg-white/10 text-white/75"}`}>
                {status.label}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/15 p-4 text-red-100">{error}</div>}
          {loading && <div className="text-white/70">Загрузка...</div>}
          {!loading && requests.length === 0 && <div className="rounded-[22px] border border-white/10 bg-white/5 p-6 text-white/70">Заявок пока нет</div>}

          <div className="grid gap-4">
            {requests.map((request) => (
              <article key={request.id} className="rounded-[22px] border border-white/10 bg-white/[0.06] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xl font-black">{request.user_name || "Гость"}</div>
                    <div className="text-sm text-white/60">
                      {request.username ? `@${request.username}` : request.user_contact || "контакт не указан"}
                      {request.telegram_id ? ` • ${request.telegram_id}` : ""}
                    </div>
                    <div className="mt-2 text-xs text-white/45">{new Date(request.created_at).toLocaleString("ru-RU")}</div>
                  </div>
                  <select value={request.status} onChange={(event) => updateStatus(request.id, event.target.value as SupportRequest["status"])} className="rounded-lg border border-white/10 bg-[#1a1f2e] px-3 py-2 text-white">
                    {STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </div>
                <div className="mt-4 rounded-2xl bg-black/20 p-4">
                  <div className="mb-2 text-xs font-black uppercase text-white/45">Вопрос</div>
                  <div className="whitespace-pre-line text-white/85">{request.question}</div>
                </div>
                {request.bot_answer && (
                  <div className="mt-3 rounded-2xl bg-white/10 p-4">
                    <div className="mb-2 text-xs font-black uppercase text-white/45">Ответ бота</div>
                    <div className="whitespace-pre-line text-white/70">{request.bot_answer}</div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </main>
    </ChessBackground>
  )
}
