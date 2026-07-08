import { NextRequest, NextResponse } from "next/server"
import {
  createRepChessOsResource,
  getRepChessOsMeta,
  isRepChessOsResource,
  listRepChessOsResource,
  RepChessOsSetupError,
} from "@/lib/rep-chess-os"
import { getRepChessOsAccessError } from "@/lib/rep-chess-os-guard"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  const accessError = await getRepChessOsAccessError(request.headers)
  if (accessError) {
    return NextResponse.json({ error: accessError.error }, { status: accessError.status })
  }

  const { resource } = await ctx.params
  if (resource === "meta") {
    return NextResponse.json(getRepChessOsMeta())
  }
  if (!isRepChessOsResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const rows = await listRepChessOsResource(resource, {
      status: searchParams.get("status") || undefined,
      area: searchParams.get("area") || undefined,
      segment: searchParams.get("segment") || undefined,
      priority: searchParams.get("priority") || undefined,
      horizon: searchParams.get("horizon") || undefined,
      direction: searchParams.get("direction") || undefined,
      type: searchParams.get("type") || undefined,
      event_type: searchParams.get("event_type") || undefined,
      category: searchParams.get("category") || undefined,
      effectiveness: searchParams.get("effectiveness") || undefined,
      stage: searchParams.get("stage") || undefined,
      due: searchParams.get("due") || undefined,
      search: searchParams.get("search") || undefined,
    })
    return NextResponse.json({ rows })
  } catch (error) {
    console.error(`Failed to list Rep Chess OS ${resource}:`, error)
    const message = error instanceof Error ? error.message : "Не удалось загрузить данные"
    return NextResponse.json(
      { error: message },
      { status: error instanceof RepChessOsSetupError ? 503 : 500 }
    )
  }
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  const accessError = await getRepChessOsAccessError(request.headers)
  if (accessError) {
    return NextResponse.json({ error: accessError.error }, { status: accessError.status })
  }

  const { resource } = await ctx.params
  if (!isRepChessOsResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 })
  }

  try {
    const body = await request.json().catch(() => null)
    const row = await createRepChessOsResource(resource, body)
    return NextResponse.json({ row }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось сохранить запись"
    return NextResponse.json(
      { error: message },
      { status: error instanceof RepChessOsSetupError ? 503 : 400 }
    )
  }
}
