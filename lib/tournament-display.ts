import type { Tournament } from "@/lib/db"

export const TELEGRAM_URL = "https://t.me/RepChessKRD"

export function getTournamentTime(tournament: Pick<Tournament, "start_at" | "created_at">) {
  const value = tournament.start_at || tournament.created_at
  if (!value) return Number.MAX_SAFE_INTEGER

  const time = new Date(value).getTime()
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time
}

export function getUpcomingTournaments(tournaments: Tournament[], limit?: number) {
  const now = Date.now()
  const visible = tournaments
    .filter((tournament) => Number(tournament.archived ?? 0) === 0)
    .filter((tournament) => getTournamentTime(tournament) >= now || Number(tournament.allow_join) === 1)
    .sort((a, b) => getTournamentTime(a) - getTournamentTime(b))

  return typeof limit === "number" ? visible.slice(0, limit) : visible
}

export function formatTournamentFormat(tournament: Pick<Tournament, "format" | "rounds">) {
  const format = String(tournament.format || "").trim().toLowerCase()
  const rounds = Number(tournament.rounds || 0)

  if (format === "swiss" || format === "swiss_bbp_dutch") {
    return rounds > 0 ? `Швейцарка, ${rounds} туров` : "Швейцарская система"
  }

  if (format === "round_robin") return "Круговая система"
  if (format === "knockout") return "На выбывание"
  if (format === "calendar") return "Клубное событие"

  return "Формат уточняется"
}

export function formatRegistrationCount(count?: number | null) {
  const value = Number(count || 0)

  if (value <= 0) return "Пока никто не записался"
  if (value === 1) return "1 участник в списке"

  const lastDigit = value % 10
  const lastTwoDigits = value % 100
  const word = lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)
    ? "участника"
    : "участников"

  return `${value} ${word} в списке`
}
