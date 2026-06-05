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

  const inputClass = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-emerald-300"

  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <button onClick={() => router.push("/")} className="mb-6 inline-flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            Главное меню
          </button>

          <div className="mb-6 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-emerald-300" />
            <h1 className="text-3xl font-black sm:text-5xl">Провести мероприятие с Rep Chess</h1>
          </div>

          {message && <div className="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-500/15 p-4 text-emerald-100">{message}</div>}
          {error && <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/15 p-4 text-red-100">{error}</div>}

          <form onSubmit={submit} className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
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

            <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-black text-black hover:bg-gray-200 disabled:opacity-60">
              <Send className="h-5 w-5" />
              {saving ? "Отправка..." : "Отправить заявку"}
            </button>
          </form>
        </div>
      </main>
    </ChessBackground>
  )
}
