"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"

type User = {
  id: number
  telegram_id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  rating?: number
}

type Participant = {
  id: number
  tournament_id: number
  user_id: number
  nickname: string
  active?: boolean
  created_at: string
}

export default function TournamentParticipantsPage() {
  const params = useParams<{ id: string }>()
  const tournamentId = Number(params.id)
  const router = useRouter()
  const { initData } = useTelegramWebApp()

  const [users, setUsers] = useState<User[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [starting, setStarting] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedInfo, setSeedInfo] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [tours, setTours] = useState<Array<{ id: number; number: number; status: string; created_at: string }>>([])
  const [tournamentMeta, setTournamentMeta] = useState<{ rounds: number; archived: number } | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [usersRes, partsRes, toursRes, tournamentRes] = await Promise.all([
          fetch("/api/users"),
          fetch(`/api/tournaments/${tournamentId}/participants`),
          fetch(`/api/tournaments/${tournamentId}/tours`),
          fetch(`/api/tournaments/${tournamentId}`),
        ])
        if (!usersRes.ok) throw new Error("Не удалось загрузить пользователей")
        if (!partsRes.ok) throw new Error("Не удалось загрузить участников")
        if (!toursRes.ok) throw new Error("Не удалось загрузить туры")
        if (!tournamentRes.ok) throw new Error("Не удалось загрузить турнир")
        const usersData = await usersRes.json()
        const partsData = await partsRes.json()
        const toursData = await toursRes.json()
        const tournamentData = await tournamentRes.json()
        setUsers(Array.isArray(usersData) ? usersData : [])
        setParticipants(Array.isArray(partsData) ? partsData : [])
        setTours(Array.isArray(toursData) ? toursData : [])
        setTournamentMeta(tournamentData && typeof tournamentData === 'object' ? { rounds: Number(tournamentData.rounds || 0), archived: Number(tournamentData.archived || 0) } : null)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Неизвестная ошибка")
      } finally {
        setLoading(false)
      }
    }
    if (Number.isFinite(tournamentId)) fetchAll()
  }, [tournamentId])

  const addParticipant = async () => {
    if (!selectedUserId) return setError("Выберите пользователя")
    if (!nickname.trim()) return setError("Введите никнейм")
    setAdding(true)
    setError(null)
    try {
      const res = await fetch(`/api/participants/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
        body: JSON.stringify({
          tournament_id: tournamentId,
          user_id: selectedUserId,
          nickname: nickname.trim()
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 403) {
          throw new Error("Недостаточно прав для добавления участников")
        }
        throw new Error(err.error || "Не удалось добавить участника")
      }
      const created = await res.json()
      setParticipants((prev) => [...prev, created])
      setNickname("")
      setSelectedUserId(null)
      setQuery("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка")
    } finally {
      setAdding(false)
    }
  }

  const startTour = async () => {
    if (!Number.isFinite(tournamentId)) return
    if (participants.length < 2) return setError("Добавьте минимум двух участников")
    const planned = tournamentMeta?.rounds ?? 0
    const archived = tournamentMeta?.archived ?? 0
    if (archived === 1) {
      return setError("Турнир завершён, запуск новых туров недоступен")
    }
    if (planned > 0 && tours.length >= planned) {
      return setError(`Достигнут лимит туров (${planned}) — нельзя начать новый тур`)
    }
    setStarting(true)
    setError(null)
    try {
      const createRes = await fetch(`/api/tournaments/${tournamentId}/tours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
        body: JSON.stringify({}),
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        throw new Error(err.error || "Не удалось создать тур")
      }
      const newTour = await createRes.json()
      // Попытаться сразу сгенерировать пары и отправить скриншот в Telegram
      const pairRes = await fetch(`/api/tournaments/${tournamentId}/tours/${newTour.id}/pairings`, {
        method: "POST",
        headers: {
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
      })
      if (!pairRes.ok) {
        let msg = "Не удалось сгенерировать пары для нового тура"
        try {
          const data = await pairRes.json()
          if (data && typeof data.error === 'string') msg = data.error
        } catch { }
        if (pairRes.status === 502) {
          msg = "BBP недоступен или вернул пустой результат. Для Vercel используйте bbp-mock.js вместо нативного бинарника. Проверьте BBP_PAIRINGS_BIN в .env.local. Пары можно сгенерировать позже на странице тура."
        }
        setError(msg)
      }
      router.push(`/admin/tournaments/${tournamentId}/tours/${newTour.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка")
    } finally {
      setStarting(false)
    }
  }

  const deleteAllTours = async () => {
    if (!Number.isFinite(tournamentId)) return
    if (!confirm("Удалить все туры? Действие необратимо.")) return
    setError(null)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/tours`, {
        method: "DELETE",
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Не удалось удалить туры")
      }
      setTours([])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка")
    }
  }

  const deleteTour = async (tourId: number) => {
    if (!Number.isFinite(tournamentId)) return
    if (!confirm("Удалить этот тур? Действие необратимо.")) return
    setError(null)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/tours/${tourId}`, {
        method: "DELETE",
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Не удалось удалить тур")
      }
      setTours((prev) => prev.filter((t) => t.id !== tourId))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка")
    }
  }

  const backToCreate = () => {
    router.push("/admin/tournaments/new")
  }

  const safeUsers: User[] = Array.isArray(users) ? users : []
  const filteredUsers = query
    ? safeUsers.filter((u) => (u.username || "").toLowerCase().includes(query.toLowerCase()))
    : []

  // Live search when query starts with '@' or contains name
  useEffect(() => {
    const raw = query.trim()
    const isAt = raw.startsWith("@")
    const fragment = isAt ? raw.slice(1).trim() : raw

    if (fragment.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(fragment)}&limit=8`, { signal: controller.signal })
        if (!res.ok) {
          setSearchResults([])
          setShowDropdown(false)
          return
        }
        const data = await res.json()
        setSearchResults(Array.isArray(data.users) ? data.users : [])
        setShowDropdown(true)
      } catch {
        // ignore fetch aborts
        setShowDropdown(false)
      } finally {
        setSearchLoading(false)
      }
    }, 250)

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [query])

  const seedUsers = async () => {
    setSeeding(true)
    setSeedInfo(null)
    setError(null)
    try {
      const res = await fetch("/api/dev/seed-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Не удалось добавить тестовых пользователей")
      }
      const data = await res.json()
      const insertedCount =
        typeof data === 'object' && data !== null && 'inserted' in data && typeof (data as { inserted: unknown }).inserted === 'number'
          ? (data as { inserted: number }).inserted
          : (typeof data === 'object' && data !== null && 'count' in data && typeof (data as { count: unknown }).count === 'number'
            ? (data as { count: number }).count
            : 0)
      setSeedInfo(`Добавлено пользователей: ${insertedCount}`)
      const usersRes = await fetch("/api/users")
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(Array.isArray(usersData) ? usersData : [])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка")
    } finally {
      setSeeding(false)
    }
  }

  const withdrawPlayer = async (participantId: number) => {
    if (!confirm("Исключить участника из жеребьевки? Он не будет участвовать в следующих турах.")) return
    setError(null)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/participants/${participantId}/withdraw`, {
        method: "POST",
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Не удалось исключить участника")
      }
      // Обновляем локальный state
      setParticipants((prev) => prev.map((p) => p.id === participantId ? { ...p, active: false } : p))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка")
    }
  }

  const restorePlayer = async (participantId: number) => {
    setError(null)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/participants/${participantId}/restore`, {
        method: "POST",
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Не удалось вернуть участника")
      }
      // Обновляем локальный state
      setParticipants((prev) => prev.map((p) => p.id === participantId ? { ...p, active: true } : p))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка")
    }
  }

  const deletePlayer = async (participantId: number, nickname: string) => {
    if (!confirm(`Полностью удалить участника «${nickname}»? Все его матчи будут удалены. Это необратимо!`)) return
    setError(null)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/participants/${participantId}`, {
        method: "DELETE",
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Не удалось удалить участника")
      }
      setParticipants((prev) => prev.filter((p) => p.id !== participantId))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка")
    }
  }

  return (
    <ChessBackground>
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
            Назад
          </button>
          <h1 className="text-4xl font-black text-white mb-6">Добавить участников</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white rounded-lg p-4 mb-6">{error}</div>
          )}

          {/* Форма добавления участника */}
          <div className="space-y-4 bg-white/5 p-4 rounded-lg">
            <div className="relative">
              <label className="text-white block mb-2">Поиск участника</label>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedUserId(null)
                }}
                className="w-full bg-white/10 text-white p-3 rounded-lg outline-none"
                placeholder={loading ? "Загрузка пользователей..." : "Введите имя, фамилию или ник, например Чеслав или @username"}
              />
              {/* Dropdown results when searching with '@' */}
              {showDropdown && (
                <div className="absolute left-0 right-0 mt-2 rounded-lg border border-white/20 bg-gray-900/90 backdrop-blur z-10 max-h-64 overflow-auto">
                  {searchLoading && (
                    <div className="px-3 py-2 text-white/70">Идет поиск...</div>
                  )}
                  {!searchLoading && searchResults.length === 0 && showDropdown && (
                    <div className="px-3 py-2 text-white/70">Ничего не найдено</div>
                  )}
                  {!searchLoading && searchResults.length > 0 && (
                    <div className="py-1">
                      {searchResults.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedUserId(u.id)
                            setQuery(`${u.first_name ?? ""} ${u.last_name ?? ""} (@${u.username || u.telegram_id})`)
                            setShowDropdown(false)
                            setSearchResults([])
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-white/10 text-white"
                        >
                          <div className="font-medium">{u.first_name ?? ""} {u.last_name ?? ""}</div>
                          <div className="text-sm text-white/70">@{u.username || u.telegram_id} • Рейтинг: {u.rating || 800}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Fallback local suggestions without '@' */}
              {!query.startsWith("@") && query && filteredUsers.length > 0 && (
                <div className="mt-2 space-y-2">
                  {filteredUsers.slice(0, 8).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(u.id)
                        setQuery(u.username || "")
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    >
                      @{u.username || u.telegram_id} — {u.first_name ?? ""} {u.last_name ?? ""}
                    </button>
                  ))}
                </div>
              )}
              {selectedUserId && (
                <div className="mt-2 text-white/80 text-sm">
                  Выбран: {(() => {
                    const user = users.find((u) => u.id === selectedUserId)
                    return user ? `${user.first_name ?? ""} ${user.last_name ?? ""} (@${user.username || user.telegram_id})` : "Неизвестный пользователь"
                  })()}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserId(null)
                      setQuery("")
                    }}
                    className="ml-2 px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    Сбросить
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-white block mb-2">Никнейм в турнире</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-white/10 text-white p-3 rounded-lg outline-none"
                placeholder="Уникальный никнейм"
              />
            </div>

            <button
              onClick={addParticipant}
              disabled={adding}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-60"
            >
              {adding ? "Добавление..." : "Добавить участника"}
            </button>

            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <button
                onClick={seedUsers}
                disabled={seeding}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold disabled:opacity-60"
                title="Добавить тестовых пользователей в базу"
              >
                {seeding ? "Добавление пользователей..." : "Добавить тестовых пользователей"}
              </button>
              {seedInfo && <span className="text-white/80 text-sm self-center">{seedInfo}</span>}
            </div>
          </div>

          {/* Список участников */}
          <div className="mt-8">
            <h2 className="text-white text-xl font-bold mb-3">Участники</h2>
            <div className="space-y-3">
              {participants.map((p) => {
                const user = users.find((u) => u.id === p.user_id)
                const isActive = p.active !== false
                return (
                  <div key={p.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold text-base truncate">{p.nickname}</span>
                          <span className={`inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 rounded text-xs ${isActive ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>
                            {isActive ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="text-white/50 text-sm mt-0.5">@{user?.username || user?.telegram_id}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {isActive ? (
                          <button
                            onClick={() => withdrawPlayer(p.id)}
                            className="px-3 py-1.5 rounded bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-medium"
                          >
                            Исключить
                          </button>
                        ) : (
                          <button
                            onClick={() => restorePlayer(p.id)}
                            className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-sm font-medium"
                          >
                            Вернуть
                          </button>
                        )}
                        <button
                          onClick={() => deletePlayer(p.id, p.nickname)}
                          className="px-3 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white text-sm font-medium"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {participants.length === 0 && !loading && (
                <div className="bg-white/5 rounded-lg p-4 text-white/70">
                  Пока нет участников
                </div>
              )}
            </div>
            {/* Панель действий после ввода участников */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                onClick={backToCreate}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold"
              >
                Назад к созданию турнира
              </button>
              <button
                onClick={startTour}
                disabled={
                  starting ||
                  participants.length < 2 ||
                  (tournamentMeta?.archived === 1) ||
                  ((tournamentMeta?.rounds ?? 0) > 0 && tours.length >= (tournamentMeta?.rounds ?? 0))
                }
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-60"
                title={participants.length < 2 ? "Добавьте минимум двух участников" : "Начать тур"}
              >
                {starting ? "Запуск тура..." : "Начать тур"}
              </button>
              {tournamentMeta?.archived === 1 && (
                <div className="text-white/70">Турнир завершён</div>
              )}
              {(tournamentMeta?.rounds ?? 0) > 0 && tours.length >= (tournamentMeta?.rounds ?? 0) && (
                <div className="text-white/70">Достигнут лимит туров ({tournamentMeta?.rounds ?? 0})</div>
              )}
            </div>

            {/* Текущие туры и переход */}
            <div className="mt-6 space-y-3">
              <h3 className="text-white text-lg font-semibold">Туры</h3>
              {tours.length === 0 ? (
                <div className="text-white/70">Пока туров нет</div>
              ) : (
                <div className="space-y-2">
                  {/* Инфо-плашка и кнопки: адаптивный лэйаут */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-white">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-bold">Всего туров: {tours.length}</div>
                        <div className="text-white/70 text-sm">Последний: №{tours[tours.length - 1].number} ({tours[tours.length - 1].status})</div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => router.push(`/admin/tournaments/${tournamentId}/tours/${tours[tours.length - 1].id}`)}
                          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                        >
                          Открыть последний тур
                        </button>
                        <button
                          onClick={deleteAllTours}
                          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
                        >
                          Удалить все туры
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Список ссылок на все туры: мобильные карточки */}
                  <div className="md:hidden space-y-2">
                    {tours.map((t) => (
                      <div key={t.id} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white">
                        <div className="flex items-center justify-between">
                          <div className="font-bold">Тур №{t.number}</div>
                          <span className="text-xs px-2 py-1 rounded bg-white/10 border border-white/20">{t.status}</span>
                        </div>
                        <div className="mt-1 text-white/70 text-sm">Создан: {new Date(t.created_at).toLocaleString()}</div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => router.push(`/admin/tournaments/${tournamentId}/tours/${t.id}`)}
                            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white"
                          >
                            Открыть
                          </button>
                          <button
                            onClick={() => deleteTour(t.id)}
                            className="px-3 py-2 rounded bg-red-600 hover:bg-red-500 text-white"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Список ссылок на все туры: таблица для md+ */}
                  <div className="hidden md:block bg-white/5 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-white">
                        <thead>
                          <tr className="bg-white/10">
                            <th className="text-left p-3">№</th>
                            <th className="text-left p-3">Статус</th>
                            <th className="text-left p-3">Создан</th>
                            <th className="text-left p-3">Действие</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tours.map((t) => (
                            <tr key={t.id} className="border-t border-white/10">
                              <td className="p-3">{t.number}</td>
                              <td className="p-3">{t.status}</td>
                              <td className="p-3 whitespace-nowrap">{new Date(t.created_at).toLocaleString()}</td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => router.push(`/admin/tournaments/${tournamentId}/tours/${t.id}`)}
                                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
                                  >
                                    Открыть
                                  </button>
                                  <button
                                    onClick={() => deleteTour(t.id)}
                                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white"
                                  >
                                    Удалить
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChessBackground>
  )
}