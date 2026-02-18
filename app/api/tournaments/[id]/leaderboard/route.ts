import { NextRequest, NextResponse } from "next/server"
import { listLeaderboard } from "@/lib/db"
import { getSortedStandings } from "@/lib/tiebreakers"

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const tournamentId = Number(id)
    if (!Number.isFinite(tournamentId)) {
      return NextResponse.json({ error: "Некорректный ID турнира" }, { status: 400 })
    }
    const leaderboard = await listLeaderboard(tournamentId)
    if (Array.isArray(leaderboard) && leaderboard.length > 0) {
      return NextResponse.json(leaderboard)
    }

    // Fallback: compute standings dynamically with tiebreakers
    const sorted = await getSortedStandings(tournamentId)
    const rows = sorted.map((s, idx) => ({
      participant_id: s.participantId,
      nickname: '', // will be filled below
      points: s.score,
      rank: idx + 1,
      tiebreakers: s.tiebreakers,
    }))

    // Fill nicknames from participants
    const { listTournamentParticipants } = await import("@/lib/db")
    const participants = await listTournamentParticipants(tournamentId)
    const nickMap = new Map(participants.map(p => [p.id!, p.nickname]))
    for (const row of rows) {
      row.nickname = nickMap.get(row.participant_id) || `#${row.participant_id}`
    }

    return NextResponse.json(rows)
  } catch (e) {
    console.error("Failed to get leaderboard:", e)
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 })
  }
}