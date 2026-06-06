import { NextRequest, NextResponse } from "next/server"
import { getAllUsers, updateUserPlayerStatus } from "@/lib/db"
import { normalizePlayerStatus, PLAYER_STATUSES, resolvePlayerStatus } from "@/lib/player-status"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/telegram"

export const dynamic = "force-dynamic"

type RatingRow = {
  user_id: number
  rating?: number | null
  rd?: number | null
  games_count?: number | null
}

export async function GET(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const users = await getAllUsers()
  const userIds = users
    .map((user) => user.id)
    .filter((id): id is number => typeof id === "number")

  const ratingMap = new Map<number, RatingRow>()
  if (userIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("player_ratings")
      .select("user_id,rating,rd,games_count")
      .in("user_id", userIds)

    if (error) {
      console.error("Error listing player ratings for admin users:", error)
    } else {
      for (const row of (data || []) as RatingRow[]) {
        ratingMap.set(Number(row.user_id), row)
      }
    }
  }

  return NextResponse.json({
    statuses: PLAYER_STATUSES,
    users: users.map((user) => ({
      ...user,
      player_status: resolvePlayerStatus(user.player_status, user.role),
      glicko: user.id ? ratingMap.get(user.id) || null : null,
    })),
  })
}

export async function PATCH(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as {
    user_id?: number
    player_status?: string
  } | null

  const userId = Number(body?.user_id)
  const playerStatus = normalizePlayerStatus(body?.player_status)

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Некорректный пользователь" }, { status: 400 })
  }

  if (body?.player_status !== playerStatus) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 })
  }

  const user = await updateUserPlayerStatus(userId, playerStatus)
  if (!user) {
    return NextResponse.json({ error: "Не удалось обновить статус" }, { status: 500 })
  }

  return NextResponse.json({
    user: {
      ...user,
      player_status: resolvePlayerStatus(user.player_status, user.role),
    },
  })
}
