"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import ChessBackground from "@/components/ChessBackground"
import { User, Edit, Link as LinkIcon, ArrowLeft, BadgeCheck, Trophy } from "lucide-react"
import { useSearchParams } from "next/navigation"
import RatingDisplay from "@/components/rating/RatingDisplay"
import { getProfileAuthHeaders } from "@/lib/web-user"

// Pure helper — hoisted out of component (rendering-hoist-jsx)
function isProfileIncomplete(profile: { chesscom_url?: string | null; lichess_url?: string | null; bio?: string | null }): boolean {
  return !profile.chesscom_url && !profile.lichess_url && !profile.bio
}

function formatJoinedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "недавно"

  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date)
}

// Success banner component that uses searchParams
function SuccessBanner() {
  const searchParams = useSearchParams()

  if (searchParams.get('saved') !== '1') {
    return null
  }

  return (
    <div className="mb-6 bg-green-600/80 border border-green-400 text-white rounded-lg p-4 text-center font-bold">
      Профиль сохранен. Заявка на установление рейтинга отправлена администратору.
    </div>
  )
}

interface UserProfile {
  id: number
  telegram_id: number
  username?: string
  first_name: string
  last_name: string
  rating: number
  chesscom_url?: string
  lichess_url?: string
  bio?: string
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { webApp, initData, isReady } = useTelegramWebApp()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isReady) return

    async function fetchProfile() {
      try {


        const response = await fetch("/api/profile", {
          headers: getProfileAuthHeaders(initData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Profile fetch failed:", response.status, errorData)
          throw new Error(errorData.message || `HTTP ${response.status}`)
        }

        const data = await response.json()
        const userProfile = data.user


        setProfile(userProfile)

        // Check if profile is incomplete (just created) - redirect to edit
        if (initData && userProfile && isProfileIncomplete(userProfile)) {

          router.push("/profile/edit")
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError(
          err instanceof Error
            ? `Не удалось загрузить профиль: ${err.message}`
            : "Не удалось загрузить профиль"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [initData, isReady, router])

  // isProfileIncomplete вынесена на уровень модуля (rendering-hoist-jsx)

  // Setup back button
  useEffect(() => {
    if (webApp?.BackButton) {
      const goHome = () => router.push("/")
      webApp.BackButton.show()
      webApp.BackButton.onClick(goHome)

      return () => {
        webApp.BackButton.offClick(goHome)
        webApp.BackButton.hide()
      }
    }
  }, [webApp, router])

  if (loading) {
    return (
      <ChessBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Загрузка...</div>
        </div>
      </ChessBackground>
    )
  }

  if (error) {
    return (
      <ChessBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </ChessBackground>
    )
  }

  // Profile is always created automatically, so this should not happen
  if (!profile) {
    return (
      <ChessBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Создание профиля...</div>
        </div>
      </ChessBackground>
    )
  }

  const displayName = `${profile.first_name} ${profile.last_name}`.trim()
  const joinedAt = formatJoinedAt(profile.created_at)

  return (
    <ChessBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push("/")}
              className="rounded-full bg-white p-3 text-black transition-colors hover:bg-gray-200"
              aria-label="Назад в меню"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="brand-title text-4xl text-white">
              Карточка игрока
            </h1>
            <button
              onClick={() => router.push("/profile/edit")}
              className="rounded-full bg-white p-3 text-black transition-colors hover:bg-gray-200"
              aria-label="Редактировать профиль"
            >
              <Edit className="w-6 h-6" />
            </button>
          </div>

          {/* Success Banner */}
          <Suspense fallback={null}>
            <SuccessBanner />
          </Suspense>

          {/* Profile Card */}
          <div className="brand-panel-dark overflow-hidden rounded-[24px]">
            {/* User Info */}
            <div className="relative p-6 sm:p-7">
              <div className="brand-bg-icons pointer-events-none absolute -right-20 -top-20 h-72 w-72 opacity-[0.07]" />
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-[28px] bg-white p-4 text-[#151515] shadow-[0_18px_52px_rgba(0,0,0,0.22)]">
                    <User className="w-12 h-12" />
                  </div>
                  <div>
                    <div className="brand-chip mb-2 w-fit px-3 py-1 text-xs font-black uppercase">
                      Rep Player
                    </div>
                    <h2 className="brand-title text-3xl text-white sm:text-5xl">
                      {displayName || "Игрок"}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold text-white/65">
                      {profile.username && <span>@{profile.username}</span>}
                      <span>С нами с {joinedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:min-w-64">
                  <div className="rounded-2xl bg-white px-4 py-3 text-[#151515]">
                    <div className="flex items-center gap-2 text-xs font-black uppercase opacity-60">
                      <Trophy className="h-4 w-4" />
                      Рейтинг
                    </div>
                    <div className="brand-font mt-1 text-3xl">{profile.rating || 1500}</div>
                  </div>
                  <div className="rounded-2xl bg-[#20d66b] px-4 py-3 text-[#151515]">
                    <div className="flex items-center gap-2 text-xs font-black uppercase opacity-70">
                      <BadgeCheck className="h-4 w-4" />
                      Статус
                    </div>
                    <div className="mt-2 text-sm font-black uppercase">Профиль</div>
                  </div>
                </div>
              </div>

              {profile.bio && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-base leading-relaxed text-white/78">{profile.bio}</p>
                </div>
              )}
            </div>

            <div className="space-y-6 border-t border-white/10 p-6 sm:p-7">
              <div className="rounded-2xl border border-amber-300/30 bg-amber-400/15 p-3 text-sm font-semibold text-amber-50">
                Если рейтинг еще не подтвержден администратором, используется стартовое значение 1500.
              </div>

              <div>
                <RatingDisplay
                  userId={profile.id}
                  showHistory={true}
                  showRank={true}
                />
              </div>

              {(profile.chesscom_url || profile.lichess_url) && (
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                    <LinkIcon className="w-5 h-5" />
                    Игровые профили
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {profile.chesscom_url && (
                      <a
                        href={profile.chesscom_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-white transition hover:bg-white/[0.12]"
                      >
                        <span className="brand-font text-sm">Chess.com</span>
                        <span className="mt-2 block break-all text-sm text-white/62">{profile.chesscom_url}</span>
                      </a>
                    )}
                    {profile.lichess_url && (
                      <a
                        href={profile.lichess_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-white transition hover:bg-white/[0.12]"
                      >
                        <span className="brand-font text-sm">Lichess</span>
                        <span className="mt-2 block break-all text-sm text-white/62">{profile.lichess_url}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChessBackground>
  )
}
