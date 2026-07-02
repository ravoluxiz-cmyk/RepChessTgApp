"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Shield, Trophy } from "lucide-react"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { normalizePlayerStatus, PLAYER_STATUSES, resolvePlayerStatus, type PlayerStatus } from "@/lib/player-status"

type AdminUser = {
  id: number
  telegram_id: number
  username?: string | null
  first_name: string
  last_name: string
  rating: number
  role?: string | null
  player_status?: string | null
  created_at?: string | null
  glicko?: {
    rating?: number | null
    rd?: number | null
    games_count?: number | null
  } | null
}

function getDisplayName(user: AdminUser) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.username || "Игрок"
}

function getInitials(user: AdminUser) {
  const name = getDisplayName(user)
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { initData, isReady } = useTelegramWebApp()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadUsers() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/users", {
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
        cache: "no-store",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось загрузить игроков")
      setUsers(Array.isArray(data.users) ? data.users : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить игроков")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isReady) return
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initData, isReady])

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return users

    return users.filter((user) => {
      const haystack = [
        getDisplayName(user),
        user.username || "",
        String(user.telegram_id),
        resolvePlayerStatus(user.player_status, user.role),
      ].join(" ").toLowerCase()
      return haystack.includes(needle)
    })
  }, [query, users])

  const stats = useMemo(() => {
    const adminStatuses = new Set(["Admin", "Boss", "Chief"])
    return {
      total: users.length,
      calibrating: users.filter((user) => Number(user.glicko?.rd ?? 350) >= 250).length,
      privileged: users.filter((user) => adminStatuses.has(resolvePlayerStatus(user.player_status, user.role))).length,
    }
  }, [users])

  async function updateStatus(userId: number, playerStatus: PlayerStatus) {
    setSavingId(userId)
    setError(null)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
        body: JSON.stringify({ user_id: userId, player_status: playerStatus }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось сохранить статус")

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, player_status: normalizePlayerStatus(data.user?.player_status) }
            : user
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить статус")
    } finally {
      setSavingId(null)
    }
  }

  async function resetRatings() {
    const confirmed = window.confirm("Сбросить всем игрокам рейтинг на 1500 и RD 350? Старые Glicko-счетчики партий будут обнулены.")
    if (!confirmed) return

    setResetting(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/rating-reset", {
        method: "POST",
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось сбросить рейтинги")
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сбросить рейтинги")
    } finally {
      setResetting(false)
    }
  }

  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => router.push("/admin")}
            className="mb-6 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Админ-меню
          </button>

          <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
            <div className="brand-bg-icons pointer-events-none absolute -right-20 -top-24 h-72 w-72 opacity-[0.08]" />
            <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <h1 className="brand-title text-4xl text-white sm:text-6xl">Игроки</h1>
                <p className="mt-3 max-w-2xl text-white/62">
                  Управление статусами игроков и быстрый контроль Glicko-калибровки.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-white px-3 py-3 text-[#151515]">
                  <div className="brand-font text-2xl">{stats.total}</div>
                  <div className="text-xs font-black uppercase opacity-60">игроков</div>
                </div>
                <div className="rounded-2xl bg-[#fff200] px-3 py-3 text-[#151515]">
                  <div className="brand-font text-2xl">{stats.calibrating}</div>
                  <div className="text-xs font-black uppercase opacity-70">калибр.</div>
                </div>
                <div className="rounded-2xl bg-[#20d66b] px-3 py-3 text-[#151515]">
                  <div className="brand-font text-2xl">{stats.privileged}</div>
                  <div className="text-xs font-black uppercase opacity-70">доступ</div>
                </div>
              </div>
            </div>
          </section>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-10 pr-4 text-white outline-none transition focus:border-white/40"
                placeholder="Поиск по имени, username, Telegram ID"
              />
            </label>
            <button
              onClick={resetRatings}
              className="rounded-2xl border border-amber-300/30 bg-amber-400/15 px-4 py-3 font-black text-amber-50 transition hover:bg-amber-400/25 disabled:opacity-60"
              disabled={loading || resetting}
            >
              {resetting ? "Сбрасываю..." : "Сброс 1500 / RD350"}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/15 p-4 text-red-100">
              {error}
            </div>
          )}

          {loading && <div className="text-white/70">Загрузка игроков...</div>}

          {!loading && filteredUsers.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
              Игроки не найдены
            </div>
          )}

          <div className="grid gap-3">
            {filteredUsers.map((user) => {
              const playerStatus = resolvePlayerStatus(user.player_status, user.role)
              const glickoRating = Math.round(Number(user.glicko?.rating ?? user.rating ?? 1500))
              const rd = Math.round(Number(user.glicko?.rd ?? 350))
              const games = Number(user.glicko?.games_count ?? 0)

              return (
                <article
                  key={user.id}
                  className="brand-panel-dark rounded-[18px] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#151515] shadow-[0_16px_42px_rgba(0,0,0,0.2)]">
                        <span className="brand-font text-lg">{getInitials(user)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xl font-black">{getDisplayName(user)}</div>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-white/58">
                          {user.username && <span>@{user.username}</span>}
                          <span>TG {user.telegram_id}</span>
                          <span>ID {user.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[140px_140px_220px] sm:items-center">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2">
                        <div className="flex items-center gap-1 text-xs font-black uppercase text-white/45">
                          <Trophy className="h-3.5 w-3.5" />
                          Glicko
                        </div>
                        <div className="mt-1 text-lg font-black">{glickoRating}</div>
                        <div className="text-xs text-white/45">RD {rd} • {games} игр</div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2">
                        <div className="flex items-center gap-1 text-xs font-black uppercase text-white/45">
                          <Shield className="h-3.5 w-3.5" />
                          Статус
                        </div>
                        <div className="mt-1 text-lg font-black">{playerStatus}</div>
                      </div>

                      <label className="block">
                        <span className="sr-only">Статус игрока</span>
                        <select
                          value={playerStatus}
                          onChange={(event) => updateStatus(user.id, event.target.value as PlayerStatus)}
                          disabled={savingId === user.id}
                          className="w-full rounded-2xl border border-white/10 bg-black/35 px-3 py-3 font-bold text-white outline-none transition focus:border-white/40 disabled:opacity-60"
                        >
                          {PLAYER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </main>
    </ChessBackground>
  )
}
