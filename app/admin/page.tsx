"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { Shield, PlusCircle, Archive, ArrowLeft, List, LogIn, LogOut, BarChart3, BadgeCheck, Building2 } from "lucide-react"

export default function AdminMainMenuPage() {
  const router = useRouter()
  const { initData } = useTelegramWebApp()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!initData) {
          // Dev fallback: try admin check without Authorization
          try {
            const resp = await fetch("/api/admin/check")
            setAuthorized(resp.ok)
            if (!resp.ok) setError("Откройте приложение через Telegram")
          } catch (e) {
            console.error("Admin check (dev fallback) failed", e)
            setAuthorized(false)
            setError("Откройте приложение через Telegram")
          }
          return
        }
        const resp = await fetch("/api/admin/check", {
          headers: { Authorization: `Bearer ${initData}` },
        })
        setAuthorized(resp.ok)
        if (!resp.ok) setError("Доступ запрещён")
      } catch (e) {
        console.error("Admin check failed", e)
        setAuthorized(false)
        setError("Ошибка проверки доступа")
      }
    }
    checkAdmin()
  }, [initData])

  const handleLogout = async () => {
    await fetch("/api/admin/web-logout", { method: "POST" }).catch(() => null)
    setAuthorized(false)
    router.push("/admin/login")
  }

  return (
    <ChessBackground>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/20 border-b border-white/10">
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 max-w-5xl mx-auto">
            <button
              className="flex items-center gap-2 text-white/80 hover:text-white"
              onClick={() => router.push("/")}
              title="Вернуться в главное меню"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Главное меню</span>
            </button>

            <div className="flex items-center gap-2 text-white/80">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="brand-font text-sm">Админ‑панель</span>
              {authorized && (
                <button
                  onClick={handleLogout}
                  className="ml-2 rounded-lg bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white"
                  title="Выйти из веб-админки"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Title */}
        <div className="px-3 sm:px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="brand-title text-3xl text-white sm:text-5xl lg:text-6xl">
              Выберите действие
            </h1>
            <p className="mt-2 text-white/60">Быстрые действия для управления турнирами</p>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 px-3 sm:px-4 py-4 sm:py-6">
          <div className="max-w-5xl mx-auto">
          {authorized === false && (
            <div className="backdrop-blur-lg bg-red-500/10 border border-red-400/30 rounded-2xl p-4 sm:p-6 text-white">
              <div className="font-bold mb-1">Нет доступа</div>
              <div className="text-white/80 mb-4">{error || "Проверка доступа не пройдена"}</div>
              <button
                onClick={() => router.push("/admin/login")}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
              >
                <LogIn className="w-4 h-4" /> Войти в веб-админку
              </button>
            </div>
          )}

          {authorized && (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Create Tournament */}
              <button
                onClick={() => router.push("/admin/tournaments/new")}
                className="brand-panel w-full rounded-lg p-5 text-left transition-all hover:border-white/30 sm:p-6"
              >
                <div className="flex items-center gap-3 text-white mb-2">
                  <PlusCircle className="w-6 h-6 text-emerald-400" />
                  <span className="text-lg sm:text-xl font-bold">Создать новый турнир</span>
                </div>
                <div className="text-white/70">Открыть форму создания турнира</div>
              </button>

              {/* Unified Tournaments */}
              <button
                onClick={() => router.push("/admin/tournaments")}
                className="brand-panel w-full rounded-lg p-5 text-left transition-all hover:border-white/30 sm:p-6"
                title="Единый список турниров с переключателем «Все/Мои»"
              >
                <div className="flex items-center gap-3 text-white mb-2">
                  <List className="w-6 h-6 text-violet-400" />
                  <span className="text-lg sm:text-xl font-bold">Турниры</span>
                </div>
                <div className="text-white/70">Откройте список и переключайтесь между «Все» и «Мои»</div>
              </button>

              {/* Archive */}
              <button
                onClick={() => router.push("/admin/tournaments/archive")}
                className="brand-panel w-full rounded-lg p-5 text-left transition-all hover:border-white/30 sm:p-6"
              >
                <div className="flex items-center gap-3 text-white mb-2">
                  <Archive className="w-6 h-6 text-amber-400" />
                  <span className="text-lg sm:text-xl font-bold">Архив завершённых турниров</span>
                </div>
                <div className="text-white/70">Просмотр архивных турниров</div>
              </button>

              <button
                onClick={() => router.push("/admin/rating-requests")}
                className="brand-panel w-full rounded-lg p-5 text-left transition-all hover:border-white/30 sm:p-6"
              >
                <div className="flex items-center gap-3 text-white mb-2">
                  <BadgeCheck className="w-6 h-6 text-cyan-400" />
                  <span className="text-lg sm:text-xl font-bold">Заявки рейтинга</span>
                </div>
                <div className="text-white/70">Проверка Lichess / Chess.com и ручное установление рейтинга</div>
              </button>

              <button
                onClick={() => router.push("/admin/partnership-requests")}
                className="brand-panel w-full rounded-lg p-5 text-left transition-all hover:border-white/30 sm:p-6"
              >
                <div className="flex items-center gap-3 text-white mb-2">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                  <span className="text-lg sm:text-xl font-bold">B2B-заявки</span>
                </div>
                <div className="text-white/70">Компании, площадки и партнерские мероприятия</div>
              </button>

              <button
                onClick={() => router.push("/admin/stats")}
                className="brand-panel w-full rounded-lg p-5 text-left transition-all hover:border-white/30 sm:p-6"
              >
                <div className="flex items-center gap-3 text-white mb-2">
                  <BarChart3 className="w-6 h-6 text-amber-400" />
                  <span className="text-lg sm:text-xl font-bold">Статистика</span>
                </div>
                <div className="text-white/70">Регистрации, посещаемость, заявки и спрос</div>
              </button>
            </div>
          )}
          </div>
        </main>
      </div>
    </ChessBackground>
  )
}
