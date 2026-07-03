"use client"

import { useEffect, useState } from "react"
import { CalendarDays, CheckCircle2, ExternalLink, ListChecks, MapPin, Scale, Trophy, Users } from "lucide-react"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { getProfileAuthHeaders } from "@/lib/web-user"
import { TELEGRAM_URL, formatRegistrationCount, formatTournamentFormat } from "@/lib/tournament-display"
import type { Tournament } from "@/lib/db"

interface TournamentCardProps {
  tournament: Tournament
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

function formatDateSticker(value?: string | null) {
  if (!value) {
    return { day: "??", month: "Дата" }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { day: "??", month: "Дата" }
  }

  return {
    day: new Intl.DateTimeFormat("ru-RU", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(date).replace(".", ""),
  }
}

export function TournamentCard({ tournament }: TournamentCardProps) {
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

  const dateSticker = formatDateSticker(tournament.start_at || tournament.created_at)
  const scheduleLabel = tournament.start_at ? formatSchedule(tournament.start_at) : formatCreatedAt(tournament.created_at)

  return (
    <article className="brand-panel relative overflow-hidden rounded-[18px] transition-transform duration-150 hover:-translate-y-0.5">
      <div className="grid md:grid-cols-[minmax(220px,320px)_1fr]">
        <div className="relative min-h-56 border-b border-[#151515]/10 bg-[#151515] md:min-h-full md:border-b-0 md:border-r">
          <div className="absolute left-4 top-4 z-10 rounded-2xl bg-white px-3 py-2 text-center text-[#151515] shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
            <div className="brand-font text-2xl leading-none">{dateSticker.day}</div>
            <div className="mt-1 text-xs font-black uppercase">{dateSticker.month}</div>
          </div>
          {tournament.poster_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={tournament.poster_url}
              alt={tournament.title}
              className="h-full min-h-56 w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="relative flex h-full min-h-56 flex-col items-center justify-center gap-3 overflow-hidden p-6 text-white/55">
              <div className="brand-bg-illustration absolute inset-6 opacity-[0.12]" />
              <CalendarDays className="h-12 w-12 text-white/70" />
              <span className="brand-font text-sm uppercase">Афиша скоро</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap gap-2 bg-gradient-to-t from-black/80 to-transparent p-4 pt-16">
            {Number(tournament.allow_join) === 1 && (
              <span className="rounded-full bg-[#20d66b] px-3 py-1 text-xs font-black uppercase text-[#151515]">
                Запись
              </span>
            )}
            {typeof tournament.registration_count === "number" && tournament.registration_count > 0 && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-[#151515]">
                {formatRegistrationCount(tournament.registration_count)}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="brand-title min-w-0 text-2xl text-[#151515] sm:text-3xl">{tournament.title}</h3>
            <div className="flex flex-wrap gap-2">
              {Number(tournament.allow_join) === 1 && (
                <span className="shrink-0 rounded-full border border-[#151515]/15 bg-[#20d66b] px-2.5 py-1 text-xs font-black uppercase text-[#151515]">
                  Запись открыта
                </span>
              )}
              {tournament.source === "google_calendar" && (
                <span className="shrink-0 rounded-full border border-[#151515]/15 bg-white px-2.5 py-1 text-xs font-black uppercase text-[#151515]">
                  Google Calendar
                </span>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-[#151515]/75">
              <Trophy className="w-5 h-5 text-[#151515]" />
              <span className="text-base">{formatTournamentFormat(tournament)}</span>
            </div>

            <div className="flex items-center gap-3 text-[#151515]/75">
              <ListChecks className="w-5 h-5 text-[#151515]" />
              <span className="text-base">{tournament.rounds} раундов</span>
            </div>

            <div className="flex items-center gap-3 text-[#151515]/75">
              <Scale className="w-5 h-5 text-[#151515]" />
              <span className="text-base">
                {tournament.points_win}/{tournament.points_draw}/{tournament.points_loss}, bye {tournament.bye_points}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[#151515]/75">
              <Users className="w-5 h-5 text-[#151515]" />
              <span className="text-base">{teamModeLabels[tournament.team_mode] || tournament.team_mode}</span>
            </div>

            <div className="flex items-center gap-3 text-[#151515]/75 sm:col-span-2">
              <CalendarDays className="w-5 h-5 text-[#151515]" />
              <span className="text-base">
                {scheduleLabel}
              </span>
            </div>

            {tournament.location && (
              <div className="flex items-center gap-3 text-[#151515]/75">
                <MapPin className="w-5 h-5 text-[#151515]" />
                <span className="text-base">{tournament.location}</span>
              </div>
            )}

            {tournament.address && (
              <div className="flex items-center gap-3 text-[#151515]/75">
                <MapPin className="w-5 h-5 text-[#151515]" />
                <span className="text-base">{tournament.address}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="mt-4 line-clamp-3 text-sm font-medium leading-relaxed text-[#151515]/65">
            {tournament.description || `Тай-брейки: ${tournament.tiebreakers || "по регламенту турнира"}`}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {Number(tournament.allow_join) === 1 && tournament.event_url && (
              <a
                href={tournament.event_url}
                target="_blank"
                rel="noreferrer"
                className="brand-button inline-flex items-center gap-2 px-3 py-2 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Открыть запись в Telegram
              </a>
            )}

            {Number(tournament.allow_join) === 1 && !tournament.event_url && typeof tournament.id === "number" && (
              <button
                type="button"
                onClick={handleRegister}
                disabled={registering || registered}
                className="brand-button inline-flex items-center gap-2 px-3 py-2 text-sm disabled:cursor-default disabled:opacity-70"
              >
                <CheckCircle2 className="h-4 w-4" />
                {registered ? "Вы зарегистрированы" : registering ? "Регистрация..." : "Зарегистрироваться"}
              </button>
            )}

            {Number(tournament.allow_join) !== 1 && !tournament.event_url && (
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="brand-button inline-flex items-center gap-2 px-3 py-2 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Запись через Telegram Rep Chess KRD
              </a>
            )}

            {tournament.yandex_maps_url && (
              <a
                href={tournament.yandex_maps_url}
                target="_blank"
                rel="noreferrer"
                className="brand-button-dark inline-flex items-center gap-2 px-3 py-2 text-sm"
              >
                <MapPin className="h-4 w-4" />
                Яндекс Карты
              </a>
            )}

            {tournament.event_url && Number(tournament.allow_join) !== 1 && (
              <a
                href={tournament.event_url}
                target="_blank"
                rel="noreferrer"
                className="brand-button-dark inline-flex items-center gap-2 px-3 py-2 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Открыть событие
              </a>
            )}
          </div>

          {registrationError && (
            <div className="mt-3 rounded-xl border border-[#151515]/15 bg-[#ff3131] px-3 py-2 text-sm font-bold text-white">
              {registrationError}
            </div>
          )}

          {registrationNote && (
            <div className="mt-3 rounded-xl border border-[#151515]/15 bg-white px-3 py-2 text-sm font-bold text-[#151515]">
              {registrationNote}
            </div>
          )}
        </div>
      </div>

      <div className="brand-accent-line pointer-events-none absolute inset-x-0 bottom-0" />
    </article>
  )
}
