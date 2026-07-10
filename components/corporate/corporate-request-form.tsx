"use client"

import { FormEvent, useMemo, useState } from "react"

const FORMAT_OPTIONS = [
  "Корпоративный турнир",
  "Тимбилдинг",
  "Спартакиада",
  "Family day",
  "Внутренняя лига",
  "Обучение сотрудников",
  "Хочу обсудить варианты",
]

type CorporateRequestFormState = {
  name: string
  company: string
  contact: string
  email: string
  participants_count: string
  format_interest: string
  comment: string
}

const INITIAL_FORM: CorporateRequestFormState = {
  name: "",
  company: "",
  contact: "",
  email: "",
  participants_count: "",
  format_interest: FORMAT_OPTIONS[0],
  comment: "",
}

export function CorporateRequestForm() {
  const [form, setForm] = useState<CorporateRequestFormState>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const inputClass = useMemo(
    () => "w-full rounded-[14px] border border-[#151515]/14 bg-white px-3 py-3 text-[#151515] outline-none transition placeholder:text-[#151515]/35 focus:border-[#ff1515]/60 focus:bg-[#f7f7f2] focus:ring-2 focus:ring-[#ff1515]/20",
    []
  )

  function updateField<K extends keyof CorporateRequestFormState>(key: K, value: CorporateRequestFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    const participantsCount = form.participants_count ? Number(form.participants_count) : null
    if (participantsCount !== null && (!Number.isFinite(participantsCount) || participantsCount < 1)) {
      setError("Если указываете количество участников, число должно быть больше нуля.")
      setSaving(false)
      return
    }

    try {
      const response = await fetch("/api/corporate-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          contact: form.contact,
          email: form.email || null,
          participants_count: participantsCount,
          format_interest: form.format_interest,
          comment: form.comment || null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось отправить заявку. Проверьте контакт и попробуйте еще раз.")

      setMessage("Спасибо! Заявка отправлена. Мы свяжемся с вами и предложим формат под вашу задачу.")
      setForm(INITIAL_FORM)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить заявку. Проверьте контакт и попробуйте еще раз.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="brand-panel space-y-4 p-5 text-[#151515] sm:p-6">
      {message && (
        <div className="flex gap-3 rounded-[14px] border border-[#20d66b]/35 bg-[#20d66b]/12 p-4 text-sm font-bold leading-relaxed text-[#151515]">
          <span className="brand-font flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#20d66b] text-[0.6rem] text-[#151515]">
            OK
          </span>
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="flex gap-3 rounded-[14px] border border-[#ff1515]/35 bg-[#ff1515]/10 p-4 text-sm font-bold leading-relaxed text-[#151515]">
          <span className="brand-font flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff1515] text-sm text-white">
            !
          </span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-black uppercase text-[#151515]/70">Имя *</span>
          <input
            required
            autoComplete="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={inputClass}
            placeholder="Как к вам обращаться"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-black uppercase text-[#151515]/70">Компания *</span>
          <input
            required
            autoComplete="organization"
            value={form.company}
            onChange={(event) => updateField("company", event.target.value)}
            className={inputClass}
            placeholder="Название компании"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-black uppercase text-[#151515]/70">Telegram / телефон *</span>
          <input
            required
            autoComplete="tel"
            value={form.contact}
            onChange={(event) => updateField("contact", event.target.value)}
            className={inputClass}
            placeholder="@username или номер"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-black uppercase text-[#151515]/70">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={inputClass}
            placeholder="Для КП и документов"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-black uppercase text-[#151515]/70">Формат</span>
          <select
            value={form.format_interest}
            onChange={(event) => updateField("format_interest", event.target.value)}
            className={inputClass}
          >
            {FORMAT_OPTIONS.map((format) => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-black uppercase text-[#151515]/70">Участников</span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={form.participants_count}
            onChange={(event) => updateField("participants_count", event.target.value)}
            className={inputClass}
            placeholder="Например, 30"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-black uppercase text-[#151515]/70">Комментарий</span>
        <textarea
          rows={5}
          value={form.comment}
          onChange={(event) => updateField("comment", event.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="Дата, площадка, задача события, пожелания"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="brand-button inline-flex min-h-14 w-full items-center justify-center gap-2 px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Отправка..." : "Отправить заявку"}
      </button>
    </form>
  )
}
