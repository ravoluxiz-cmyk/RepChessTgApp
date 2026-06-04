import { NextRequest, NextResponse } from "next/server"
import { fetchGoogleCalendarEvents } from "@/lib/google-calendar"
import { requireAdmin } from "@/lib/telegram"
import { upsertCalendarTournament, type Tournament } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request.headers)
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const events = await fetchGoogleCalendarEvents()
    let imported = 0

    for (const event of events) {
      if (!event.id) continue

      const tournament: Tournament = {
        title: event.title,
        format: "calendar",
        points_win: 1,
        points_loss: 0,
        points_draw: 0.5,
        bye_points: 0,
        rounds: 1,
        tiebreakers: "",
        team_mode: "none",
        allow_join: 1,
        allow_edit_results: 0,
        allow_danger_changes: 0,
        forbid_repeat_bye: 1,
        late_join_points: 0,
        hide_rating: 0,
        hide_new_rating: 0,
        compute_performance: 0,
        hide_color_names: 0,
        show_opponent_names: 1,
        archived: 0,
        start_at: event.start_at,
        end_at: event.end_at,
        location: event.location,
        description: event.description,
        event_url: event.event_url,
        source: "google_calendar",
        google_event_id: event.id,
      }

      const saved = await upsertCalendarTournament(tournament)
      if (saved) imported++
    }

    return NextResponse.json({ ok: true, imported, total: events.length })
  } catch (error) {
    console.error("Failed to sync calendar tournaments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
