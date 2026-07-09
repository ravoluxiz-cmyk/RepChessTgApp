import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

function escapePostgrestPattern(value: string) {
  return value
    .trim()
    .replace(/[(),]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[%_\\]/g, "\\$&")
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = escapePostgrestPattern(searchParams.get('q') || '')
    
    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    // Search by first name, last name, and username
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, username, first_name, last_name, rating')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%`)
      .order('first_name', { ascending: true })
      .limit(10)

    if (error) {
      console.error("Error searching users:", error)
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error("Error in user search:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
