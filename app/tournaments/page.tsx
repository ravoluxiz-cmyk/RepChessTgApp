"use client"

import { useEffect, useState } from "react"
import ChessBackground from "@/components/ChessBackground"
import { BackButton } from "@/components/ui/back-button"
import { TournamentCard, Tournament } from "@/components/tournaments/tournament-card"
import { motion } from "framer-motion"

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

  useEffect(() => {
    async function fetchTournaments() {
      try {
        setLoading(true)
        setError(null)

        const tournamentsResponse = await fetch("/api/tournaments")

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

  return (
    <ChessBackground badge="" title1="" title2="" description="">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="min-h-screen py-12 flex flex-col gap-8">
          {/* Header */}
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
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 uppercase tracking-tight">
                Расписание турниров
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Предстоящие шахматные турниры и события
              </p>
            </div>
          </motion.div>

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

            {!loading && !error && tournaments.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-white/60 text-lg">Нет предстоящих турниров</div>
              </div>
            )}

            {!loading && !error && tournaments.length > 0 && (
              <div className="space-y-5">
                {tournaments.map((tournament, index) => (
                  <TournamentCard key={tournament.id} tournament={tournament} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ChessBackground>
  )
}
