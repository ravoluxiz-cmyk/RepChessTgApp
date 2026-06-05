"use client"

import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground";
import { HoverButton } from "@/components/ui/hover-button";
import { Building2, ShoppingBag, Calendar, GraduationCap, User } from "lucide-react";
import { useEffect, useCallback } from "react"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"

export default function Home() {
  const router = useRouter()
  const { initData, isReady } = useTelegramWebApp()

  // Автосохранение базовых данных пользователя при входе в мини‑приложение
  useEffect(() => {
    if (!isReady) return
    if (!initData) return

    const saveOnEnter = async () => {
      try {
        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${initData}`,
          },
        })

        if (!response.ok) {
          // Не прерываем UX, просто логируем ошибку
          const err = await response.json().catch(() => ({}))
          console.error("Auto-save on enter failed:", response.status, err)
          return
        }

        await response.json()
        // Профиль успешно сохранён
      } catch (e) {
        console.error("Auto-save on enter error:", e)
      }
    }

    saveOnEnter()
  }, [isReady, initData])


  const handleAdminGate = useCallback(async () => {
    try {
      if (!initData) {
        const resp = await fetch("/api/admin/check")
        if (resp.ok) {
          router.push("/admin")
        } else {
          router.push("/admin/login")
        }
        return
      }
      const resp = await fetch("/api/admin/check", {
        headers: { Authorization: `Bearer ${initData}` },
      })
      if (resp.ok) {
        router.push("/admin")
      } else {
        alert("Доступ запрещён")
      }
    } catch (e) {
      console.error("Admin gate failed:", e)
      alert("Ошибка проверки доступа")
    }
  }, [initData, router])

  return (
    <ChessBackground>

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 text-center">
        <div className="flex min-h-screen flex-col items-center justify-center gap-7 py-8 sm:gap-9">
          <div className="relative w-full pt-8 sm:pt-12">
            <div className="brand-chip mx-auto mb-5 flex w-fit items-center gap-2 px-3 py-2 text-xs font-bold uppercase">
              <span className="h-2 w-2 bg-[#151515]" />
              Краснодарский шахматный клуб
            </div>
            <div className="brand-sticker pointer-events-none absolute left-[7%] top-[18%] hidden h-10 w-24 rotate-[-8deg] bg-[#ff1515] opacity-90 md:block" />
            <div className="brand-sticker pointer-events-none absolute right-[8%] top-[22%] hidden h-10 w-24 rotate-[7deg] bg-[#fff200] opacity-95 md:block" />
            <h1 className="brand-wordmark mx-auto max-w-[980px] text-[4.5rem] text-[#f7f7f2] sm:text-[7rem] md:text-[9.5rem] lg:text-[12rem]">
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
          </div>

          <div className="grid w-full max-w-3xl grid-cols-1 gap-4 px-2 sm:grid-cols-2">
            <HoverButton
              className="flex min-h-16 items-center justify-center gap-3"
              onClick={() => router.push('/merch')}
            >
              <ShoppingBag className="w-7 h-7 flex-shrink-0" />
              <span className="text-lg sm:text-xl">
                Купить мерч
              </span>
            </HoverButton>

            <HoverButton
              className="flex min-h-16 items-center justify-center gap-3"
              onClick={() => router.push('/tournaments')}
            >
              <Calendar className="w-7 h-7 flex-shrink-0" />
              <span className="text-lg sm:text-xl">
                Расписание турниров
              </span>
            </HoverButton>

            <HoverButton
              className="flex min-h-16 items-center justify-center gap-3"
              onClick={() => router.push('/lessons')}
            >
              <GraduationCap className="w-7 h-7 flex-shrink-0" />
              <span className="text-lg sm:text-xl">
                Запись на урок
              </span>
            </HoverButton>

            <HoverButton
              className="flex min-h-16 items-center justify-center gap-3"
              onClick={() => router.push('/partners')}
            >
              <Building2 className="w-7 h-7 flex-shrink-0" />
              <span className="text-lg sm:text-xl">
                Для компаний
              </span>
            </HoverButton>

            <HoverButton
              className="flex min-h-16 items-center justify-center gap-3 sm:col-span-2"
              onClick={() => router.push('/profile')}
            >
              <User className="w-7 h-7 flex-shrink-0" />
              <span className="text-lg sm:text-xl">
                Мой профиль
              </span>
            </HoverButton>
          </div>
        </div>
      </div>
    </ChessBackground>
  );
}
