"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"

type Mode = "login" | "register"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [nextPath, setNextPath] = useState("/profile")
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const next = params.get("next")
    if (next?.startsWith("/")) setNextPath(next)
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "Не удалось войти")
      }

      router.push(nextPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center justify-center">
          <section className="grid w-full overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.06] shadow-[0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl md:grid-cols-[1fr_0.9fr]">
            <div className="relative min-h-72 border-b border-white/10 p-6 sm:p-8 md:border-b-0 md:border-r">
              <div className="brand-bg-icons pointer-events-none absolute -right-20 -top-24 h-72 w-72 opacity-[0.08]" />
              <h1 className="brand-title text-4xl leading-none sm:text-6xl">
                Профиль Rep Chess KRD
              </h1>
              <p className="mt-5 max-w-xl text-base font-semibold leading-relaxed text-white/62 sm:text-lg">
                Создай логин и пароль, чтобы заходить в карточку игрока из обычного браузера. Рейтинг, статус и история партий будут привязаны к одному профилю.
              </p>
              <div className="mt-8 grid gap-3 text-sm font-black uppercase text-white/68 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4">Рейтинг</div>
                <div className="rounded-2xl bg-white/10 p-4">История</div>
                <div className="rounded-2xl bg-white/10 p-4">Статус</div>
              </div>
            </div>

            <form onSubmit={submit} className="bg-[#f4f3ee] p-5 text-[#151515] sm:p-7">
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-[#151515]/8 p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-full px-4 py-3 text-sm font-black uppercase transition ${mode === "login" ? "bg-[#151515] text-white" : "text-[#151515]/60"}`}
                >
                  Вход
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`rounded-full px-4 py-3 text-sm font-black uppercase transition ${mode === "register" ? "bg-[#151515] text-white" : "text-[#151515]/60"}`}
                >
                  Регистрация
                </button>
              </div>

              <h2 className="brand-font text-3xl leading-none">
                {mode === "login" ? "Войти в профиль" : "Создать профиль"}
              </h2>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-black uppercase text-[#151515]/64">Логин</span>
                  <input
                    value={login}
                    onChange={(event) => setLogin(event.target.value)}
                    autoComplete="username"
                    required
                    placeholder="repchess_player"
                    className="w-full rounded-2xl border border-[#151515]/12 bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#151515]/45"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black uppercase text-[#151515]/64">Пароль</span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                    minLength={8}
                    placeholder="Минимум 8 символов"
                    className="w-full rounded-2xl border border-[#151515]/12 bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#151515]/45"
                  />
                </label>

                {mode === "register" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-black uppercase text-[#151515]/64">Имя</span>
                      <input
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        autoComplete="given-name"
                        required
                        className="w-full rounded-2xl border border-[#151515]/12 bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#151515]/45"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-black uppercase text-[#151515]/64">Фамилия</span>
                      <input
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        autoComplete="family-name"
                        required
                        className="w-full rounded-2xl border border-[#151515]/12 bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#151515]/45"
                      />
                    </label>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex min-h-14 w-full items-center justify-center rounded-full bg-[#151515] px-5 py-3 text-sm font-black uppercase text-white transition hover:bg-black disabled:opacity-55"
              >
                {loading ? "Подождите..." : mode === "login" ? "Войти" : "Создать и войти"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-3 flex min-h-12 w-full items-center justify-center rounded-full border border-[#151515]/12 px-5 py-3 text-sm font-black uppercase text-[#151515]/72 transition hover:border-[#151515]/30 hover:text-[#151515]"
              >
                На главную
              </button>
            </form>
          </section>
        </div>
      </main>
    </ChessBackground>
  )
}
