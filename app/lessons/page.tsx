"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Clock, Copy, Send, Target, Trophy } from "lucide-react"
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
            <div className="brand-chip inline-flex items-center gap-2 rounded-none px-3 py-2">
              <Trophy className="h-5 w-5" />
              <span className="brand-font text-sm">Уроки</span>
            </div>
          </header>

          <main className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <section className="brand-panel rounded-none p-5 text-[#151515]">
              <h1 className="brand-title mb-6 text-3xl sm:text-5xl">Запись на урок</h1>

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
                        className={`border-2 px-3 py-3 text-left font-semibold ${
                          level === item ? "border-[#151515] bg-[#151515] text-white" : "border-[#151515] bg-white text-[#151515]"
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
                        className={`border-2 px-3 py-3 text-left font-semibold ${
                          format === item ? "border-[#151515] bg-[#151515] text-white" : "border-[#151515] bg-white text-[#151515]"
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
                        className={`border-2 px-3 py-3 text-left font-semibold ${
                          timeSlot === item ? "border-[#151515] bg-[#151515] text-white" : "border-[#151515] bg-white text-[#151515]"
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
                    className="w-full resize-none border-2 border-[#151515] bg-white px-3 py-3 text-[#151515] outline-none focus:bg-[#f4f4f0]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#151515]/60">Telegram или телефон</span>
                  <input
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    className="w-full border-2 border-[#151515] bg-white px-3 py-3 text-[#151515] outline-none focus:bg-[#f4f4f0]"
                    placeholder="@username"
                  />
                </label>
              </div>
            </section>

            <aside className="brand-panel rounded-none p-5 text-[#151515]">
              <h2 className="brand-title mb-4 text-2xl">Заявка</h2>
              <div className="border-2 border-[#151515] bg-white p-4 text-sm font-semibold text-[#151515]/80">
                <pre className="whitespace-pre-wrap font-sans">{requestText}</pre>
              </div>
              <button
                onClick={shareRequest}
                className="brand-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-none px-4 py-3"
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
