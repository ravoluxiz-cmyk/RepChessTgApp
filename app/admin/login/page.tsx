"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, LogIn } from "lucide-react"
import ChessBackground from "@/components/ChessBackground"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/web-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (response.status === 503) {
        throw new Error("Пароль веб-админки не настроен в Vercel")
      }

      if (!response.ok) {
        throw new Error("Неверный пароль")
      }

      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ChessBackground>
      <div className="min-h-screen w-full px-4 py-6">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          <button
            onClick={() => router.push("/")}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Главная</span>
          </button>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-white/10 bg-white/5 p-6 text-white backdrop-blur-lg"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-400/15 p-3">
                <Lock className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Вход в админку</h1>
                <p className="text-sm text-white/60">Веб-доступ для управления турнирами</p>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/70">Пароль</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-emerald-300"
                autoComplete="current-password"
                required
              />
            </label>

            {error && (
              <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/15 p-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-bold text-black transition-colors hover:bg-white/90 disabled:opacity-60"
            >
              <LogIn className="h-5 w-5" />
              {loading ? "Проверяю..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </ChessBackground>
  )
}
