import { NextRequest, NextResponse } from "next/server"
import {
  deleteRepChessOsResource,
  isRepChessOsResource,
  RepChessOsSetupError,
  updateRepChessOsResource,
} from "@/lib/rep-chess-os"
import { getRepChessOsAccessError } from "@/lib/rep-chess-os-guard"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ resource: string; id: string }> }
) {
  const accessError = await getRepChessOsAccessError(request.headers)
  if (accessError) {
    return NextResponse.json({ error: accessError.error }, { status: accessError.status })
  }

  const { resource, id } = await ctx.params
  if (!isRepChessOsResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 })
  }

  try {
    const body = await request.json().catch(() => null)
    const row = await updateRepChessOsResource(resource, id, body)
    return NextResponse.json({ row })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось обновить запись"
    return NextResponse.json(
      { error: message },
      { status: error instanceof RepChessOsSetupError ? 503 : 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ resource: string; id: string }> }
) {
  const accessError = await getRepChessOsAccessError(request.headers)
  if (accessError) {
    return NextResponse.json({ error: accessError.error }, { status: accessError.status })
  }

  const { resource, id } = await ctx.params
  if (!isRepChessOsResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 })
  }

  try {
    await deleteRepChessOsResource(resource, id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось удалить запись"
    return NextResponse.json(
      { error: message },
      { status: error instanceof RepChessOsSetupError ? 503 : 400 }
    )
  }
}
