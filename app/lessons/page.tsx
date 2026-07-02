"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Clock, Copy, Send, Target } from "lucide-react"
import ChessBackground from "@/components/ChessBackground"

const levels = ["Начинаю", "Играю турниры", "Хочу готовиться серьезно"]
const formats = ["Индивидуально", "Пара", "Группа"]
const timeSlots = ["Будни утром", "Будни вечером", "Выходные"]

export default function LessonsPage() {
  const router = useRouter()
  const [canShare, setCanShare] = useState(false)
  const [level, setLevel] = useState(levels[0])
  const [format, setFormat] = useState(formats[0])
  const [timeSlot, setTimeSlot] = useState(timeSlots[1])
  const [goal, setGoal] = useState("Подтянуть дебюты и расчет вариантов")
  const [contact, setContact] = useState("")
  const [copied, setCopied] = useState(false)

  const requestText = useMemo(() => [
    "Заявка на урок REP CHESS KRD",
    `Уровень: ${level}`,
    `Формат: ${format}`,
    `Время: ${timeSlot}`,
    `Цель: ${goal}`,
    contact ? `Контакт: ${contact}` : null,
  ].filter(Boolean).join("\n"), [contact, format, goal, level, timeSlot])

  useEffect(() => {
    setCanShare(Boolean(navigator.share))
  }, [])

  const shareRequest = async () => {
    setCopied(false)
    try {
      localStorage.setItem("lesson_request", requestText)
      if (navigator.share) {
        await navigator.share({ title: "Заявка на урок REP CHESS KRD", text: requestText })
        return
      }
      await navigator.clipboard.writeText(requestText)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <ChessBackground>
      <div className="min-h-screen w-full px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <header className="flex items-center justify-between gap-3">
            <button
              onClick={() => router.push("/")}
              className="brand-underlink inline-flex items-center gap-2 px-3 py-2 text-white transition-colors hover:text-white/70"
              aria-label="Назад"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Главная</span>
            </button>
          </header>

          <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
            <div className="brand-bg-illustration pointer-events-none absolute -right-24 -bottom-20 h-72 w-96 opacity-[0.08]" />
            <h1 className="brand-title text-4xl text-white sm:text-6xl">Запись на урок</h1>
            <p className="mt-4 max-w-2xl text-white/62">
              Оставь заявку на урок шахмат: уровень, удобное время и что хочется подтянуть.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-2 text-sm font-black text-[#151515]">Индивидуально</span>
              <span className="rounded-full bg-[#fff200] px-3 py-2 text-sm font-black text-[#151515]">Группа</span>
              <span className="rounded-full bg-[#1357ff] px-3 py-2 text-sm font-black text-white">Подготовка</span>
            </div>
          </section>

          <main className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <section className="brand-panel rounded-[18px] p-5 text-[#151515]">
              <h2 className="brand-title mb-6 text-3xl sm:text-5xl">Параметры</h2>

              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#151515]/60">
                    <Target className="h-4 w-4" />
                    Уровень
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {levels.map((item) => (
                      <button
                        key={item}
                        onClick={() => setLevel(item)}
                        className={`rounded-2xl border px-3 py-3 text-left font-semibold ${
                          level === item ? "border-[#151515] bg-[#151515] text-white" : "border-[#151515]/15 bg-white text-[#151515]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-[#151515]/60">Формат</div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {formats.map((item) => (
                      <button
                        key={item}
                        onClick={() => setFormat(item)}
                        className={`rounded-2xl border px-3 py-3 text-left font-semibold ${
                          format === item ? "border-[#151515] bg-[#151515] text-white" : "border-[#151515]/15 bg-white text-[#151515]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#151515]/60">
                    <Clock className="h-4 w-4" />
                    Время
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {timeSlots.map((item) => (
                      <button
                        key={item}
                        onClick={() => setTimeSlot(item)}
                        className={`rounded-2xl border px-3 py-3 text-left font-semibold ${
                          timeSlot === item ? "border-[#151515] bg-[#151515] text-white" : "border-[#151515]/15 bg-white text-[#151515]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#151515]/60">Цель</span>
                  <textarea
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-[#151515]/15 bg-white px-3 py-3 text-[#151515] outline-none focus:bg-[#f4f4f0]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#151515]/60">Telegram или телефон</span>
                  <input
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    className="w-full rounded-2xl border border-[#151515]/15 bg-white px-3 py-3 text-[#151515] outline-none focus:bg-[#f4f4f0]"
                    placeholder="@username"
                  />
                </label>
              </div>
            </section>

            <aside className="brand-panel rounded-[18px] p-5 text-[#151515]">
              <h2 className="brand-title mb-4 text-2xl">Заявка</h2>
              <div className="rounded-2xl border border-[#151515]/10 bg-white p-4 text-sm font-semibold text-[#151515]/80">
                <pre className="whitespace-pre-wrap font-sans">{requestText}</pre>
              </div>
              <button
                onClick={shareRequest}
                className="brand-button mt-4 inline-flex w-full items-center justify-center gap-2 px-4 py-3"
              >
                {copied ? <Check className="h-5 w-5" /> : canShare ? <Send className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                {copied ? "Заявка скопирована" : "Отправить заявку"}
              </button>
            </aside>
          </main>
        </div>
      </div>
    </ChessBackground>
  )
}
