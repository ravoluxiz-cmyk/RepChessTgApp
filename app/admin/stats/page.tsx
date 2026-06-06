"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { ArrowLeft, BarChart3 } from "lucide-react"

type Stats = {
  registrations: number
  attended: number
  noShows: number
  newPlayers: number
  lessonRequests: number
  merchOrders: number
  partnershipRequests: number
  calibratingPlayers: number
  popularTournaments: Array<{ tournament_id: number; title: string; registrations: number; attended: number }>
  attendanceByTournament: Array<{ tournament_id: number; title: string; attended: number }>
  popularPartnershipFormats: Array<{ format: string; count: number }>
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-5">
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
    </div>
  )
}

export default function AdminStatsPage() {
  const router = useRouter()
  const { initData, isReady } = useTelegramWebApp()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (!isReady) return
        const response = await fetch("/api/admin/stats", {
          headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
          cache: "no-store",
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || "Не удалось загрузить статистику")
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить статистику")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [initData, isReady])

  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <button onClick={() => router.push("/admin")} className="mb-6 inline-flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            Админ-меню
          </button>

          <div className="mb-6 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-cyan-300" />
            <h1 className="text-3xl font-black sm:text-5xl">Статистика</h1>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/15 p-4 text-red-100">{error}</div>}
          {loading && <div className="text-white/70">Загрузка...</div>}

          {stats && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Регистрации на турниры" value={stats.registrations} />
                <StatCard label="Фактические участники" value={stats.attended} />
                <StatCard label="Не пришли" value={stats.noShows} />
                <StatCard label="Игроки в базе" value={stats.newPlayers} />
                <StatCard label="Заявки на уроки" value={stats.lessonRequests} />
                <StatCard label="Заказы мерча" value={stats.merchOrders} />
                <StatCard label="B2B-заявки" value={stats.partnershipRequests} />
                <StatCard label="Игроки в калибровке" value={stats.calibratingPlayers} />
              </div>

              <section className="rounded-lg border border-white/10 bg-white/5 p-5">
                <h2 className="mb-4 text-xl font-bold">Популярные турниры</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-white/60">
                      <tr>
                        <th className="p-3">Турнир</th>
                        <th className="p-3">Регистраций</th>
                        <th className="p-3">Пришли</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.popularTournaments.map((item) => (
                        <tr key={item.tournament_id} className="border-t border-white/10">
                          <td className="p-3">{item.title}</td>
                          <td className="p-3">{item.registrations}</td>
                          <td className="p-3">{item.attended}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <h2 className="mb-4 text-xl font-bold">Динамика посещаемости</h2>
                  <div className="space-y-3">
                    {stats.attendanceByTournament.map((item) => (
                      <div key={item.tournament_id}>
                        <div className="mb-1 flex justify-between gap-4 text-sm">
                          <span className="truncate">{item.title}</span>
                          <span>{item.attended}</span>
                        </div>
                        <div className="h-2 rounded bg-white/10">
                          <div className="h-2 rounded bg-cyan-300" style={{ width: `${Math.min(100, item.attended * 10)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <h2 className="mb-4 text-xl font-bold">Форматы B2B-заявок</h2>
                  <div className="space-y-3">
                    {stats.popularPartnershipFormats.map((item) => (
                      <div key={item.format} className="flex justify-between rounded-lg bg-black/20 px-3 py-2">
                        <span>{item.format}</span>
                        <span className="font-bold">{item.count}</span>
                      </div>
                    ))}
                    {stats.popularPartnershipFormats.length === 0 && <div className="text-white/60">Пока нет данных</div>}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </ChessBackground>
  )
}
