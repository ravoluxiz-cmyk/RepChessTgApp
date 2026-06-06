import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/telegram"

export const dynamic = "force-dynamic"

type UserRow = { id: number }
type RatingRow = { user_id: number }

export async function POST(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const now = new Date().toISOString()

  const usersUpdate = await supabaseAdmin
    .from("users")
    .update({ rating: 1500, updated_at: now })
    .neq("id", -1)

  if (usersUpdate.error) {
    console.error("Error resetting users rating:", usersUpdate.error)
    return NextResponse.json({ error: "Не удалось обновить рейтинги пользователей" }, { status: 500 })
  }

  const { data: users, error: usersError } = await supabaseAdmin
    .from("users")
    .select("id")

  if (usersError) {
    console.error("Error listing users for rating reset:", usersError)
    return NextResponse.json({ error: "Не удалось получить список пользователей" }, { status: 500 })
  }

  const ratingsUpdate = await supabaseAdmin
    .from("player_ratings")
    .update({
      rating: 1500,
      rd: 350,
      volatility: 0.06,
      games_count: 0,
      wins_count: 0,
      losses_count: 0,
      draws_count: 0,
      last_game_at: null,
      rating_period_start: now,
      last_updated: now,
    })
    .neq("user_id", -1)

  if (ratingsUpdate.error) {
    console.error("Error resetting player_ratings:", ratingsUpdate.error)
    return NextResponse.json({ error: "Не удалось сбросить Glicko-рейтинги" }, { status: 500 })
  }

  const { data: existingRatings, error: ratingsError } = await supabaseAdmin
    .from("player_ratings")
    .select("user_id")

  if (ratingsError) {
    console.error("Error listing player_ratings after reset:", ratingsError)
    return NextResponse.json({ error: "Не удалось проверить Glicko-записи" }, { status: 500 })
  }

  const existingUserIds = new Set(((existingRatings || []) as RatingRow[]).map((row) => Number(row.user_id)))
  const missingRows = ((users || []) as UserRow[])
    .filter((user) => !existingUserIds.has(Number(user.id)))
    .map((user) => ({
      user_id: user.id,
      rating: 1500,
      rd: 350,
      volatility: 0.06,
      games_count: 0,
      wins_count: 0,
      losses_count: 0,
      draws_count: 0,
      last_game_at: null,
      rating_period_start: now,
      last_updated: now,
    }))

  if (missingRows.length > 0) {
    const insert = await supabaseAdmin
      .from("player_ratings")
      .insert(missingRows)

    if (insert.error) {
      console.error("Error inserting missing player_ratings:", insert.error)
      return NextResponse.json({ error: "Не удалось создать недостающие Glicko-записи" }, { status: 500 })
    }
  }

  return NextResponse.json({
    ok: true,
    users_reset: (users || []).length,
    player_ratings_created: missingRows.length,
  })
}
