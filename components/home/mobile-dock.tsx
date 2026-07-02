"use client"

import { useRouter } from "next/navigation"

const TELEGRAM_URL = "https://t.me/RepChessKRD"

export function MobileDock() {
  const router = useRouter()

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-1 rounded-[20px] border border-white/15 bg-[#111]/92 p-2 text-white shadow-[0_18px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:hidden" aria-label="Быстрая навигация">
      <button type="button" onClick={() => router.push("/tournaments")} className="flex min-h-12 items-center justify-center rounded-2xl text-[0.68rem] font-black uppercase text-white/76 transition hover:bg-white/10 hover:text-white">
        Турниры
      </button>
      <button type="button" onClick={() => router.push("/merch")} className="flex min-h-12 items-center justify-center rounded-2xl text-[0.68rem] font-black uppercase text-white/76 transition hover:bg-white/10 hover:text-white">
        Мерч
      </button>
      <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center rounded-2xl bg-white text-[0.68rem] font-black uppercase text-[#151515]">
        TG
      </a>
      <button type="button" onClick={() => router.push("/profile")} className="flex min-h-12 items-center justify-center rounded-2xl text-[0.68rem] font-black uppercase text-white/76 transition hover:bg-white/10 hover:text-white">
        Профиль
      </button>
    </nav>
  )
}
