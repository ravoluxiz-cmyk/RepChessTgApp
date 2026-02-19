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

type TournamentSettings = {
  title: string
  bye_points: number
  rounds: number
  tiebreakers: string
  chat_id: string
  forbid_repeat_bye: number
  points_win: number
  points_loss: number
  points_draw: number
}

const ALL_TIEBREAKERS = [
  { key: 'buchholz', label: 'Бухгольц' },
  { key: 'buchholz_cut1', label: 'Бухгольц -1' },
  { key: 'buchholz_cut2', label: 'Бухгольц -2' },
  { key: 'median_buchholz', label: 'Медиан Бухгольц' },
  { key: 'sonneborn_berger', label: 'Зоннеборн-Бергер' },
  { key: 'number_of_wins', label: 'Кол-во побед' },
  { key: 'games_as_black', label: 'Партии чёрными' },
  { key: 'progressive', label: 'Прогрессивный' },
  { key: 'wins_with_black', label: 'Победы чёрными' },
  { key: 'head_to_head', label: 'Личная встреча' },
]

export default function TournamentToursPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { initData } = useTelegramWebApp()
  const tournamentId = Number(params.id)
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // Settings
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<TournamentSettings>({
    title: "", bye_points: 1, rounds: 5, tiebreakers: "buchholz,buchholz_cut1",
    chat_id: "", forbid_repeat_bye: 1, points_win: 1, points_loss: 0, points_draw: 0.5,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const toursRes = await fetch(`/api/tournaments/${tournamentId}/tours`)
        if (!toursRes.ok) throw new Error("Не удалось загрузить туры")
        const toursData = await toursRes.json()
        setTours(toursData)

        const tRes = await fetch(`/api/tournaments/${tournamentId}`)
        if (tRes.ok) {
          const t = await tRes.json()
          setSettings({
            title: t.title || "",
            bye_points: t.bye_points ?? 1,
            rounds: t.rounds ?? 5,
            tiebreakers: t.tiebreakers || "buchholz,buchholz_cut1",
            chat_id: t.chat_id || "",
            forbid_repeat_bye: t.forbid_repeat_bye ?? 1,
            points_win: t.points_win ?? 1,
            points_loss: t.points_loss ?? 0,
            points_draw: t.points_draw ?? 0.5,
          })
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

  const saveSettings = async () => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
        body: JSON.stringify({
          title: settings.title,
          bye_points: settings.bye_points,
          rounds: settings.rounds,
          tiebreakers: settings.tiebreakers,
          chat_id: settings.chat_id || null,
          forbid_repeat_bye: settings.forbid_repeat_bye,
          points_win: settings.points_win,
          points_loss: settings.points_loss,
          points_draw: settings.points_draw,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Не удалось сохранить")
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения настроек")
    } finally {
      setSaving(false)
    }
  }

  const selectedTiebreakers = settings.tiebreakers ? settings.tiebreakers.split(",").map(s => s.trim()).filter(Boolean) : []

  const toggleTiebreaker = (key: string) => {
    const current = [...selectedTiebreakers]
    const idx = current.indexOf(key)
    if (idx >= 0) {
      current.splice(idx, 1)
    } else {
      current.push(key)
    }
    setSettings(prev => ({ ...prev, tiebreakers: current.join(",") }))
  }

  const inputClass = "w-full bg-[#1a1f2e] text-white border border-gray-700 rounded-lg p-3 text-sm"
  const labelClass = "text-gray-300 text-sm mb-1 block"

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

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="mt-8 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 text-white rounded-lg p-4 transition-colors"
          >
            <span className="text-lg font-bold">⚙️ Настройки турнира</span>
            <span className="text-xl">{showSettings ? "▲" : "▼"}</span>
          </button>

          {showSettings && (
            <div className="bg-white/5 rounded-b-lg p-4 space-y-4 border-t border-white/10">
              {/* Title */}
              <div>
                <label className={labelClass}>Название турнира</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                  className={inputClass}
                />
              </div>

              {/* Points row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Очки за победу</label>
                  <input
                    type="number" step="0.5" min="0"
                    value={settings.points_win}
                    onChange={(e) => setSettings(prev => ({ ...prev, points_win: Number(e.target.value) }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Очки за ничью</label>
                  <input
                    type="number" step="0.5" min="0"
                    value={settings.points_draw}
                    onChange={(e) => setSettings(prev => ({ ...prev, points_draw: Number(e.target.value) }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Очки за проигр.</label>
                  <input
                    type="number" step="0.5" min="0"
                    value={settings.points_loss}
                    onChange={(e) => setSettings(prev => ({ ...prev, points_loss: Number(e.target.value) }))}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Bye + Rounds row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Очки за пропуск (bye)</label>
                  <select
                    value={settings.bye_points}
                    onChange={(e) => setSettings(prev => ({ ...prev, bye_points: Number(e.target.value) }))}
                    className={inputClass}
                  >
                    <option value={1}>1 очко (победа)</option>
                    <option value={0.5}>0.5 очка (ничья)</option>
                    <option value={0}>0 очков</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Количество туров</label>
                  <input
                    type="number" min="1" max="30"
                    value={settings.rounds}
                    onChange={(e) => setSettings(prev => ({ ...prev, rounds: Number(e.target.value) }))}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Forbid repeat bye */}
              <label className="flex items-center gap-3 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.forbid_repeat_bye === 1}
                  onChange={(e) => setSettings(prev => ({ ...prev, forbid_repeat_bye: e.target.checked ? 1 : 0 }))}
                  className="w-5 h-5 rounded bg-[#1a1f2e] border-gray-700"
                />
                <span className="text-sm">Запрет повторного bye</span>
              </label>

              {/* Tiebreakers */}
              <div>
                <label className={labelClass}>Тай-брейкеры (нажми чтобы выбрать)</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ALL_TIEBREAKERS.map((tb) => {
                    const active = selectedTiebreakers.includes(tb.key)
                    return (
                      <button
                        key={tb.key}
                        type="button"
                        onClick={() => toggleTiebreaker(tb.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active
                            ? "bg-blue-600 text-white"
                            : "bg-white/10 text-gray-400 hover:bg-white/20"
                          }`}
                      >
                        {tb.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Telegram Chat ID */}
              <div>
                <label className={labelClass}>Telegram Chat ID группы</label>
                <p className="text-gray-500 text-xs mb-2">Для отправки лидерборда. Если пусто — отправляется создателю турнира.</p>
                <input
                  type="text"
                  value={settings.chat_id}
                  onChange={(e) => setSettings(prev => ({ ...prev, chat_id: e.target.value }))}
                  placeholder="-1001234567890"
                  className={inputClass}
                />
              </div>

              {/* Save button */}
              <button
                onClick={saveSettings}
                disabled={saving}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-500 disabled:opacity-60 transition-colors"
              >
                {saved ? "✓ Сохранено!" : saving ? "Сохранение..." : "💾 Сохранить настройки"}
              </button>
            </div>
          )}
        </div>
      </div>
    </ChessBackground>
  )
}