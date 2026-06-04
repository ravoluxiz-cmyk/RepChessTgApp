"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import ChessBackground from "@/components/ChessBackground"
import { BackButton } from "@/components/ui/back-button"
import RatingPrediction from "@/components/rating/RatingPrediction"
import { Search, Target, UserRound } from "lucide-react"
import { motion } from "framer-motion"

type UserSearchResult = {
  id: number
  username?: string | null
  first_name: string
  last_name?: string | null
  rating?: number | null
}

type ProfilePayload = {
  user?: {
    id?: number
  }
}

function getInitialPlayerId() {
  if (typeof window === "undefined") return null

  const params = new URLSearchParams(window.location.search)
  const rawPlayer = params.get("player") || params.get("player1")
  const playerId = Number(rawPlayer)

  return Number.isFinite(playerId) && playerId > 0 ? playerId : null
}

function getInitialOpponentId() {
  if (typeof window === "undefined") return null

  const params = new URLSearchParams(window.location.search)
  const rawOpponent = params.get("opponent") || params.get("player2")
  const opponentId = Number(rawOpponent)

  return Number.isFinite(opponentId) && opponentId > 0 ? opponentId : null
}

export default function RatingPredictPage() {
  const [playerId, setPlayerId] = useState<number | null>(null)
  const [opponentId, setOpponentId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<UserSearchResult[]>([])
  const [loadingPlayer, setLoadingPlayer] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function resolvePlayer() {
      const initialPlayerId = getInitialPlayerId()
      const initialOpponentId = getInitialOpponentId()

      if (initialOpponentId) {
        setOpponentId(initialOpponentId)
      }

      if (initialPlayerId) {
        setPlayerId(initialPlayerId)
        setLoadingPlayer(false)
        return
      }

      try {
        const response = await fetch("/api/profile")
        if (!response.ok) {
          throw new Error("Откройте прогноз из профиля или войдите в веб-профиль")
        }

        const data: ProfilePayload = await response.json()
        const profileUserId = Number(data.user?.id)

        if (!Number.isFinite(profileUserId) || profileUserId <= 0) {
          throw new Error("Не удалось определить игрока для прогноза")
        }

        setPlayerId(profileUserId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось открыть прогноз")
      } finally {
        setLoadingPlayer(false)
      }
    }

    resolvePlayer()
  }, [])

  useEffect(() => {
    if (search.trim().length < 2) {
      setUsers([])
      return
    }

    const controller = new AbortController()

    async function searchUsers() {
      try {
        setSearching(true)
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(search.trim())}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("Не удалось найти игроков")
        }

        const data = await response.json()
        setUsers(Array.isArray(data.users) ? data.users : [])
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        setUsers([])
      } finally {
        setSearching(false)
      }
    }

    const timeoutId = window.setTimeout(searchUsers, 250)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [search])

  const effectiveOpponentId = useMemo(() => {
    if (!playerId || !opponentId || playerId === opponentId) return undefined
    return opponentId
  }, [opponentId, playerId])

  const selectOpponent = useCallback((user: UserSearchResult) => {
    setOpponentId(user.id)
    setSearch(`${user.first_name} ${user.last_name || ""}`.trim())
    setUsers([])
  }, [])

  return (
    <ChessBackground badge="" title1="" title2="" description="">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="min-h-screen py-12 flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div className="flex justify-start">
              <BackButton />
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-lg border border-blue-400/30 bg-blue-500/15 p-3 text-blue-100">
                  <Target className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 uppercase tracking-tight">
                Прогноз
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Оценка вероятностей и изменения рейтинга перед партией
              </p>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur-md"
            >
              <label htmlFor="opponent-search" className="mb-3 block text-sm font-semibold text-white">
                Соперник
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  id="opponent-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Имя или username"
                  className="w-full rounded-lg border border-white/15 bg-white/10 py-3 pl-10 pr-3 text-white placeholder:text-white/40 outline-none transition focus:border-blue-300/60"
                />
              </div>

              <div className="mt-4 space-y-2">
                {searching && (
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/60">
                    Поиск...
                  </div>
                )}

                {!searching && users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectOpponent(user)}
                    className="flex w-full items-center gap-3 rounded-lg bg-white/5 px-3 py-3 text-left text-white transition hover:bg-white/10"
                  >
                    <UserRound className="h-5 w-5 text-white/50" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {user.first_name} {user.last_name || ""}
                      </span>
                      <span className="block truncate text-xs text-white/50">
                        {user.username ? `@${user.username}` : `ID ${user.id}`}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpponentId(null)
                  setSearch("")
                  setUsers([])
                }}
                className="mt-5 w-full rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Прогноз без выбранного соперника
              </button>
            </motion.aside>

            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {loadingPlayer && (
                <div className="rounded-lg border border-white/10 bg-white/10 p-6 text-white/60 backdrop-blur-md">
                  Загрузка прогноза...
                </div>
              )}

              {!loadingPlayer && error && (
                <div className="rounded-lg border border-red-400/30 bg-red-500/15 p-6 text-red-100 backdrop-blur-md">
                  {error}
                </div>
              )}

              {!loadingPlayer && !error && playerId && (
                <RatingPrediction
                  player1Id={playerId}
                  player2Id={effectiveOpponentId}
                  theme="dark"
                />
              )}
            </motion.main>
          </div>
        </div>
      </div>
    </ChessBackground>
  )
}
