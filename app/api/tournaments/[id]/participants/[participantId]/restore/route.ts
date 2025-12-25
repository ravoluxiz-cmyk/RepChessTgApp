import { NextResponse, NextRequest } from 'next/server'
import { restorePlayer } from '@/lib/db'

/**
 * POST /api/tournaments/[id]/participants/[participantId]/restore
 * Возвращает участника в жеребьевку (active = true)
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
    const success = await restorePlayer(participantIdNum)

    if (!success) {
      return NextResponse.json({ error: 'Failed to restore player' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Player restored to tournament',
      participantId: participantIdNum
    }, { status: 200 })
  } catch (err) {
    console.error('[Restore] Error:', err)
    return NextResponse.json({ error: 'Failed to restore player' }, { status: 500 })
  }
}
