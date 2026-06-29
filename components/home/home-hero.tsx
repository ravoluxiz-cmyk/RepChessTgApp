"use client"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, CalendarDays, Send, ShoppingBag } from "lucide-react"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"

const TELEGRAM_URL = "https://t.me/RepChessKRD"

const HERO_BADGES = [
  { title: "Анонсы турниров", color: "#fff200" },
  { title: "Запись на события", color: "#20d66b" },
  { title: "Новости клуба", color: "#1357ff" },
  { title: "Мерч и лекции", color: "#ff1515" },
]

const QUICK_LINKS = [
  { title: "Расписание", href: "/tournaments", icon: CalendarDays },
  { title: "Мерч", href: "/merch", icon: ShoppingBag },
]

export function HomeHero() {
  const router = useRouter()
  const { initData, isReady } = useTelegramWebApp()

  useEffect(() => {
    if (!isReady || !initData) return

    const saveOnEnter = async () => {
      try {
        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${initData}`,
          },
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          console.error("Auto-save on enter failed:", response.status, err)
        }
      } catch (error) {
        console.error("Auto-save on enter error:", error)
      }
    }

    saveOnEnter()
  }, [isReady, initData])

  const handleAdminGate = useCallback(async () => {
    try {
      if (!initData) {
        const resp = await fetch("/api/admin/check")
        router.push(resp.ok ? "/admin" : "/admin/login")
        return
      }

      const resp = await fetch("/api/admin/check", {
        headers: { Authorization: `Bearer ${initData}` },
      })
      if (resp.ok) {
        router.push("/admin")
      } else {
        alert("Доступ запрещен")
      }
    } catch (error) {
      console.error("Admin gate failed:", error)
      alert("Ошибка проверки доступа")
    }
  }, [initData, router])

  return (
    <section className="flex min-h-[92svh] items-center py-7 sm:py-10">
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-4 left-4 z-40 hidden items-center gap-2 rounded-full border border-white/15 bg-[#f7f7f2] px-4 py-3 text-sm font-black uppercase text-[#151515] shadow-[0_16px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-white sm:inline-flex"
      >
        <Send className="h-4 w-4" />
        Telegram
      </a>

      <div className="relative w-full pt-4 text-center lg:text-left">
        <div className="brand-chip mx-auto mb-4 flex w-fit items-center gap-2 px-3 py-2 text-[0.68rem] font-bold uppercase sm:text-xs lg:mx-0">
          <span className="h-2 w-2 rounded-full bg-[#151515]" />
          Главный продукт — Telegram-канал
        </div>
        <div className="brand-sticker pointer-events-none absolute left-[4%] top-[22%] hidden h-8 w-24 rotate-[-8deg] bg-[#ff1515] opacity-90 md:block" />
        <h1 className="brand-wordmark mx-auto max-w-[980px] text-[clamp(3.1rem,14vw,8.5rem)] text-[#f7f7f2] lg:mx-0 lg:max-w-[780px]">
          <span className="lg:text-left">REP</span>
          <button
            type="button"
            className="brand-underlink inline-block cursor-pointer select-none text-[#f7f7f2] transition-colors hover:text-white/70 lg:text-left"
            onClick={handleAdminGate}
            aria-label="Открыть админку"
          >
            CHESS
          </button>
          <span className="lg:text-left">KRD</span>
        </h1>
        <h2 className="brand-title mx-auto mt-5 max-w-4xl text-2xl leading-none text-white sm:text-4xl lg:mx-0">
          Шахматы Краснодара живут в Telegram
        </h2>
        <p className="mx-auto mt-5 max-w-2xl px-2 text-sm font-semibold leading-relaxed text-white/70 sm:text-base lg:mx-0 lg:px-0">
          Подписывайся на @RepChessKRD: там первыми появляются турниры по шахматам в Краснодаре, запись, фотоотчеты, новости клуба, лекции и дропы мерча.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
          {HERO_BADGES.map((badge) => (
            <span key={badge.title} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-[0.66rem] font-black uppercase text-white/78 sm:text-xs">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: badge.color }} />
              {badge.title}
            </span>
          ))}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:max-w-2xl">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="brand-button inline-flex min-h-14 items-center justify-center gap-2 px-5 py-3 text-sm"
          >
            <Send className="h-5 w-5" />
            Перейти в Telegram-канал
          </a>
          <button
            type="button"
            onClick={() => router.push("/tournaments")}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black uppercase text-white transition hover:bg-white hover:text-[#151515]"
          >
            Расписание
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:max-w-xl">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-4 py-3 text-xs font-black uppercase text-white/72 transition hover:bg-white hover:text-[#151515]"
              >
                <Icon className="h-4 w-4" />
                {link.title}
              </a>
            )
          })}
        </div>

        <div className="mt-6 text-xs font-bold uppercase text-white/42">
          Сайт — витрина клуба. Telegram — место, где реально движется вся жизнь Rep Chess KRD.
        </div>
      </div>
    </section>
  )
}
