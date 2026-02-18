import { NextResponse, NextRequest } from 'next/server'
import { deleteParticipant } from '@/lib/db'
import { requireAdmin } from '@/lib/telegram'

/**
 * DELETE /api/tournaments/[id]/participants/[participantId]
 * Полностью удаляет участника из турнира (опасная операция).
 * Удаляет все матчи с участием этого игрока.
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string; participantId: string }> }
) {
    try {
        const adminUser = await requireAdmin(request.headers)
        if (!adminUser) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { participantId } = await context.params
        const participantIdNum = Number(participantId)

        if (!Number.isFinite(participantIdNum)) {
            return NextResponse.json({ error: 'Invalid participantId' }, { status: 400 })
        }

        const success = await deleteParticipant(participantIdNum)

        if (!success) {
            return NextResponse.json({ error: 'Не удалось удалить участника' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Participant deleted from tournament',
            participantId: participantIdNum
        }, { status: 200 })
    } catch (err) {
        console.error('[DeleteParticipant] Error:', err)
        return NextResponse.json({ error: 'Не удалось удалить участника' }, { status: 500 })
    }
}
