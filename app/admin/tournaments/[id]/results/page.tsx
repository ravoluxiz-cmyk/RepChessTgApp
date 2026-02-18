"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"

type Row = {
  participant_id: number
  nickname: string
  points: number
  rank: number
  rounds?: { label: string }[]
  tbValues?: Record<string, number | undefined>
}

export default function TournamentResultsPage() {
  const params = useParams<{ id: string }>()
  const tournamentId = Number(params.id)
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<Row[]>([])
  const [totalRounds, setTotalRounds] = useState(0)
  const [tbKeys, setTbKeys] = useState<string[]>([])
  const [tbLabels, setTbLabels] = useState<Record<string, string>>({})
  const [title, setTitle] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [lbRes, tRes] = await Promise.all([
          fetch(`/api/tournaments/${tournamentId}/leaderboard`),
          fetch(`/api/tournaments/${tournamentId}`),
        ])
        if (!lbRes.ok) throw new Error("Не удалось загрузить таблицу результатов")
        const data = await lbRes.json()
        if (data && data.rows) {
          setLeaderboard(Array.isArray(data.rows) ? data.rows : [])
          setTotalRounds(data.totalRounds || 0)
          setTbKeys(Array.isArray(data.tiebreakerKeys) ? data.tiebreakerKeys : [])
          setTbLabels(data.tiebreakerLabels || {})
        } else {
          setLeaderboard(Array.isArray(data) ? data : [])
        }
        if (tRes.ok) {
          const t = await tRes.json()
          setTitle(t?.title || "")
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Неизвестная ошибка")
      } finally {
        setLoading(false)
      }
    }
    if (Number.isFinite(tournamentId)) load()
  }, [tournamentId])

  return (
    <ChessBackground>
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-6xl mx-auto text-white">
          <div className="mb-3">
            <button
              className="text-white/80 hover:text-white"
              onClick={() => router.push(`/admin`)}
              title="Назад к админ‑меню"
            >
              ← Назад
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">Итоги турнира</h1>
          {title && <div className="text-white/70 mb-6">{title}</div>}

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">{error}</div>
          )}
          {loading && (
            <div className="text-white/80">Загрузка…</div>
          )}

          {!loading && leaderboard.length === 0 && !error && (
            <div className="text-white/80">Таблица результатов пуста</div>
          )}

          {!loading && leaderboard.length > 0 && (
            <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-lg">
              <table className="min-w-full text-left text-sm">
                <thead className="text-white/70">
                  <tr>
                    <th className="px-3 py-3 whitespace-nowrap">Место</th>
                    <th className="px-3 py-3 whitespace-nowrap">Имя</th>
                    <th className="px-3 py-3 text-center whitespace-nowrap">Очки</th>
                    {Array.from({ length: totalRounds }, (_, i) => (
                      <th key={`rh-${i}`} className="px-2 py-3 text-center whitespace-nowrap">Тур<br />#{i + 1}</th>
                    ))}
                    {tbKeys.map(k => (
                      <th key={`tbh-${k}`} className="px-2 py-3 text-center whitespace-nowrap">{tbLabels[k] || k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row) => (
                    <tr key={row.participant_id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-3 py-3 font-bold text-center">{row.rank}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{row.nickname}</td>
                      <td className="px-3 py-3 text-center font-semibold">{row.points}</td>
                      {row.rounds ? row.rounds.map((r, i) => {
                        const label = r.label || ''
                        const color = label.startsWith('+') ? 'text-green-400'
                          : label.startsWith('-') ? 'text-red-400'
                            : label.startsWith('=') ? 'text-yellow-400'
                              : 'text-white/50'
                        return <td key={`r-${i}`} className={`px-2 py-3 text-center whitespace-nowrap font-mono text-xs ${color}`}>{label}</td>
                      }) : Array.from({ length: totalRounds }, (_, i) => (
                        <td key={`r-${i}`} className="px-2 py-3 text-center">–</td>
                      ))}
                      {tbKeys.map(k => (
                        <td key={`tb-${k}`} className="px-2 py-3 text-center whitespace-nowrap">
                          {row.tbValues?.[k] != null ? Number(row.tbValues[k]).toFixed(1) : '–'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ChessBackground>
  )
}