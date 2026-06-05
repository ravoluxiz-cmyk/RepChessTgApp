"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { ArrowLeft, CheckCircle2, ExternalLink, XCircle } from "lucide-react"

type RatingRequest = {
  id: number
  user_name: string
  user_telegram_id: number
  platform: "lichess" | "chesscom"
  profile_url: string
  status: "pending" | "approved" | "rejected"
  approved_rating?: number | null
  admin_note?: string | null
  created_at: string
}

export default function AdminRatingRequestsPage() {
  const router = useRouter()
  const { initData, isReady } = useTelegramWebApp()
  const [requests, setRequests] = useState<RatingRequest[]>([])
  const [ratings, setRatings] = useState<Record<number, string>>({})
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [filter, setFilter] = useState("pending")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      if (!isReady) return
      const response = await fetch(`/api/admin/rating-requests?status=${filter}`, {
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

  async function resolve(id: number, status: "approved" | "rejected") {
    setError(null)
    try {
      const response = await fetch("/api/admin/rating-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
        body: JSON.stringify({
          id,
          status,
          approved_rating: ratings[id] ? Number(ratings[id]) : null,
          admin_note: notes[id] || null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось обработать заявку")
      setRequests((prev) => prev.filter((request) => request.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обработать заявку")
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

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-black sm:text-5xl">Заявки рейтинга</h1>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-white/10 bg-[#1a1f2e] px-3 py-2 text-white">
              <option value="pending">В ожидании</option>
              <option value="approved">Подтвержденные</option>
              <option value="rejected">Отклоненные</option>
              <option value="all">Все</option>
            </select>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/15 p-4 text-red-100">{error}</div>}
          {loading && <div className="text-white/70">Загрузка...</div>}
          {!loading && requests.length === 0 && <div className="rounded-lg border border-white/10 bg-white/5 p-5 text-white/70">Заявок нет</div>}

          <div className="grid gap-4">
            {requests.map((request) => (
              <div key={request.id} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xl font-bold">{request.user_name}</div>
                    <div className="text-sm text-white/60">Telegram ID: {request.user_telegram_id} • {new Date(request.created_at).toLocaleString("ru-RU")}</div>
                  </div>
                  <span className="w-fit rounded-lg border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-sm text-amber-50">{request.status}</span>
                </div>

                <a href={request.profile_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-emerald-200 underline">
                  {request.platform === "lichess" ? "Lichess" : "Chess.com"}
                  <ExternalLink className="h-4 w-4" />
                </a>

                {request.status === "pending" && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto_auto]">
                    <input
                      type="number"
                      min="100"
                      max="3000"
                      value={ratings[request.id] || ""}
                      onChange={(e) => setRatings((prev) => ({ ...prev, [request.id]: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-emerald-300"
                      placeholder="Рейтинг"
                    />
                    <input
                      value={notes[request.id] || ""}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [request.id]: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-emerald-300"
                      placeholder="Комментарий админа"
                    />
                    <button onClick={() => resolve(request.id, "approved")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-500">
                      <CheckCircle2 className="h-4 w-4" />
                      Принять
                    </button>
                    <button onClick={() => resolve(request.id, "rejected")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-3 py-2 font-semibold text-white hover:bg-red-600">
                      <XCircle className="h-4 w-4" />
                      Отклонить
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </ChessBackground>
  )
}
