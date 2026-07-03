"use client"

import { useMemo, useState } from "react"
import { BackButton } from "@/components/ui/back-button"
import { TournamentCard } from "@/components/tournaments/tournament-card"
import type { Tournament } from "@/lib/db"
import { TELEGRAM_URL, getTournamentTime } from "@/lib/tournament-display"

type TournamentFilter = "all" | "open" | "upcoming"

type FilterOption = {
  value: TournamentFilter
  label: string
  count: number
}

function formatFilterLabel(item: FilterOption) {
  return item.count > 0 ? `${item.label} ${item.count}` : item.label
}

export function TournamentsPageClient({ tournaments }: { tournaments: Tournament[] }) {
  const [filter, setFilter] = useState<TournamentFilter>("all")

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

  const filters: FilterOption[] = useMemo(() => {
    const now = Date.now()
    return [
      { value: "all", label: "Все", count: tournaments.length },
      { value: "open", label: "Запись открыта", count: tournaments.filter((tournament) => Number(tournament.allow_join) === 1).length },
      { value: "upcoming", label: "Ближайшие", count: tournaments.filter((tournament) => getTournamentTime(tournament) >= now).length },
    ]
  }, [tournaments])

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
      <div className="min-h-screen py-12 flex flex-col gap-8">
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
              Ближайшие шахматные турниры Rep Chess KRD в Краснодаре.
            </p>

            {tournaments.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-black uppercase transition ${
                      filter === item.value
                        ? "border-white bg-white text-[#151515]"
                        : "border-white/12 bg-white/[0.07] text-white hover:bg-white/[0.12]"
                    }`}
                  >
                    {formatFilterLabel(item)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          {visibleTournaments.length > 0 ? (
            <div className="space-y-5">
              {visibleTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-6 text-center text-white">
              <h2 className="brand-font text-2xl">Пока ближайших турниров нет</h2>
              <p className="mx-auto mt-3 max-w-xl text-white/62">
                Самые быстрые анонсы появляются в Telegram Rep Chess KRD.
              </p>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black uppercase text-[#151515]"
              >
                Открыть Telegram
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
