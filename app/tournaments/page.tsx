"use client"

import { useEffect, useMemo, useState } from "react"
import ChessBackground from "@/components/ChessBackground"
import { BackButton } from "@/components/ui/back-button"
import { TournamentCard, Tournament } from "@/components/tournaments/tournament-card"

type TournamentFilter = "all" | "open" | "upcoming"

function getTournamentTime(tournament: Tournament) {
  const value = tournament.start_at || tournament.created_at
  if (!value) return Number.MAX_SAFE_INTEGER

  const time = new Date(value).getTime()
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<TournamentFilter>("all")

  useEffect(() => {
    async function fetchTournaments() {
      try {
        setLoading(true)
        setError(null)

        const tournamentsResponse = await fetch("/api/tournaments", { cache: "no-store" })

        if (!tournamentsResponse.ok) {
          throw new Error("Не удалось загрузить турниры")
        }

        const tournamentsData = await tournamentsResponse.json()

        const activeTournaments = Array.isArray(tournamentsData)
          ? tournamentsData.filter((tournament: Tournament) => Number(tournament.archived ?? 0) === 0)
          : []
        const mergedTournaments = activeTournaments.sort(
          (a, b) => getTournamentTime(a) - getTournamentTime(b)
        )

        setTournaments(mergedTournaments)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка")
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  const visibleTournaments = useMemo(() => {
    if (filter === "open") {
      return tournaments.filter((tournament) => Number(tournament.allow_join) === 1)
    }

    if (filter === "upcoming") {
      const now = Date.now()
      return tournaments.filter((tournament) => getTournamentTime(tournament) >= now)
    }

    return tournaments
  }, [filter, tournaments])

  const tournamentStats = useMemo(() => {
    const now = Date.now()

    return {
      total: tournaments.length,
      open: tournaments.filter((tournament) => Number(tournament.allow_join) === 1).length,
      upcoming: tournaments.filter((tournament) => getTournamentTime(tournament) >= now).length,
    }
  }, [tournaments])

  const filters: Array<{ value: TournamentFilter; label: string; count: number }> = [
    { value: "all", label: "Все", count: tournamentStats.total },
    { value: "open", label: "Запись открыта", count: tournamentStats.open },
    { value: "upcoming", label: "Ближайшие", count: tournamentStats.upcoming },
  ]

  return (
    <ChessBackground badge="" title1="" title2="" description="">
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
        <div className="min-h-screen py-12 flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-start">
              <BackButton />
            </div>

            <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.06] p-5 text-center shadow-[0_14px_44px_rgba(0,0,0,0.24)] sm:p-8 md:backdrop-blur-sm">
              <div className="brand-bg-icons pointer-events-none absolute -right-20 -top-20 h-72 w-72 opacity-[0.08]" />
              <div className="brand-sticker pointer-events-none absolute left-5 top-5 hidden h-8 w-20 rotate-[-7deg] bg-[#1357ff] sm:block" />
              <h1 className="brand-title text-4xl text-white sm:text-6xl md:text-7xl">
                Расписание турниров
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-white/62 sm:text-lg">
                Предстоящие шахматные турниры и события
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {filters.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFilter(item.value)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      filter === item.value
                        ? "border-white bg-white text-[#151515]"
                        : "border-white/12 bg-white/[0.07] text-white hover:bg-white/[0.12]"
                    }`}
                  >
                    <div className="brand-font text-2xl">{item.count}</div>
                    <div className="mt-1 text-sm font-bold uppercase opacity-70">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-white/60 text-lg">Загрузка турниров...</div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-20">
                <div className="text-red-400 text-lg">{error}</div>
              </div>
            )}

            {!loading && !error && visibleTournaments.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-white/60 text-lg">Нет турниров в этом фильтре</div>
              </div>
            )}

            {!loading && !error && visibleTournaments.length > 0 && (
              <div className="space-y-5">
                {visibleTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ChessBackground>
  )
}
