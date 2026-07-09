import { NextRequest, NextResponse } from "next/server"
import { getTelegramUserFromHeaders, isAdmin } from "@/lib/telegram"
import {
  getMatchAuthorizationContext,
  getSiteUserBySessionHash,
  getUserByTelegramId,
  updateMatchResult,
  type User,
} from "@/lib/db"
import { processMatchResultWithRatings } from "@/lib/rating/matchIntegration"
import { getSiteSessionSecretFromHeaders, hashSessionSecret } from "@/lib/site-auth"
import { isAdministrativePlayerStatus, resolvePlayerStatus } from "@/lib/player-status"

type MatchSubmitter = {
  userId?: number
  telegramId?: number
  isAdmin: boolean
}

function isDbUserAdmin(user: User | null) {
  if (!user) return false
  const playerStatus = resolvePlayerStatus(user.player_status, user.role)
  return user.role === "admin" || user.role === "moderator" || isAdministrativePlayerStatus(playerStatus)
}

async function getMatchSubmitter(req: NextRequest): Promise<MatchSubmitter | null> {
  const telegramUser = req.headers.has("authorization")
    ? getTelegramUserFromHeaders(req.headers)
    : null

  if (telegramUser) {
    const dbUser = await getUserByTelegramId(telegramUser.id)
    return {
      userId: dbUser?.id,
      telegramId: telegramUser.id,
      isAdmin: await isAdmin(telegramUser),
    }
  }

  const sessionSecret = getSiteSessionSecretFromHeaders(req.headers)
  if (!sessionSecret) return null

  const session = await getSiteUserBySessionHash(hashSessionSecret(sessionSecret))
  if (!session?.user) return null

  return {
    userId: session.user.id,
    telegramId: session.user.telegram_id,
    isAdmin: isDbUserAdmin(session.user),
  }
}

export async function POST(req: NextRequest) {
  try {
    const submitter = await getMatchSubmitter(req)
    if (!submitter) {
      return NextResponse.json({ ok: false, error: "Authentication Failed" }, { status: 401 })
    }

    const body = await req.json().catch(() => null) as { matchId?: number; result?: string }
    const matchId = Number(body?.matchId)
    const result = body?.result

    if (!Number.isSafeInteger(matchId) || matchId <= 0) {
      return NextResponse.json({ ok: false, error: "Missing or invalid matchId" }, { status: 400 })
    }
    if (!result || typeof result !== 'string') {
      return NextResponse.json({ ok: false, error: "Missing or invalid result" }, { status: 400 })
    }

    const allowed = new Set(["white", "black", "draw", "bye", "forfeit_white", "forfeit_black", "not_played"])
    const finalResult = allowed.has(result) ? result : "not_played"

    const access = await getMatchAuthorizationContext(matchId)
    if (!access) {
      return NextResponse.json({ ok: false, error: "Match not found" }, { status: 404 })
    }

    const isParticipant =
      (typeof submitter.userId === "number" && access.participantUserIds.includes(submitter.userId)) ||
      (typeof submitter.telegramId === "number" && access.participantTelegramIds.includes(submitter.telegramId))

    if (!submitter.isAdmin && !isParticipant) {
      return NextResponse.json({ ok: false, error: "Forbidden: this is not your match" }, { status: 403 })
    }

    const updated = await updateMatchResult(matchId, finalResult)
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Failed to update match" }, { status: 500 })
    }

    // Process rating updates if match result is valid for rating
    if (['white', 'black', 'draw'].includes(finalResult)) {
      try {
        const ratingResult = await processMatchResultWithRatings(matchId, finalResult)
        if (ratingResult.success) {
          // Rating updates processed successfully
        } else {
          console.warn('Rating update failed:', ratingResult.error)
        }
      } catch (ratingError) {
        console.error('Error processing rating updates:', ratingError)
        // Don't fail the entire request if rating update fails
      }
    }

    return NextResponse.json({ ok: true, match: updated })
  } catch (e) {
    console.error("/api/match/submit failed:", e)
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 })
  }
}
