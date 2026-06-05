import { NextRequest, NextResponse } from "next/server"
import { createPartnershipRequest } from "@/lib/db"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    name?: string
    company?: string
    contact?: string
    format?: string
    people_count?: number
    comment?: string
  } | null

  const name = String(body?.name || "").trim()
  const company = String(body?.company || "").trim()
  const contact = String(body?.contact || "").trim()
  const format = String(body?.format || "").trim()
  const comment = String(body?.comment || "").trim()
  const peopleCount = Number(body?.people_count || 0)

  if (!name || !company || !contact || !format) {
    return NextResponse.json({ error: "Заполните имя, компанию, контакт и формат" }, { status: 400 })
  }

  const created = await createPartnershipRequest({
    name,
    company,
    contact,
    format,
    people_count: Number.isFinite(peopleCount) && peopleCount > 0 ? peopleCount : null,
    comment: comment || null,
  })

  if (!created) {
    return NextResponse.json({ error: "Не удалось отправить заявку" }, { status: 500 })
  }

  return NextResponse.json({ request: created }, { status: 201 })
}
