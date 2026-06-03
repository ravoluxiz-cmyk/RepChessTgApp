"use client"

import { CalendarDays, ListChecks, Scale, Trophy, Users } from "lucide-react"
import { motion } from "framer-motion"

export interface Tournament {
  id: number
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

export function TournamentCard({ tournament, index }: TournamentCardProps) {
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
      className="relative backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
    >
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-2xl font-bold text-white">{tournament.title}</h3>
        {Number(tournament.allow_join) === 1 && (
          <span className="shrink-0 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-100">
            Запись открыта
          </span>
        )}
      </div>

      {/* Info Grid */}
      <div className="space-y-3">
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

        <div className="flex items-center gap-3 text-white/70">
          <CalendarDays className="w-5 h-5 text-cyan-400" />
          <span className="text-base">{formatCreatedAt(tournament.created_at)}</span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/60">
        Тай-брейки: {tournament.tiebreakers || "по регламенту турнира"}
      </p>

      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  )
}
