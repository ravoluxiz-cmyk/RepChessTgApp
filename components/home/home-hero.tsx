"use client"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Send } from "lucide-react"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { BrandPawn } from "./brand-pawn"

const TELEGRAM_URL = "https://t.me/RepChessKRD"

const HERO_BADGES = [
  { title: "Турниры", color: "#fff200" },
  { title: "Новички", color: "#20d66b" },
  { title: "Комьюнити", color: "#1357ff" },
  { title: "Лекции / мерч", color: "#ff1515" },
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
    <section className="grid min-h-[92svh] items-center gap-8 py-7 sm:py-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_430px]">
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
          Городское шахматное комьюнити
        </div>
        <div className="brand-sticker pointer-events-none absolute left-[4%] top-[20%] hidden h-10 w-24 rotate-[-8deg] bg-[#ff1515] opacity-90 md:block" />
        <h1 className="brand-wordmark mx-auto max-w-[980px] text-[clamp(3.3rem,15vw,9.4rem)] text-[#f7f7f2] lg:mx-0 lg:max-w-[760px]">
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
        <h2 className="brand-title mx-auto mt-5 max-w-3xl text-2xl leading-none text-white sm:text-4xl lg:mx-0">
          Шахматы, которые не пахнут пылью
        </h2>
        <p className="mx-auto mt-5 max-w-2xl px-2 text-sm font-semibold leading-relaxed text-white/68 sm:text-base lg:mx-0 lg:px-0">
          Турниры, лекции, новички, барные вечера и городское комьюнити в Краснодаре. Сайт — витрина, Telegram — пульс клуба.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
          {HERO_BADGES.map((badge) => (
            <span key={badge.title} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-[0.66rem] font-black uppercase text-white/78 sm:text-xs">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: badge.color }} />
              {badge.title}
            </span>
          ))}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
          <button
            type="button"
            onClick={() => router.push("/tournaments")}
            className="brand-button inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-sm"
          >
            Записаться на событие
            <ArrowRight className="h-5 w-5" />
          </button>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black uppercase text-white transition hover:bg-white hover:text-[#151515]"
          >
            <Send className="h-5 w-5" />
            Перейти в Telegram
          </a>
        </div>

        <div className="mt-6 text-xs font-bold uppercase text-white/42">
          Нормально, если ты не знаешь, что такое швейцарка. Приходи за 10 минут, объясним.
        </div>
      </div>

      <BrandPawn />
    </section>
  )
}
