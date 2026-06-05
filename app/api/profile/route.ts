import { NextRequest, NextResponse } from "next/server"
import { getTelegramUserFromHeaders } from "@/lib/telegram"
import { getWebProfileUserFromHeaders } from "@/lib/web-auth"
import {
  getUserByTelegramId,
  createUser,
  updateUserProfile,
  createRatingRequest,
  type UserProfileData,
} from "@/lib/db"

const DEFAULT_RATING = 1500

function getDisplayName(user: { first_name?: string | null; last_name?: string | null; username?: string | null }) {
  const fullName = [user.first_name, user.last_name]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
  return fullName || user.username || "Участник"
}

function detectRatingPlatform(url: string | null | undefined): "lichess" | "chesscom" | null {
  const value = String(url || "").trim().toLowerCase()
  if (!value) return null
  if (value.includes("lichess.org")) return "lichess"
  if (value.includes("chess.com")) return "chesscom"
  return null
}

// GET /api/profile - Get user profile (auto-creates if not exists)
export async function GET(request: NextRequest) {
  try {
    // Get Telegram user from headers
    const telegramUser =
      getTelegramUserFromHeaders(request.headers) ||
      getWebProfileUserFromHeaders(request.headers)

    if (!telegramUser) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid Telegram authentication" },
        { status: 401 }
      )
    }

    // Get user from database
    let user = await getUserByTelegramId(telegramUser.id)

    if (!user) {
      // Auto-create profile with Telegram data
      // Auto-create profile for new Telegram user
      user = await createUser({
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name || "",
        rating: DEFAULT_RATING,
        chesscom_url: null,
        lichess_url: null,
        bio: null,
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/profile - Create user profile
export async function POST(request: NextRequest) {
  try {
    // Get Telegram user from headers
    const telegramUser =
      getTelegramUserFromHeaders(request.headers) ||
      getWebProfileUserFromHeaders(request.headers)

    if (!telegramUser) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid Telegram authentication" },
        { status: 401 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByTelegramId(telegramUser.id)
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Parse request body
    let body;
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }
    const {
      first_name,
      last_name,
      chesscom_url,
      lichess_url,
      bio,
    } = body

    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      )
    }

    const lichessPlatform = detectRatingPlatform(lichess_url)
    const chesscomPlatform = detectRatingPlatform(chesscom_url)
    if (!lichessPlatform && !chesscomPlatform) {
      return NextResponse.json(
        { error: "Для установления рейтинга нужна ссылка на Lichess или Chess.com" },
        { status: 400 }
      )
    }

    // Create user
    const newUser = await createUser({
      telegram_id: telegramUser.id,
      username: telegramUser.username,
      first_name,
      last_name,
      rating: DEFAULT_RATING,
      chesscom_url: chesscom_url || null,
      lichess_url: lichess_url || null,
      bio: bio || null,
    })

    if (newUser) {
      const profileUrl = String(lichessPlatform ? lichess_url : chesscom_url).trim()
      await createRatingRequest({
        user_id: newUser.id,
        user_telegram_id: telegramUser.id,
        user_name: getDisplayName(newUser),
        platform: lichessPlatform || chesscomPlatform || "lichess",
        profile_url: profileUrl,
        status: "pending",
      })
    }

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error("Error creating user profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Get Telegram user from headers
    const telegramUser =
      getTelegramUserFromHeaders(request.headers) ||
      getWebProfileUserFromHeaders(request.headers)

    if (!telegramUser) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid Telegram authentication" },
        { status: 401 }
      )
    }

    // Parse request body
    let body;
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }
    const {
      first_name,
      last_name,
      chesscom_url,
      lichess_url,
      bio,
    } = body

    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      )
    }

    const lichessPlatform = detectRatingPlatform(lichess_url)
    const chesscomPlatform = detectRatingPlatform(chesscom_url)
    if (!lichessPlatform && !chesscomPlatform) {
      return NextResponse.json(
        { error: "Для установления рейтинга нужна ссылка на Lichess или Chess.com" },
        { status: 400 }
      )
    }

    const existingUser = await getUserByTelegramId(telegramUser.id)

    // Update user profile
    const profileData: UserProfileData = {
      first_name,
      last_name,
      chesscom_url: chesscom_url || null,
      lichess_url: lichess_url || null,
      bio: bio || null,
    }

    const updated = await updateUserProfile(telegramUser.id, profileData)

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get updated user
    const updatedUser = await getUserByTelegramId(telegramUser.id)

    if (updatedUser) {
      const profileUrl = String(lichessPlatform ? lichess_url : chesscom_url).trim()
      const previousUrls = new Set([
        String(existingUser?.lichess_url || "").trim(),
        String(existingUser?.chesscom_url || "").trim(),
      ].filter(Boolean))
      if (!previousUrls.has(String(profileUrl).trim())) {
        await createRatingRequest({
          user_id: updatedUser.id,
          user_telegram_id: telegramUser.id,
          user_name: getDisplayName(updatedUser),
          platform: lichessPlatform || chesscomPlatform || "lichess",
          profile_url: profileUrl,
          status: "pending",
        })
      }
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
