"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import ChessBackground from "@/components/ChessBackground"
import { ArrowLeft } from "lucide-react"
import { getProfileAuthHeaders } from "@/lib/web-user"

interface ProfileFormData {
  first_name: string
  last_name: string
  chesscom_url: string
  lichess_url: string
  bio: string
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { webApp, initData, isReady, user: tgUser } = useTelegramWebApp()
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: tgUser?.first_name || "",
    last_name: tgUser?.last_name || "",
    chesscom_url: "",
    lichess_url: "",
    bio: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNewProfile, setIsNewProfile] = useState(false)

  // Fetch existing profile
  useEffect(() => {
    if (!isReady) return

    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile", {
          headers: getProfileAuthHeaders(initData),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()

        // Profile is always auto-created now
        if (data.user) {
          setFormData({
            first_name: data.user.first_name || "",
            last_name: data.user.last_name || "",
            chesscom_url: data.user.chesscom_url || "",
            lichess_url: data.user.lichess_url || "",
            bio: data.user.bio || "",
          })

          // Check if profile is incomplete (only has Telegram data)
          const isIncomplete = !data.user.chesscom_url &&
                               !data.user.lichess_url &&
                               !data.user.bio
          setIsNewProfile(isIncomplete)
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Не удалось загрузить профиль")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [initData, isReady, tgUser])

  // Setup back button
  useEffect(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.show()
      webApp.BackButton.onClick(() => router.push("/"))

      return () => {
        webApp.BackButton.hide()
      }
    }
  }, [webApp, router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name) {
        setError("Имя и фамилия обязательны для заполнения")
        setSaving(false)
        return
      }

      if (!formData.chesscom_url && !formData.lichess_url) {
        setError("Прикрепите ссылку на Lichess или Chess.com, чтобы администратор установил рейтинг")
        setSaving(false)
        return
      }

      // Prepare data
      const profileData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        chesscom_url: formData.chesscom_url || null,
        lichess_url: formData.lichess_url || null,
        bio: formData.bio || null,
      }

      // Always use PUT since profile is auto-created on first GET
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getProfileAuthHeaders(initData),
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save profile")
      }

      // Success - redirect to profile (with success flag)
      router.push("/profile?saved=1")
    } catch (err) {
      console.error("Error saving profile:", err)
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить профиль"
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ChessBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Загрузка...</div>
        </div>
      </ChessBackground>
    )
  }

  return (
    <ChessBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.push("/")}
              className="bg-white text-black p-3 rounded-lg hover:bg-gray-200 transition-colors"
              aria-label="Назад в меню"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1
              className="brand-title text-4xl text-white"
            >
              {isNewProfile ? "Заполнить профиль" : "Редактировать профиль"}
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="brand-panel rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">
                Личная информация
              </h2>

              <div>
                <label
                  htmlFor="first_name"
                  className="block text-white font-semibold mb-2"
                >
                  Имя *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
                  placeholder="Ваше имя"
                />
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="block text-white font-semibold mb-2"
                >
                  Фамилия *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
                  placeholder="Ваша фамилия"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-white font-semibold mb-2"
                >
                  Описание профиля
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none resize-none"
                  placeholder="Расскажите о себе..."
                />
              </div>
            </div>

            {/* Unified Rating */}
            <div className="brand-panel rounded-lg p-6 space-y-2">
              <h2 className="text-xl font-bold text-white mb-4">Рейтинг</h2>
              <div className="rounded-lg border border-amber-300/30 bg-amber-400/15 p-4 text-amber-50">
                Рейтинг устанавливается вручную администратором по ссылке на Lichess или Chess.com. До проверки используется стартовый рейтинг 1500, пожалуйста, дождитесь обработки заявки.
              </div>
            </div>

            {/* Social Links */}
            <div className="brand-panel rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">
                Ссылки на профили
              </h2>

              <div>
                <label
                  htmlFor="chesscom_url"
                  className="block text-white font-semibold mb-2"
                >
                  Chess.com профиль
                </label>
                <input
                  type="url"
                  id="chesscom_url"
                  name="chesscom_url"
                  value={formData.chesscom_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
                  placeholder="https://www.chess.com/member/username"
                />
              </div>

              <div>
                <label
                  htmlFor="lichess_url"
                  className="block text-white font-semibold mb-2"
                >
                  Lichess профиль
                </label>
                <input
                  type="url"
                  id="lichess_url"
                  name="lichess_url"
                  value={formData.lichess_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
                  placeholder="https://lichess.org/@/username"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="brand-button w-full py-4 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Сохранение..." : "Сохранить профиль"}
            </button>
          </form>
        </div>
      </div>
    </ChessBackground>
  )
}
