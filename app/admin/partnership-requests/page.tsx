"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { ArrowLeft, Building2 } from "lucide-react"

type PartnershipRequest = {
  id: number
  name: string
  company: string
  contact: string
  format: string
  people_count?: number | null
  comment?: string | null
  status: "new" | "in_progress" | "done" | "rejected"
  created_at: string
}

const STATUSES = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "done", label: "Закрыта" },
  { value: "rejected", label: "Отклонена" },
]

export default function AdminPartnershipRequestsPage() {
  const router = useRouter()
  const { initData, isReady } = useTelegramWebApp()
  const [requests, setRequests] = useState<PartnershipRequest[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      if (!isReady) return
      const response = await fetch(`/api/admin/partnership-requests?status=${filter}`, {
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

  async function updateStatus(id: number, status: PartnershipRequest["status"]) {
    const response = await fetch("/api/admin/partnership-requests", {
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

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-emerald-300" />
              <h1 className="text-3xl font-black sm:text-5xl">B2B-заявки</h1>
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-white/10 bg-[#1a1f2e] px-3 py-2 text-white">
              <option value="all">Все</option>
              {STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/15 p-4 text-red-100">{error}</div>}
          {loading && <div className="text-white/70">Загрузка...</div>}
          {!loading && requests.length === 0 && <div className="rounded-lg border border-white/10 bg-white/5 p-5 text-white/70">Заявок нет</div>}

          <div className="grid gap-4">
            {requests.map((request) => (
              <div key={request.id} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xl font-bold">{request.company}</div>
                    <div className="text-white/75">{request.name} • {request.contact}</div>
                    <div className="mt-2 text-sm text-white/60">{new Date(request.created_at).toLocaleString("ru-RU")}</div>
                  </div>
                  <select value={request.status} onChange={(e) => updateStatus(request.id, e.target.value as PartnershipRequest["status"])} className="rounded-lg border border-white/10 bg-[#1a1f2e] px-3 py-2 text-white">
                    {STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-white/75 sm:grid-cols-2">
                  <div>Формат: <span className="text-white">{request.format}</span></div>
                  <div>Людей: <span className="text-white">{request.people_count || "не указано"}</span></div>
                </div>
                {request.comment && <div className="mt-4 rounded-lg bg-black/20 p-3 text-white/80">{request.comment}</div>}
              </div>
            ))}
          </div>
        </div>
      </main>
    </ChessBackground>
  )
}
