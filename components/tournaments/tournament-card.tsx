"use client"

import { useEffect, useState } from "react"
import { CalendarDays, CheckCircle2, ExternalLink, ListChecks, MapPin, Scale, Trophy, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { getProfileAuthHeaders } from "@/lib/web-user"

export interface Tournament {
  id: number | string
  title: string
  format: string
  points_win: number
  points_loss: number
  points_draw: number
  bye_points: number
  rounds: number
  tiebreakers: string
  team_mode: string
  allow_join?: number
  archived?: number
  created_at?: string
  start_at?: string | null
  end_at?: string | null
  location?: string | null
  event_url?: string | null
  address?: string | null
  yandex_maps_url?: string | null
  poster_url?: string | null
  registration_count?: number
  description?: string | null
  source?: "manual" | "google_calendar" | "supabase"
}

interface TournamentCardProps {
  tournament: Tournament
  index: number
}

const formatLabels: Record<string, string> = {
  swiss: "Швейцарская",
  swiss_bbp_dutch: "Швейцарская BBP Dutch",
  round_robin: "Круговая",
  knockout: "На выбывание",
  calendar: "Событие календаря",
}

const teamModeLabels: Record<string, string> = {
  none: "Личный",
  teams: "Командный",
}

function formatCreatedAt(value?: string) {
  if (!value) return "Дата уточняется"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Дата уточняется"

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatSchedule(value?: string | null) {
  if (!value) return "Дата уточняется"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Дата уточняется"

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: value.includes("T") ? "2-digit" : undefined,
    minute: value.includes("T") ? "2-digit" : undefined,
  }).format(date)
}

export function TournamentCard({ tournament, index }: TournamentCardProps) {
  const { initData, isReady } = useTelegramWebApp()
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [registrationNote, setRegistrationNote] = useState<string | null>(null)
  const [registrationError, setRegistrationError] = useState<string | null>(null)

  useEffect(() => {
    if (!isReady || Number(tournament.allow_join) !== 1 || typeof tournament.id !== "number") return

    let cancelled = false

    async function fetchRegistrationStatus() {
      try {
        const response = await fetch(`/api/tournaments/${tournament.id}/register`, {
          headers: getProfileAuthHeaders(initData),
        })
        if (!response.ok) return

        const data = await response.json().catch(() => ({}))
        if (cancelled || !data.registered) return

        setRegistered(true)
        setRegistrationNote(data.registration_notice || "Вы уже зарегистрированы. Чтобы отменить регистрацию, напишите в чат «-».")
      } catch {
        // Status check is best-effort; registration itself still handles errors.
      }
    }

    fetchRegistrationStatus()

    return () => {
      cancelled = true
    }
  }, [initData, isReady, tournament.allow_join, tournament.id])

  async function handleRegister() {
    if (typeof tournament.id !== "number") return

    setRegistering(true)
    setRegistrationError(null)
    setRegistrationNote(null)
    try {
      const response = await fetch(`/api/tournaments/${tournament.id}/register`, {
        method: "POST",
        headers: getProfileAuthHeaders(initData),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "Не удалось зарегистрироваться")
      }
      setRegistered(true)
      setRegistrationNote(data.registration_notice || "Вы уже зарегистрированы. Чтобы отменить регистрацию, напишите в чат «-».")
      if (data.telegram_warning && !data.already_registered) {
        setRegistrationError(data.telegram_warning)
      }
    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : "Неизвестная ошибка")
    } finally {
      setRegistering(false)
    }
  }

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      },
    },
  }

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="brand-panel relative overflow-hidden rounded-lg transition-all duration-300 hover:border-white/30"
    >
      <div className="grid md:grid-cols-[minmax(220px,320px)_1fr]">
        <div className="relative min-h-56 bg-black/70 md:min-h-full">
          {tournament.poster_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={tournament.poster_url}
              alt={tournament.title}
              className="h-full min-h-56 w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-56 flex-col items-center justify-center gap-3 p-6 text-white/45">
              <CalendarDays className="h-12 w-12 text-white/55" />
              <span className="brand-font text-sm uppercase text-white/55">Афиша скоро</span>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="brand-title min-w-0 text-2xl text-white sm:text-3xl">{tournament.title}</h3>
            <div className="flex flex-wrap gap-2">
              {Number(tournament.allow_join) === 1 && (
                <span className="shrink-0 rounded-lg border border-green-400/35 bg-green-500/15 px-2.5 py-1 text-xs font-bold uppercase text-green-100">
                  Запись открыта
                </span>
              )}
              {tournament.source === "google_calendar" && (
                <span className="shrink-0 rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                  Google Calendar
                </span>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-white/70">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <span className="text-base">{formatLabels[tournament.format] || tournament.format}</span>
            </div>

            <div className="flex items-center gap-3 text-white/70">
              <ListChecks className="w-5 h-5 text-amber-400" />
              <span className="text-base">{tournament.rounds} раундов</span>
            </div>

            <div className="flex items-center gap-3 text-white/70">
              <Scale className="w-5 h-5 text-blue-400" />
              <span className="text-base">
                {tournament.points_win}/{tournament.points_draw}/{tournament.points_loss}, bye {tournament.bye_points}
              </span>
            </div>

            <div className="flex items-center gap-3 text-white/70">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-base">{teamModeLabels[tournament.team_mode] || tournament.team_mode}</span>
            </div>

            <div className="flex items-center gap-3 text-white/70 sm:col-span-2">
              <CalendarDays className="w-5 h-5 text-cyan-400" />
              <span className="text-base">
                {tournament.start_at ? formatSchedule(tournament.start_at) : formatCreatedAt(tournament.created_at)}
              </span>
            </div>

            {tournament.location && (
              <div className="flex items-center gap-3 text-white/70">
                <MapPin className="w-5 h-5 text-rose-300" />
                <span className="text-base">{tournament.location}</span>
              </div>
            )}

            {tournament.address && (
              <div className="flex items-center gap-3 text-white/70">
                <MapPin className="w-5 h-5 text-orange-300" />
                <span className="text-base">{tournament.address}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/60">
            {tournament.description || `Тай-брейки: ${tournament.tiebreakers || "по регламенту турнира"}`}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {Number(tournament.allow_join) === 1 && typeof tournament.id === "number" && (
              <button
                type="button"
                onClick={handleRegister}
                disabled={registering || registered}
                className="brand-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm disabled:cursor-default disabled:opacity-70"
              >
                <CheckCircle2 className="h-4 w-4" />
                {registered ? "Вы зарегистрированы" : registering ? "Регистрация..." : "Зарегистрироваться"}
              </button>
            )}

            {tournament.yandex_maps_url && (
              <a
                href={tournament.yandex_maps_url}
                target="_blank"
                rel="noreferrer"
                className="brand-button-dark inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              >
                <MapPin className="h-4 w-4" />
                Яндекс Карты
              </a>
            )}

            {tournament.event_url && (
              <a
                href={tournament.event_url}
                target="_blank"
                rel="noreferrer"
                className="brand-button-dark inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Открыть событие
              </a>
            )}
          </div>

          {registrationError && (
            <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 text-sm text-red-100">
              {registrationError}
            </div>
          )}

          {registrationNote && (
            <div className="mt-3 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-50">
              {registrationNote}
            </div>
          )}
        </div>
      </div>

      {/* Gradient border effect */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,#ff3131,#2563ff,#ffd600,#20d66b)] opacity-80" />
    </motion.div>
  )
}
