"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { ArrowLeft } from "lucide-react"

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

export default function TournamentSettingsPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const { initData } = useTelegramWebApp()
    const tournamentId = Number(params.id)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [settings, setSettings] = useState<TournamentSettings>({
        title: "", bye_points: 1, rounds: 5, tiebreakers: "buchholz,buchholz_cut1",
        chat_id: "", forbid_repeat_bye: 1, points_win: 1, points_loss: 0, points_draw: 0.5,
    })

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/tournaments/${tournamentId}`)
                if (!res.ok) throw new Error("Не удалось загрузить турнир")
                const t = await res.json()
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
            } catch (e) {
                setError(e instanceof Error ? e.message : "Неизвестная ошибка")
            } finally {
                setLoading(false)
            }
        }
        if (Number.isFinite(tournamentId)) load()
    }, [tournamentId])

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

    if (loading) {
        return (
            <ChessBackground>
                <div className="min-h-screen flex items-center justify-center text-white/80">Загрузка...</div>
            </ChessBackground>
        )
    }

    return (
        <ChessBackground>
            <div className="min-h-screen px-4 py-6">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <button
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
                        onClick={() => router.push(`/admin/tournaments`)}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold">К списку турниров</span>
                    </button>

                    <h1 className="text-3xl font-black text-white mb-6">⚙️ Настройки турнира</h1>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-white rounded-lg p-4 mb-6">{error}</div>
                    )}

                    <div className="bg-white/5 rounded-xl p-5 space-y-5 border border-white/10">
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
                                <label className={labelClass}>За победу</label>
                                <input
                                    type="number" step="0.5" min="0"
                                    value={settings.points_win}
                                    onChange={(e) => setSettings(prev => ({ ...prev, points_win: Number(e.target.value) }))}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>За ничью</label>
                                <input
                                    type="number" step="0.5" min="0"
                                    value={settings.points_draw}
                                    onChange={(e) => setSettings(prev => ({ ...prev, points_draw: Number(e.target.value) }))}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>За проигрыш</label>
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
                                <label className={labelClass}>Очки за bye</label>
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
                            <label className={labelClass}>Тай-брейкеры</label>
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
                            <label className={labelClass}>Telegram Chat ID</label>
                            <p className="text-gray-500 text-xs mb-2">Для отправки лидерборда в группу. Если пусто — отправляется создателю.</p>
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
                </div>
            </div>
        </ChessBackground>
    )
}
