"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { ArrowLeft, LogOut, Trash2, Search, X } from "lucide-react"

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label className="flex items-center gap-3 text-white">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5" />
    {label}
  </label>
)

export default function AdminCreateTournamentPage() {
  const router = useRouter()
  const { initData } = useTelegramWebApp()
  const [title, setTitle] = useState("My Tournament")
  const [format, setFormat] = useState("swiss_bbp_dutch")
  const [pointsWin, setPointsWin] = useState(1)
  const [pointsLoss, setPointsLoss] = useState(0)
  const [pointsDraw, setPointsDraw] = useState(0.5)
  const [byePoints, setByePoints] = useState(1)
  const [rounds, setRounds] = useState(5)

  // Все доступные тай-брейкеры
  const ALL_TIEBREAKERS = [
    { key: 'head_to_head', label: 'Личная встреча' },
    { key: 'buchholz_cut1', label: 'Усеченный Бухгольц-1' },
    { key: 'buchholz', label: 'Бухгольц' },
    { key: 'sonneborn_berger', label: 'Бергер' },
    { key: 'median_buchholz', label: 'Медианный Бухгольц' },
    { key: 'buchholz_cut2', label: 'Усеченный Бухгольц-2' },
    { key: 'number_of_wins', label: 'Победы' },
    { key: 'games_as_black', label: 'Игры чёрными' },
    { key: 'progressive', label: 'Кумулятивный' },
    { key: 'wins_with_black', label: 'Победы чёрными' },
  ]
  const [tiebreakers, setTiebreakers] = useState<string[]>(['head_to_head', 'buchholz_cut1', 'buchholz'])
  const [tbSearch, setTbSearch] = useState('')
  const [tbOpen, setTbOpen] = useState(false)
  const tbRef = useRef<HTMLDivElement>(null)
  const [teamMode, setTeamMode] = useState("none")

  // Options
  const [allowJoin, setAllowJoin] = useState(true)
  const [allowEditResults, setAllowEditResults] = useState(true)
  const [allowDangerChanges, setAllowDangerChanges] = useState(true)
  const [forbidRepeatBye, setForbidRepeatBye] = useState(true)
  const [lateJoinPoints, setLateJoinPoints] = useState(false)
  const [hideRating, setHideRating] = useState(false)
  const [hideNewRating, setHideNewRating] = useState(false)
  const [computePerformance, setComputePerformance] = useState(false)
  const [hideColorNames, setHideColorNames] = useState(false)
  const [showOpponentNames, setShowOpponentNames] = useState(true)
  const [chatId, setChatId] = useState("")
  const [archived, setArchived] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // Close tiebreaker dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tbRef.current && !tbRef.current.contains(e.target as Node)) {
        setTbOpen(false)
        setTbSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Restore draft if available
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("tournament_draft") : null
      if (raw) {
        const d = JSON.parse(raw)
        if (d && typeof d === "object") {
          if (d.title !== undefined) setTitle(String(d.title))
          if (d.format !== undefined) setFormat(String(d.format))
          if (d.points_win !== undefined) setPointsWin(Number(d.points_win))
          if (d.points_loss !== undefined) setPointsLoss(Number(d.points_loss))
          if (d.points_draw !== undefined) setPointsDraw(Number(d.points_draw))
          if (d.bye_points !== undefined) setByePoints(Number(d.bye_points))
          if (d.rounds !== undefined) setRounds(Number(d.rounds))
          if (d.tiebreakers !== undefined && Array.isArray(d.tiebreakers)) setTiebreakers(d.tiebreakers)
          if (d.team_mode !== undefined) setTeamMode(String(d.team_mode))
          if (d.allow_join !== undefined) setAllowJoin(Boolean(d.allow_join))
          if (d.allow_edit_results !== undefined) setAllowEditResults(Boolean(d.allow_edit_results))
          if (d.allow_danger_changes !== undefined) setAllowDangerChanges(Boolean(d.allow_danger_changes))
          if (d.forbid_repeat_bye !== undefined) setForbidRepeatBye(Boolean(d.forbid_repeat_bye))
          if (d.late_join_points !== undefined) setLateJoinPoints(Boolean(d.late_join_points))
          if (d.hide_rating !== undefined) setHideRating(Boolean(d.hide_rating))
          if (d.hide_new_rating !== undefined) setHideNewRating(Boolean(d.hide_new_rating))
          if (d.compute_performance !== undefined) setComputePerformance(Boolean(d.compute_performance))
          if (d.hide_color_names !== undefined) setHideColorNames(Boolean(d.hide_color_names))
          if (d.show_opponent_names !== undefined) setShowOpponentNames(Boolean(d.show_opponent_names))
          if (d.chat_id !== undefined) setChatId(String(d.chat_id))
          if (d.archived !== undefined) setArchived(Boolean(d.archived))
        }
      }
    } catch {
      // ignore restore errors
    }
  }, [])

  const saveDraft = () => {
    try {
      const draft = {
        title,
        format,
        points_win: pointsWin,
        points_loss: pointsLoss,
        points_draw: pointsDraw,
        bye_points: byePoints,
        rounds,
        tiebreakers,
        team_mode: teamMode,
        allow_join: allowJoin,
        allow_edit_results: allowEditResults,
        allow_danger_changes: allowDangerChanges,
        forbid_repeat_bye: forbidRepeatBye,
        late_join_points: lateJoinPoints,
        hide_rating: hideRating,
        hide_new_rating: hideNewRating,
        compute_performance: computePerformance,
        hide_color_names: hideColorNames,
        show_opponent_names: showOpponentNames,
        chat_id: chatId,
        archived,
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("tournament_draft", JSON.stringify(draft))
      }
    } catch {
      // ignore save errors
    }
  }

  // Autosave draft when fields change
  useEffect(() => {
    saveDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    format,
    pointsWin,
    pointsLoss,
    pointsDraw,
    byePoints,
    rounds,
    tiebreakers,
    teamMode,
    allowJoin,
    allowEditResults,
    allowDangerChanges,
    forbidRepeatBye,
    lateJoinPoints,
    hideRating,
    hideNewRating,
    computePerformance,
    hideColorNames,
    showOpponentNames,
    chatId,
    archived,
  ])

  const handleExit = () => {
    saveDraft()
    router.push("/admin")
  }

  const handleClearDraft = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("tournament_draft")
      }
      setInfo("Черновик очищен")
    } catch {
      // ignore errors
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
        body: JSON.stringify({
          title,
          format,
          points_win: pointsWin,
          points_loss: pointsLoss,
          points_draw: pointsDraw,
          bye_points: byePoints,
          rounds,
          tiebreakers: tiebreakers.join(", "),
          team_mode: teamMode,
          allow_join: allowJoin ? 1 : 0,
          allow_edit_results: allowEditResults ? 1 : 0,
          allow_danger_changes: allowDangerChanges ? 1 : 0,
          forbid_repeat_bye: forbidRepeatBye ? 1 : 0,
          late_join_points: lateJoinPoints ? 1 : 0,
          hide_rating: hideRating ? 1 : 0,
          hide_new_rating: hideNewRating ? 1 : 0,
          compute_performance: computePerformance ? 1 : 0,
          hide_color_names: hideColorNames ? 1 : 0,
          show_opponent_names: showOpponentNames ? 1 : 0,
          chat_id: chatId || null,
          archived: archived ? 1 : 0,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Не удалось создать турнир")
      }
      const created = await res.json()
      // Clear draft after successful creation
      try { if (typeof window !== "undefined") localStorage.removeItem("tournament_draft") } catch { }
      router.push(`/admin/tournaments/${created.id}/participants`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ChessBackground>
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              className="flex items-center gap-2 text-white/80 hover:text-white"
              onClick={() => router.push("/admin")}
              title="Назад к админ‑меню"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">К админ‑меню</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearDraft}
                className="flex items-center gap-2 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white hover:bg-white/20"
                title="Очистить сохранённый черновик"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-semibold">Очистить черновик</span>
              </button>
              <button
                onClick={handleExit}
                className="flex items-center gap-2 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white hover:bg-white/20"
                title="Сохранить черновик и выйти"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Выход</span>
              </button>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-6">Создать турнир</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white rounded-lg p-4 mb-6">{error}</div>
          )}
          {info && (
            <div className="bg-emerald-500/20 border border-emerald-500 text-white rounded-lg p-4 mb-6">{info}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Имя */}
            <div>
              <label className="text-white block mb-2">Имя</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/10 text-white p-3 rounded-lg outline-none"
                placeholder="My Tournament"
              />
            </div>

            {/* Формат турнира */}
            <div>
              <label className="text-white block mb-2">Формат турнира</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-white/10 text-white p-3 rounded-lg outline-none"
              >
                <option value="swiss_bbp_dutch">Швейцарская система (BBP Dutch)</option>
                <option value="swiss_bbp_burstein">Швейцарская система (BBP Burstein)</option>

              </select>
            </div>

            {/* Очки за игру */}
            <div>
              <label className="text-white block mb-2">Очки за игру</label>
              <select
                value={`${pointsWin}-${pointsLoss}, ${pointsDraw}-${pointsDraw}`}
                onChange={() => {
                  // фиксированный пресет 1-0, 0.5-0.5
                  setPointsWin(1); setPointsLoss(0); setPointsDraw(0.5)
                }}
                className="w-full bg-white/10 text-white p-3 rounded-lg outline-none"
              >
                <option>1-0, 0-1, 0.5-0.5</option>
              </select>
            </div>

            {/* Очки при пропуске */}
            <div>
              <label className="text-white block mb-2">Очки при пропуске</label>
              <select
                value={byePoints}
                onChange={(e) => setByePoints(Number(e.target.value))}
                className="w-full bg-white/10 text-white p-3 rounded-lg outline-none"
              >
                <option value={1}>1 очко (победа)</option>
                <option value={0.5}>0.5 очка (ничья)</option>
                <option value={0}>0 очков</option>
              </select>
            </div>

            {/* Всего раундов */}
            <div>
              <label className="text-white block mb-2">Всего раундов</label>
              <input
                type="number"
                min={1}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="w-full bg-white/10 text-white p-3 rounded-lg outline-none"
              />
            </div>

            {/* Тай-брейки */}
            <div ref={tbRef} className="relative">
              <label className="text-white block mb-2">Тай-брейки</label>

              {/* Chips + Search input */}
              <div
                className="w-full bg-white/10 rounded-xl border border-white/20 px-3 py-2 flex flex-wrap items-center gap-2 cursor-text"
                onClick={() => { setTbOpen(true) }}
              >
                {tiebreakers.map((tbKey) => {
                  const tb = ALL_TIEBREAKERS.find(t => t.key === tbKey)
                  return (
                    <span
                      key={tbKey}
                      className="inline-flex items-center gap-1 bg-white/15 backdrop-blur text-white text-sm px-3 py-1.5 rounded-lg"
                    >
                      {tb?.label || tbKey}
                      <button
                        type="button"
                        className="text-white/60 hover:text-white ml-0.5"
                        onClick={(e) => {
                          e.stopPropagation()
                          setTiebreakers(tiebreakers.filter(t => t !== tbKey))
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )
                })}
                {tiebreakers.length > 0 && (
                  <button
                    type="button"
                    className="ml-auto text-white/40 hover:text-white/70"
                    onClick={(e) => {
                      e.stopPropagation()
                      setTiebreakers([])
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {tbOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-[#2a3a5c] border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                  {/* Search */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                    <input
                      type="text"
                      value={tbSearch}
                      onChange={(e) => setTbSearch(e.target.value)}
                      placeholder="Поиск..."
                      className="flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
                      autoFocus
                    />
                    <Search className="w-5 h-5 text-white/40" />
                  </div>
                  {/* Options list */}
                  <div className="max-h-64 overflow-y-auto">
                    {ALL_TIEBREAKERS
                      .filter(t => t.label.toLowerCase().includes(tbSearch.toLowerCase()))
                      .map(t => {
                        const isSelected = tiebreakers.includes(t.key)
                        return (
                          <button
                            key={t.key}
                            type="button"
                            className={`w-full text-left px-4 py-3 text-white transition-colors ${isSelected
                              ? 'bg-blue-500/30 text-blue-200'
                              : 'hover:bg-white/10'
                              }`}
                            onClick={() => {
                              if (isSelected) {
                                setTiebreakers(tiebreakers.filter(k => k !== t.key))
                              } else {
                                setTiebreakers([...tiebreakers, t.key])
                              }
                            }}
                          >
                            {t.label}
                          </button>
                        )
                      })}
                  </div>
                  {/* Done button */}
                  <div className="border-t border-white/10 px-4 py-2">
                    <button
                      type="button"
                      className="w-full text-center text-sm text-white/60 hover:text-white py-1"
                      onClick={() => { setTbOpen(false); setTbSearch('') }}
                    >
                      Готово
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Командный режим */}
            <div>
              <label className="text-white block mb-2">Командный режим</label>
              <select
                value={teamMode}
                onChange={(e) => setTeamMode(e.target.value)}
                className="w-full bg-white/10 text-white p-3 rounded-lg outline-none"
              >
                <option value="none">Без команд</option>
              </select>
            </div>

            {/* Разделы настроек */}
            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Редактирование</h2>
              <Toggle checked={allowJoin} onChange={setAllowJoin} label="Разрешить игрокам присоединяться" />
              <Toggle checked={allowEditResults} onChange={setAllowEditResults} label="Разрешить игрокам менять свои результаты" />
              <Toggle checked={allowDangerChanges} onChange={setAllowDangerChanges} label="Разрешить опасные изменения" />
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Расчеты</h2>
              <Toggle checked={forbidRepeatBye} onChange={setForbidRepeatBye} label="Запретить повторный пропуск" />
              <Toggle checked={lateJoinPoints} onChange={setLateJoinPoints} label="Давать очки за позднее присоединение" />
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Интерфейс</h2>
              <Toggle checked={hideRating} onChange={setHideRating} label="Скрыть рейтинг" />
              <Toggle checked={hideNewRating} onChange={setHideNewRating} label="Скрыть новый рейтинг" />
              <Toggle checked={computePerformance} onChange={setComputePerformance} label="Рассчитывать производительность" />
              <Toggle checked={hideColorNames} onChange={setHideColorNames} label="Скрывать названия цветов" />
              <Toggle checked={showOpponentNames} onChange={setShowOpponentNames} label="Показывать имена противников в итогах" />
              <Toggle checked={archived} onChange={setArchived} label="В архиве" />
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Telegram</h2>
              <div>
                <label className="text-gray-300 text-sm">Chat ID группы (для отправки лидерборда)</label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="-1001234567890"
                  className="w-full bg-[#1a1f2e] text-white border border-gray-700 rounded-lg p-3 mt-1"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-60"
            >
              {saving ? "Создание..." : "Создать турнир"}
            </button>
          </form>
        </div>
      </div>
    </ChessBackground>
  )
}