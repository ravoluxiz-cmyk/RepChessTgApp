"use client"

import { useEffect, useState } from "react"
import ChessBackground from "@/components/ChessBackground"
import { BackButton } from "@/components/ui/back-button"
import { TournamentCard, Tournament } from "@/components/tournaments/tournament-card"
import { motion } from "framer-motion"

const GOOGLE_CALENDAR_EMBED_URL =
  "https://calendar.google.com/calendar/embed?src=9cca0ead2265768182e4addb1fb5586c8b83426adc1099349a2b3d7a1424889e%40group.calendar.google.com&ctz=Europe%2FMoscow"

type CalendarEvent = {
  id?: string
  title: string
  description?: string | null
  location?: string | null
  start_at?: string | null
  end_at?: string | null
  event_url?: string | null
  source?: "google_calendar"
}

function calendarEventToTournament(event: CalendarEvent, index: number): Tournament {
  return {
    id: event.id ? `calendar-${event.id}` : `calendar-${index}`,
    title: event.title,
    format: "calendar",
    points_win: 1,
    points_loss: 0,
    points_draw: 0.5,
    bye_points: 0,
    rounds: 1,
    tiebreakers: "",
    team_mode: "none",
    allow_join: 0,
    archived: 0,
    start_at: event.start_at,
    end_at: event.end_at,
    location: event.location,
    event_url: event.event_url,
    description: event.description,
    source: "google_calendar",
  }
}

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

        const [tournamentsResponse, calendarResponse] = await Promise.all([
          fetch("/api/tournaments"),
          fetch("/api/calendar/events"),
        ])

        if (!tournamentsResponse.ok) {
          throw new Error("Не удалось загрузить турниры")
        }

        const tournamentsData = await tournamentsResponse.json()
        const calendarData = calendarResponse.ok ? await calendarResponse.json() : { events: [] }

        const activeTournaments = Array.isArray(tournamentsData)
          ? tournamentsData.filter((tournament: Tournament) => Number(tournament.archived ?? 0) === 0)
          : []
        const calendarTournaments = Array.isArray(calendarData.events)
          ? calendarData.events.map(calendarEventToTournament)
          : []
        const mergedTournaments = [...activeTournaments, ...calendarTournaments].sort(
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {tournaments.map((tournament, index) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    index={index}
                  />
                ))}
              </div>
            )}

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10"
            >
              <h2 className="mb-4 text-2xl font-bold text-white">
                Google Calendar
              </h2>
              <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <iframe
                  src={GOOGLE_CALENDAR_EMBED_URL}
                  title="RepChess Google Calendar"
                  className="h-[640px] w-full bg-white"
                  loading="lazy"
                />
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </ChessBackground>
  )
}
