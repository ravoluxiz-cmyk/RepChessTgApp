import { NextRequest, NextResponse } from "next/server"
import { listClubContent } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "all"
  const content = await listClubContent({ type, publishedOnly: true })

  return NextResponse.json({ content })
}
