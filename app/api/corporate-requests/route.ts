import { NextRequest, NextResponse } from "next/server"
import { createCorporateRequest } from "@/lib/db"
import { createRepChessOsResource } from "@/lib/rep-chess-os"

const FORMAT_VALUES: Record<string, number> = {
  "Корпоративный турнир": 30000,
  "Тимбилдинг": 60000,
  "Спартакиада": 100000,
  "Family day": 100000,
  "Внутренняя лига": 120000,
  "Обучение сотрудников": 120000,
  "Хочу обсудить варианты": 30000,
}

type CorporateRequestBody = {
  name?: string
  company?: string
  contact?: string
  email?: string | null
  participants_count?: number | null
  format_interest?: string
  comment?: string | null
}

function clean(value: unknown) {
  return String(value || "").trim()
}

function normalizeParticipants(value: unknown) {
  if (value === null || value === undefined || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null
}

function nextActionDate() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

function buildLeadNotes(input: {
  contact: string
  email: string | null
  participantsCount: number | null
  formatInterest: string
  comment: string | null
}) {
  return [
    "Заявка с публичной страницы /corporate.",
    `Контакт: ${input.contact}`,
    input.email ? `Email: ${input.email}` : null,
    input.participantsCount ? `Участников: ${input.participantsCount}` : null,
    `Интерес: ${input.formatInterest}`,
    input.comment ? `Комментарий: ${input.comment}` : null,
  ].filter(Boolean).join("\n")
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as CorporateRequestBody | null

  const name = clean(body?.name)
  const company = clean(body?.company)
  const contact = clean(body?.contact)
  const email = clean(body?.email) || null
  const requestedFormat = clean(body?.format_interest)
  const formatInterest = FORMAT_VALUES[requestedFormat] ? requestedFormat : "Хочу обсудить варианты"
  const comment = clean(body?.comment) || null
  const participantsCount = normalizeParticipants(body?.participants_count)

  if (!name || !company || !contact) {
    return NextResponse.json({ error: "Заполните имя, компанию и контакт" }, { status: 400 })
  }

  const corporateRequest = await createCorporateRequest({
    name,
    company,
    contact,
    email,
    participants_count: participantsCount,
    format_interest: formatInterest,
    comment,
    status: "new",
  })

  let osLead = null
  try {
    osLead = await createRepChessOsResource("leads", {
      name: company,
      segment: "Corporate",
      status: "Новый лид",
      contact_name: name,
      telegram: contact.includes("@") || contact.toLowerCase().includes("t.me") ? contact : null,
      phone: contact.includes("@") || contact.toLowerCase().includes("t.me") ? null : contact,
      email,
      source: "corporate_page",
      potential_value: FORMAT_VALUES[formatInterest] ?? 30000,
      probability: 20,
      next_action: "Связаться по заявке с corporate-страницы",
      next_action_date: nextActionDate(),
      notes: buildLeadNotes({ contact, email, participantsCount, formatInterest, comment }),
    })
  } catch (error) {
    console.error("Error creating corporate Rep Chess OS lead:", error)
  }

  if (!corporateRequest && !osLead) {
    return NextResponse.json({ error: "Не удалось отправить заявку" }, { status: 500 })
  }

  return NextResponse.json({ request: corporateRequest, lead: osLead }, { status: 201 })
}
