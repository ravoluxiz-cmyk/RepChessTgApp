import { NextResponse } from "next/server"

type GoogleCalendarEvent = {
  id?: string
  summary?: string
  description?: string
  location?: string
  htmlLink?: string
  start?: {
    date?: string
    dateTime?: string
  }
  end?: {
    date?: string
    dateTime?: string
  }
}

type GoogleCalendarResponse = {
  items?: GoogleCalendarEvent[]
  error?: {
    message?: string
  }
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

export async function GET() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY

  if (!calendarId || !apiKey) {
    return NextResponse.json({ events: [] })
  }

  const now = new Date()
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`)
  url.searchParams.set("key", apiKey)
  url.searchParams.set("timeMin", now.toISOString())
  url.searchParams.set("timeMax", addMonths(now, 12).toISOString())
  url.searchParams.set("maxResults", "50")
  url.searchParams.set("singleEvents", "true")
  url.searchParams.set("orderBy", "startTime")

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
    })

    const data = await response.json() as GoogleCalendarResponse

    if (!response.ok) {
      console.error("Google Calendar API error:", data.error?.message || response.statusText)
      return NextResponse.json({ events: [] })
    }

    const events = (data.items || []).map((event) => ({
      id: event.id,
      title: event.summary || "Шахматный турнир",
      description: event.description || null,
      location: event.location || null,
      start_at: event.start?.dateTime || event.start?.date || null,
      end_at: event.end?.dateTime || event.end?.date || null,
      event_url: event.htmlLink || null,
      source: "google_calendar",
    }))

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Failed to fetch Google Calendar events:", error)
    return NextResponse.json({ events: [] })
  }
}
