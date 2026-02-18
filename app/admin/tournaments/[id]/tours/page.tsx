"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"

type Tour = {
  id: number
  tournament_id: number
  number: number
  status: string
  created_at?: string
}

export default function TournamentToursPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { initData } = useTelegramWebApp()
  const tournamentId = Number(params.id)
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // Telegram chat_id editing
  const [chatId, setChatId] = useState("")
  const [chatIdSaved, setChatIdSaved] = useState(false)
  const [chatIdSaving, setChatIdSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Load tours
        const toursRes = await fetch(`/api/tournaments/${tournamentId}/tours`)
        if (!toursRes.ok) throw new Error("Не удалось загрузить туры")
        const toursData = await toursRes.json()
        setTours(toursData)

        // Load tournament to get chat_id
        const tRes = await fetch(`/api/tournaments/${tournamentId}`)
        if (tRes.ok) {
          const t = await tRes.json()
          setChatId(t.chat_id || "")
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Неизвестная ошибка")
      } finally {
        setLoading(false)
      }
    }
    if (Number.isFinite(tournamentId)) load()
  }, [tournamentId])

  const createTour = async () => {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/tours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Не удалось создать тур")
      }
      const created = await res.json()
      setTours((prev) => [...prev, created])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка")
    } finally {
      setCreating(false)
    }
  }

  const saveChatId = async () => {
    setChatIdSaving(true)
    setChatIdSaved(false)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
        body: JSON.stringify({ chat_id: chatId || null }),
      })
      if (!res.ok) throw new Error("Не удалось сохранить")
      setChatIdSaved(true)
      setTimeout(() => setChatIdSaved(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения chat_id")
    } finally {
      setChatIdSaving(false)
    }
  }

  return (
    <ChessBackground>
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-6">Туры турнира</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white rounded-lg p-4 mb-6">{error}</div>
          )}

          <button
            onClick={createTour}
            disabled={creating}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-60"
          >
            {creating ? "Создание..." : "Создать следующий тур"}
          </button>

          <div className="mt-8 bg-white/5 rounded-lg overflow-hidden">
            <table className="min-w-full text-white">
              <thead>
                <tr className="bg-white/10">
                  <th className="text-left p-3">Раунд</th>
                  <th className="text-left p-3">Статус</th>
                  <th className="text-left p-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="p-3">#{r.number}</td>
                    <td className="p-3">{r.status}</td>
                    <td className="p-3">
                      <button
                        className="bg-white/10 px-3 py-2 rounded hover:bg-white/20"
                        onClick={() => router.push(`/admin/tournaments/${tournamentId}/tours/${r.id}`)}
                      >
                        Открыть
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && tours.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-3 text-white/70">Туры ещё не созданы</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Telegram Settings */}
          <div className="mt-8 bg-white/5 rounded-lg p-4">
            <h2 className="text-white text-lg font-bold mb-3">Telegram</h2>
            <label className="text-gray-300 text-sm">Chat ID группы (для отправки лидерборда)</label>
            <p className="text-gray-500 text-xs mb-2">Если не задан — лидерборд отправляется создателю турнира</p>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="-1001234567890"
                className="flex-1 bg-[#1a1f2e] text-white border border-gray-700 rounded-lg p-3"
              />
              <button
                onClick={saveChatId}
                disabled={chatIdSaving}
                className="bg-blue-600 text-white px-4 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-60 whitespace-nowrap"
              >
                {chatIdSaved ? "✓" : chatIdSaving ? "..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChessBackground>
  )
}