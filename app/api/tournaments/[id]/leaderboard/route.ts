import { NextRequest, NextResponse } from "next/server"
import { listLeaderboard, listTournamentParticipants } from "@/lib/db"
import { getSortedStandings, type PlayerStanding } from "@/lib/tiebreakers"
import { supabaseAdmin } from "@/lib/supabase"

/** Short labels for tiebreaker keys */
const TB_LABELS: Record<string, string> = {
  head_to_head: 'Личн',
  buchholz: 'Бухг',
  buchholz_cut1: 'Бухг1',
  buchholz_cut2: 'Бухг2',
  median_buchholz: 'МедБ',
  sonneborn_berger: 'SB',
  number_of_wins: 'Побед',
  games_as_black: 'Чёрн',
  progressive: 'Кум',
  wins_with_black: 'ПобЧ',
}

/** Map tiebreaker key → field in PlayerStanding.tiebreakers */
const TB_FIELD: Record<string, keyof NonNullable<PlayerStanding['tiebreakers']>> = {
  head_to_head: 'headToHead',
  buchholz: 'buchholz',
  buchholz_cut1: 'buchholzCut1',
  buchholz_cut2: 'buchholzCut2',
  median_buchholz: 'medianBuchholz',
  sonneborn_berger: 'sonnebornBerger',
  number_of_wins: 'numberOfWins',
  games_as_black: 'gamesAsBlack',
  progressive: 'progressive',
  wins_with_black: 'winsWithBlack',
}

function buildRoundLabel(
  result: string,
  color: string,
  opponentRank: number | null
): string {
  if (result === 'bye') return 'bye'
  const prefix = (result === 'win' || result === 'forfeit_win')
    ? '+'
    : (result === 'loss' || result === 'forfeit_loss')
      ? '-'
      : '='
  const colorChar = color === 'white' ? 'W' : color === 'black' ? 'B' : ''
  return `${prefix}${colorChar}${opponentRank ?? '?'}`
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const tournamentId = Number(id)
    if (!Number.isFinite(tournamentId)) {
      return NextResponse.json({ error: "Некорректный ID турнира" }, { status: 400 })
    }

    // Try snapshot first
    const leaderboard = await listLeaderboard(tournamentId)
    if (Array.isArray(leaderboard) && leaderboard.length > 0) {
      return NextResponse.json(leaderboard)
    }

    // Dynamic computation with tiebreakers
    const sorted = await getSortedStandings(tournamentId)

    // Build participantId → rank mapping
    const rankMap = new Map<number, number>()
    sorted.forEach((s, idx) => rankMap.set(s.participantId, idx + 1))

    // Get nicknames
    const participants = await listTournamentParticipants(tournamentId)
    const nickMap = new Map(participants.map(p => [p.id!, p.nickname]))

    // Get tournament tiebreaker config
    const { data: tournament } = await supabaseAdmin
      .from('tournaments')
      .select('tiebreakers')
      .eq('id', tournamentId)
      .single()

    const tiebreakerString = tournament?.tiebreakers || 'buchholz,buchholz_cut1'
    const tiebreakerKeys = tiebreakerString
      .split(',')
      .map((t: string) => t.trim().toLowerCase())
      .filter(Boolean)

    // Determine total rounds
    const totalRounds = sorted.reduce((max, s) => Math.max(max, s.roundNumbers.length), 0)

    // Build response rows
    const rows = sorted.map((s, idx) => {
      // Build round-by-round labels
      const rounds: { label: string }[] = []
      for (let i = 0; i < totalRounds; i++) {
        if (i < s.results.length) {
          const opponentId = s.opponents[i]
          const opponentRank = (opponentId && opponentId !== 0) ? (rankMap.get(opponentId) ?? null) : null
          rounds.push({
            label: buildRoundLabel(s.results[i], s.colors[i], opponentRank),
          })
        } else {
          rounds.push({ label: '' })
        }
      }

      // Build tiebreaker values
      const tbValues: Record<string, number | undefined> = {}
      for (const key of tiebreakerKeys) {
        const field = TB_FIELD[key]
        if (field) {
          tbValues[key] = s.tiebreakers[field]
        }
      }

      return {
        participant_id: s.participantId,
        nickname: nickMap.get(s.participantId) || `#${s.participantId}`,
        points: s.score,
        rank: idx + 1,
        rounds,
        tbValues,
      }
    })

    return NextResponse.json({
      rows,
      totalRounds,
      tiebreakerKeys,
      tiebreakerLabels: Object.fromEntries(
        tiebreakerKeys.map((k: string) => [k, TB_LABELS[k] || k])
      ),
    })
  } catch (e) {
    console.error("Failed to get leaderboard:", e)
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 })
  }
}