import { NextResponse } from "next/server"

const DEFAULT_CALENDAR_ID = "9cca0ead2265768182e4addb1fb5586c8b83426adc1099349a2b3d7a1424889e@group.calendar.google.com"
const DEFAULT_TIMEZONE_OFFSET = "+03:00"

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

type CalendarEvent = {
  id?: string
  title: string
  description: string | null
  location: string | null
  start_at: string | null
  end_at: string | null
  event_url: string | null
  source: "google_calendar"
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

function unfoldIcsLines(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]/g, "")
    .split("\n")
}

function getIcsValue(line: string) {
  const colonIndex = line.indexOf(":")
  return colonIndex === -1 ? "" : line.slice(colonIndex + 1)
}

function decodeIcsText(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim()
}

function parseIcsDate(value: string) {
  const dateOnly = value.match(/^(\d{4})(\d{2})(\d{2})$/)
  if (dateOnly) {
    return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`
  }

  const dateTime = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/)
  if (!dateTime) return null

  const [, year, month, day, hour, minute, second, utc] = dateTime
  const offset = utc ? "Z" : DEFAULT_TIMEZONE_OFFSET

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`
}

function eventTime(event: CalendarEvent) {
  if (!event.start_at) return Number.MAX_SAFE_INTEGER
  const time = new Date(event.start_at).getTime()
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time
}

function parseIcsEvents(text: string, calendarId: string): CalendarEvent[] {
  const lines = unfoldIcsLines(text)
  const events: CalendarEvent[] = []
  let current: Record<string, string> | null = null

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {}
      continue
    }

    if (line === "END:VEVENT") {
      if (current) {
        const startAt = current.DTSTART ? parseIcsDate(current.DTSTART) : null
        const endAt = current.DTEND ? parseIcsDate(current.DTEND) : null

        events.push({
          id: current.UID,
          title: current.SUMMARY || "Шахматный турнир",
          description: current.DESCRIPTION || null,
          location: current.LOCATION || null,
          start_at: startAt,
          end_at: endAt,
          event_url: `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=Europe%2FMoscow`,
          source: "google_calendar",
        })
      }

      current = null
      continue
    }

    if (!current) continue

    const key = line.split(/[;:]/, 1)[0]
    if (!key) continue

    current[key] = decodeIcsText(getIcsValue(line))
  }

  const now = Date.now()
  const maxTime = addMonths(new Date(), 12).getTime()

  return events
    .filter((event) => {
      const time = eventTime(event)
      return time >= now && time <= maxTime
    })
    .sort((a, b) => eventTime(a) - eventTime(b))
}

async function fetchEventsFromIcs(calendarId: string) {
  const url = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`
  const response = await fetch(url, {
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    console.error("Google Calendar ICS error:", response.statusText)
    return []
  }

  return parseIcsEvents(await response.text(), calendarId)
}

async function fetchEventsFromApi(calendarId: string, apiKey: string) {
  const now = new Date()
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`)
  url.searchParams.set("key", apiKey)
  url.searchParams.set("timeMin", now.toISOString())
  url.searchParams.set("timeMax", addMonths(now, 12).toISOString())
  url.searchParams.set("maxResults", "50")
  url.searchParams.set("singleEvents", "true")
  url.searchParams.set("orderBy", "startTime")

  const response = await fetch(url, {
    next: { revalidate: 300 },
  })

  const data = await response.json() as GoogleCalendarResponse

  if (!response.ok) {
    console.error("Google Calendar API error:", data.error?.message || response.statusText)
    return []
  }

  return (data.items || []).map((event) => ({
    id: event.id,
    title: event.summary || "Шахматный турнир",
    description: event.description || null,
    location: event.location || null,
    start_at: event.start?.dateTime || event.start?.date || null,
    end_at: event.end?.dateTime || event.end?.date || null,
    event_url: event.htmlLink || null,
    source: "google_calendar" as const,
  }))
}

export async function GET() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID || DEFAULT_CALENDAR_ID
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY

  try {
    const events = apiKey
      ? await fetchEventsFromApi(calendarId, apiKey)
      : await fetchEventsFromIcs(calendarId)

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Failed to fetch Google Calendar events:", error)
    return NextResponse.json({ events: [] })
  }
}
