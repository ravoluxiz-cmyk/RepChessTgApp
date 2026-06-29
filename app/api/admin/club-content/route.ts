import { NextRequest, NextResponse } from "next/server"
import { createClubContent, deleteClubContent, listClubContent, updateClubContent } from "@/lib/db"
import { normalizeClubContentImagePosition, normalizeClubContentImages, normalizeClubContentType } from "@/lib/club-content"
import { requireAdmin } from "@/lib/telegram"

export const dynamic = "force-dynamic"

async function assertAdmin(request: NextRequest) {
  const adminUser = await requireAdmin(request.headers)
  return !!adminUser
}

export async function GET(request: NextRequest) {
  if (!(await assertAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "all"
  const content = await listClubContent({ type, publishedOnly: false })

  return NextResponse.json({ content })
}

export async function POST(request: NextRequest) {
  if (!(await assertAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const title = String(body?.title || "").trim()

  if (!title) {
    return NextResponse.json({ error: "Укажите заголовок" }, { status: 400 })
  }

  const content = await createClubContent({
    type: normalizeClubContentType(body?.type),
    title,
    subtitle: String(body?.subtitle || "").trim() || null,
    body: String(body?.body || "").trim() || null,
    image_url: String(body?.image_url || "").trim() || null,
    image_urls: normalizeClubContentImages(body?.image_urls, body?.image_url),
    image_position: normalizeClubContentImagePosition(body?.image_position),
    external_url: String(body?.external_url || "").trim() || null,
    author_name: String(body?.author_name || "").trim() || null,
    is_published: body?.is_published !== false,
    is_featured: !!body?.is_featured,
    sort_order: Number(body?.sort_order || 100),
  })

  if (!content) {
    return NextResponse.json({ error: "Не удалось создать карточку" }, { status: 500 })
  }

  return NextResponse.json({ content }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  if (!(await assertAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const id = Number(body?.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Некорректная карточка" }, { status: 400 })
  }

  const content = await updateClubContent(id, {
    type: normalizeClubContentType(body?.type),
    title: String(body?.title || "").trim(),
    subtitle: String(body?.subtitle || "").trim() || null,
    body: String(body?.body || "").trim() || null,
    image_url: String(body?.image_url || "").trim() || null,
    image_urls: normalizeClubContentImages(body?.image_urls, body?.image_url),
    image_position: normalizeClubContentImagePosition(body?.image_position),
    external_url: String(body?.external_url || "").trim() || null,
    author_name: String(body?.author_name || "").trim() || null,
    is_published: body?.is_published !== false,
    is_featured: !!body?.is_featured,
    sort_order: Number(body?.sort_order || 100),
  })

  if (!content) {
    return NextResponse.json({ error: "Не удалось обновить карточку" }, { status: 500 })
  }

  return NextResponse.json({ content })
}

export async function DELETE(request: NextRequest) {
  if (!(await assertAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get("id"))

  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Некорректная карточка" }, { status: 400 })
  }

  const ok = await deleteClubContent(id)
  if (!ok) {
    return NextResponse.json({ error: "Не удалось удалить карточку" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
