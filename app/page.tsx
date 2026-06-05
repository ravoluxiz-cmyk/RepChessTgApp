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
          <div className="w-full">
            <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase text-white/65">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="h-2 w-2 rounded-full bg-yellow-300" />
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Краснодарский шахматный клуб
            </div>
            <h1 className="brand-wordmark mx-auto max-w-[980px] text-[4.5rem] text-white sm:text-[7rem] md:text-[9.5rem] lg:text-[12rem]">
              <span>REP</span>
              <button
                type="button"
                className="inline-block cursor-pointer select-none text-white transition-colors hover:text-blue-400"
                onClick={handleAdminGate}
                aria-label="Открыть админку"
              >
                CHESS
              </button>
              <span>KRD</span>
            </h1>
            <div className="brand-accent-line mx-auto mt-5 h-1 w-full max-w-[760px]" />
          </div>

          <div className="grid w-full max-w-3xl grid-cols-1 gap-3 px-2 sm:grid-cols-2">
            <HoverButton
              className="flex min-h-16 items-center justify-center gap-3"
              onClick={() => router.push('/merch')}
            >
              <ShoppingBag className="w-7 h-7 text-white flex-shrink-0" />
              <span className="text-lg sm:text-xl">
                Купить мерч
              </span>
            </HoverButton>

            <HoverButton
              className="flex min-h-16 items-center justify-center gap-3"
              onClick={() => router.push('/tournaments')}
            >
              <Calendar className="w-7 h-7 text-white flex-shrink-0" />
              <span className="text-lg sm:text-xl">
                Расписание турниров
              </span>
            </HoverButton>

            <HoverButton
              className="flex min-h-16 items-center justify-center gap-3"
              onClick={() => router.push('/lessons')}
            >
              <GraduationCap className="w-7 h-7 text-white flex-shrink-0" />
              <span className="text-lg sm:text-xl">
                Запись на урок
              </span>
            </HoverButton>

            <HoverButton
              className="flex min-h-16 items-center justify-center gap-3"
              onClick={() => router.push('/partners')}
            >
              <Building2 className="w-7 h-7 text-white flex-shrink-0" />
              <span className="text-lg sm:text-xl">
                Для компаний
              </span>
            </HoverButton>

            <HoverButton
              className="flex min-h-16 items-center justify-center gap-3 sm:col-span-2"
              onClick={() => router.push('/profile')}
            >
              <User className="w-7 h-7 text-white flex-shrink-0" />
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
