import { NextResponse, NextRequest } from 'next/server'
import {
  getTournamentById,
  listTournamentParticipants,
  listMatches,
  finalizeTournamentIfExceeded,
  type Match,
} from '@/lib/db'
import { generatePairingsWithBBP, getLastBbpReason } from '@/lib/bbp'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string; tourId: string }> }) {
  const { id, tourId } = await context.params
  const tournamentId = Number(id)
  const roundId = Number(tourId)
  if (!Number.isFinite(tournamentId) || !Number.isFinite(roundId)) {
    return NextResponse.json({ error: 'Invalid tournamentId/tourId' }, { status: 400 })
  }

  try {
    // Idempotence: if pairings already exist for this round, return them without regenerating
    const existing = await listMatches(roundId)
    if (existing && existing.length > 0) {
      console.warn('[Pairings] Matches already exist for this round; skipping generation')
      return NextResponse.json(existing, { status: 200 })
    }

    const tournament = await getTournamentById(tournamentId)
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    const participants = await listTournamentParticipants(tournamentId)
    if (participants.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 participants to generate pairings' }, { status: 400 })
    }

    let generated: Match[] | null = null

    // BBP ONLY: generate using external BBP Pairings engine
    generated = await generatePairingsWithBBP(tournamentId, roundId)

    if (!generated || generated.length === 0) {
      const reason = getLastBbpReason()
      return NextResponse.json({ error: 'BBP Pairings produced no matches. Check BBP configuration/binary.', reason }, { status: 502 })
    }

    // Always return the current round pairings after generation to keep response unified
    const matches = await listMatches(roundId)

    // Finalize tournament if exceeded rounds
    await finalizeTournamentIfExceeded(tournamentId)

    return NextResponse.json(matches, { status: 201 })
  } catch (err) {
    const reason = getLastBbpReason()
    console.error('[Pairings] generation failed:', err, 'bbpReason:', reason)
    return NextResponse.json({ error: 'Pairings generation failed', details: err instanceof Error ? err.message : String(err), bbpReason: reason }, { status: 500 })
  }
}
