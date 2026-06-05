"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { ArrowLeft, Building2, Send } from "lucide-react"

const FORMATS = ["Турнир", "Корпоратив", "Лекция", "Обучение", "Фестивальный спот", "Другое"]

export default function PartnersPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    company: "",
    contact: "",
    format: FORMATS[0],
    people_count: "",
    comment: "",
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch("/api/partnership-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          people_count: form.people_count ? Number(form.people_count) : null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось отправить заявку")

      setMessage("Заявка отправлена. Мы свяжемся с вами по указанному контакту.")
      setForm({ name: "", company: "", contact: "", format: FORMATS[0], people_count: "", comment: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить заявку")
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full rounded-2xl border border-[#151515]/15 bg-white px-3 py-3 text-[#151515] outline-none focus:bg-[#f4f4f0]"

  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <button onClick={() => router.push("/")} className="mb-6 inline-flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            Главное меню
          </button>

          <div className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
            <div className="brand-bg-illustration pointer-events-none absolute -right-24 -bottom-16 h-72 w-96 opacity-[0.08]" />
            <div className="brand-chip mb-4 w-fit px-3 py-1 text-xs font-black uppercase">
              Для компаний и площадок
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="mt-1 h-8 w-8 text-white" />
              <div>
                <h1 className="brand-title text-3xl sm:text-5xl">Провести мероприятие с Rep Chess KRD</h1>
                <p className="mt-3 max-w-2xl text-white/62">
                  Турниры, корпоративы, лекции и шахматные pop-up форматы для площадок и команд.
                </p>
              </div>
            </div>
          </div>

          {message && <div className="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-500/15 p-4 text-emerald-100">{message}</div>}
          {error && <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/15 p-4 text-red-100">{error}</div>}

          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <form onSubmit={submit} className="brand-panel space-y-4 rounded-[18px] p-5 text-[#151515]">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-semibold">Имя</span>
                  <input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-2 block font-semibold">Компания / площадка</span>
                  <input required value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} className={inputClass} />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block font-semibold">Telegram / телефон</span>
                <input required value={form.contact} onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))} className={inputClass} />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-semibold">Формат</span>
                  <select value={form.format} onChange={(e) => setForm((prev) => ({ ...prev, format: e.target.value }))} className={inputClass}>
                    {FORMATS.map((format) => <option key={format} value={format}>{format}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block font-semibold">Примерное количество человек</span>
                  <input type="number" min="1" value={form.people_count} onChange={(e) => setForm((prev) => ({ ...prev, people_count: e.target.value }))} className={inputClass} />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block font-semibold">Комментарий</span>
                <textarea rows={5} value={form.comment} onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))} className={`${inputClass} resize-none`} />
              </label>

              <button disabled={saving} className="brand-button inline-flex w-full items-center justify-center gap-2 px-4 py-3 disabled:opacity-60">
                <Send className="h-5 w-5" />
                {saving ? "Отправка..." : "Отправить заявку"}
              </button>
            </form>

            <aside className="brand-panel-dark rounded-[18px] p-5">
              <div className="brand-font text-xl text-white">Форматы</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {FORMATS.slice(0, 5).map((format, index) => (
                  <span
                    key={format}
                    className={`rounded-full px-3 py-2 text-sm font-bold ${
                      index % 3 === 0
                        ? "bg-white text-[#151515]"
                        : index % 3 === 1
                          ? "bg-[#fff200] text-[#151515]"
                          : "bg-[#1357ff] text-white"
                    }`}
                  >
                    {format}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm leading-relaxed text-white/62">
                Заявка попадает в админку, где ее можно обработать как коммерческий лид.
              </p>
            </aside>
          </div>
        </div>
      </main>
    </ChessBackground>
  )
}
