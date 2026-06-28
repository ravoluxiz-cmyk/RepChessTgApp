"use client"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Calendar, GraduationCap, Newspaper, Send, ShoppingBag, User } from "lucide-react"
import { HoverButton } from "@/components/ui/hover-button"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"

const TELEGRAM_URL = "https://t.me/RepChessKRD"

const ACTIONS = [
  { label: "Купить мерч", href: "/merch", icon: ShoppingBag, tone: "red" },
  { label: "Турниры", href: "/tournaments", icon: Calendar, tone: "yellow" },
  { label: "Уроки", href: "/lessons", icon: GraduationCap, tone: "blue" },
  { label: "Компаниям", href: "/partners", icon: Building2, tone: "green" },
  { label: "Клуб", href: "/club", icon: Newspaper, tone: "white" },
  { label: "Профиль", href: "/profile", icon: User, tone: "white" },
]

function actionAccent(tone: string) {
  if (tone === "red") return "after:bg-[#ff1515]"
  if (tone === "yellow") return "after:bg-[#fff200]"
  if (tone === "blue") return "after:bg-[#1357ff]"
  if (tone === "green") return "after:bg-[#20d66b]"
  return "after:bg-white/30"
}

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
    <section className="flex min-h-[92svh] flex-col justify-center gap-7 py-7 sm:gap-9 sm:py-10">
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-4 left-4 z-40 hidden items-center gap-2 rounded-full border border-white/15 bg-[#f7f7f2] px-4 py-3 text-sm font-black uppercase text-[#151515] shadow-[0_16px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-white sm:inline-flex"
      >
        <Send className="h-4 w-4" />
        Telegram
      </a>

      <div className="relative w-full pt-4 text-center sm:pt-10">
        <div className="brand-chip mx-auto mb-4 flex w-fit items-center gap-2 px-3 py-2 text-[0.68rem] font-bold uppercase sm:text-xs">
          <span className="h-2 w-2 rounded-full bg-[#151515]" />
          Шахматы в Telegram и Краснодаре
        </div>
        <div className="brand-sticker pointer-events-none absolute left-[4%] top-[23%] hidden h-10 w-24 rotate-[-8deg] bg-[#ff1515] opacity-90 md:block" />
        <div className="brand-sticker pointer-events-none absolute right-[5%] top-[24%] hidden h-10 w-24 rotate-[7deg] bg-[#fff200] opacity-95 md:block" />
        <h1 className="brand-wordmark mx-auto max-w-[980px] text-[clamp(3.85rem,18vw,12rem)] text-[#f7f7f2]">
          <span>REP</span>
          <button
            type="button"
            className="brand-underlink inline-block cursor-pointer select-none text-[#f7f7f2] transition-colors hover:text-white/70"
            onClick={handleAdminGate}
            aria-label="Открыть админку"
          >
            CHESS
          </button>
          <span>KRD</span>
        </h1>
        <div className="brand-accent-line mx-auto mt-5 w-full max-w-[420px]" />
        <p className="mx-auto mt-5 max-w-2xl px-2 text-sm font-semibold leading-relaxed text-white/68 sm:text-base">
          Клубные турниры, уроки, мерч и комьюнити. Основная жизнь клуба идет в Telegram, а сайт помогает быстро записаться, найти расписание и посмотреть, что происходит.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-3xl grid-cols-2 items-stretch gap-3 px-1 sm:grid-cols-3 sm:gap-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <HoverButton
              key={action.href}
              className={`group min-h-[86px] !rounded-[18px] !px-3 !py-3 after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:content-[''] ${actionAccent(action.tone)} sm:min-h-[96px]`}
              onClick={() => router.push(action.href)}
            >
              <span className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 text-center">
                <Icon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
                <span className="text-[0.76rem] leading-tight sm:text-sm md:text-base">{action.label}</span>
              </span>
            </HoverButton>
          )
        })}
      </div>

      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noreferrer"
        className="mx-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black uppercase text-white transition hover:bg-white hover:text-[#151515] sm:hidden"
      >
        <Send className="h-4 w-4" />
        Перейти в Telegram
      </a>
    </section>
  )
}
