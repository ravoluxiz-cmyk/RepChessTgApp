import { NextResponse } from "next/server"
import { fetchGoogleCalendarEvents } from "@/lib/google-calendar"

export async function GET() {
  try {
    const events = await fetchGoogleCalendarEvents()
    return NextResponse.json({ events })
  } catch (error) {
    console.error("Failed to fetch Google Calendar events:", error)
    return NextResponse.json({ events: [] })
  }
}
