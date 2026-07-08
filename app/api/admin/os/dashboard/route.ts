import { NextRequest, NextResponse } from "next/server"
import { getRepChessOsDashboard, RepChessOsSetupError } from "@/lib/rep-chess-os"
import { getRepChessOsAccessError } from "@/lib/rep-chess-os-guard"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const accessError = await getRepChessOsAccessError(request.headers)
  if (accessError) {
    return NextResponse.json({ error: accessError.error }, { status: accessError.status })
  }

  try {
    const dashboard = await getRepChessOsDashboard()
    return NextResponse.json(dashboard)
  } catch (error) {
    console.error("Failed to load Rep Chess OS dashboard:", error)
    const message = error instanceof Error ? error.message : "Не удалось загрузить Rep Chess OS"
    return NextResponse.json(
      { error: message },
      { status: error instanceof RepChessOsSetupError ? 503 : 500 }
    )
  }
}
