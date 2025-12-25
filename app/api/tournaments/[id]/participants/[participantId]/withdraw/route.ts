import { NextResponse, NextRequest } from 'next/server'
import { withdrawPlayer } from '@/lib/db'

/**
 * POST /api/tournaments/[id]/participants/[participantId]/withdraw
 * Исключает участника из жеребьевки (active = false)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; participantId: string }> }
) {
  const { participantId } = await context.params
  const participantIdNum = Number(participantId)

  if (!Number.isFinite(participantIdNum)) {
    return NextResponse.json({ error: 'Invalid participantId' }, { status: 400 })
  }

  try {
    const success = await withdrawPlayer(participantIdNum)

    if (!success) {
      return NextResponse.json({ error: 'Failed to withdraw player' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Player withdrawn from tournament',
      participantId: participantIdNum
    }, { status: 200 })
  } catch (err) {
    console.error('[Withdraw] Error:', err)
    return NextResponse.json({ error: 'Failed to withdraw player' }, { status: 500 })
  }
}
