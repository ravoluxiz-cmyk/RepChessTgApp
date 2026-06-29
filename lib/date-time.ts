const MOSCOW_TIME_ZONE = "Europe/Moscow"
const MOSCOW_OFFSET = "+03:00"

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function toMoscowDateTimeInput(value?: string | null): string {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 16)
  }

  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone: MOSCOW_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date)

  const part = (type: string) => parts.find((item) => item.type === type)?.value || "00"
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`
}

export function fromMoscowDateTimeInput(value?: string | null): string | null {
  const normalized = normalizeHalfHourDateTimeInput(value)
  if (!normalized) return null
  return `${normalized}:00${MOSCOW_OFFSET}`
}

export function normalizeHalfHourDateTimeInput(value?: string | null): string {
  if (!value) return ""
  const trimmed = String(value).trim().slice(0, 16)
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2}T)(\d{2}):(\d{2})$/)
  if (!match) return trimmed

  const [, datePart, hourRaw, minuteRaw] = match
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return trimmed

  const nextMinute = minute >= 15 && minute < 45 ? 30 : minute >= 45 ? 30 : 0

  return `${datePart}${pad(hour)}:${pad(nextMinute)}`
}
