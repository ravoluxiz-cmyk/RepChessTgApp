"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { ArrowLeft, Building2, Send } from "lucide-react"

const FORMATS = ["Турнир", "Корпоратив", "Лекция", "Обучение", "Фестивальный спот", "Другое"]

const FORMAT_CARDS = [
  {
    title: "Турнир",
    text: "Классический шахматный вечер с сеткой, часами, ведущим и понятным регламентом. Подходит для баров, кофеен, городских площадок и клубных событий.",
  },
  {
    title: "Корпоратив",
    text: "Шахматный вечер для команды: турнир, свободная игра, мини-лекция, квиз или смешанный формат. Подходит для компаний, которые хотят интеллектуальное событие без душного официоза.",
  },
  {
    title: "Лекция",
    text: "Живая шахматная лекция нормальным языком: история, партии, идеи, разборы, вопросы и обсуждение.",
  },
  {
    title: "Обучение",
    text: "Формат для начинающих: объясняем правила, часы, базовые идеи и спокойно ведем людей через первые партии.",
  },
  {
    title: "Фестивальный спот",
    text: "Шахматная зона на фестивале, маркете или городском событии: свободная игра, быстрые задачки, короткие турниры, ведущий и визуальная активность для гостей.",
  },
]

const WE_HANDLE = [
  "привозим игровой инвентарь",
  "готовим формат и регламент",
  "ведем событие",
  "готовим анонс",
  "объясняем правила участникам",
  "считаем результаты",
  "делаем событие понятным даже для тех, кто давно не играл",
]

const VENUE_NEEDS = [
  "столы и стулья",
  "нормальный свет",
  "место под игроков",
  "фиксированный гонорар за проведение",
  "возможность заранее согласовать время и формат",
  "контакт ответственного человека на площадке",
]

const FITS_FOR = [
  "бары и кофейни",
  "компании и IT-команды",
  "торговые центры",
  "ЖК и управляющие компании",
  "фестивали и городские события",
  "креативные пространства",
]

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

    const peopleCount = form.people_count ? Number(form.people_count) : null
    if (peopleCount !== null && (!Number.isFinite(peopleCount) || peopleCount < 1)) {
      setError("Если указываешь количество человек, оно должно быть больше нуля.")
      setSaving(false)
      return
    }

    try {
      const response = await fetch("/api/partnership-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          people_count: peopleCount,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось отправить заявку. Проверь контакт и попробуй еще раз.")

      setMessage("Заявка отправлена. Мы свяжемся с вами по указанному контакту.")
      setForm({ name: "", company: "", contact: "", format: FORMATS[0], people_count: "", comment: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить заявку. Проверь контакт и попробуй еще раз.")
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full rounded-2xl border border-[#151515]/15 bg-white px-3 py-3 text-[#151515] outline-none focus:bg-[#f4f4f0]"

  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <button onClick={() => router.push("/")} className="mb-6 inline-flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            Главное меню
          </button>

          <div className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
            <div className="brand-bg-illustration pointer-events-none absolute -right-24 -bottom-16 h-72 w-96 opacity-[0.08]" />
            <div className="flex items-start gap-3">
              <Building2 className="mt-1 h-8 w-8 text-white" />
              <div>
                <h1 className="brand-title text-3xl sm:text-5xl">Провести мероприятие с Rep Chess KRD</h1>
                <p className="mt-3 max-w-2xl text-white/62">
                  Организуем шахматное событие для площадки, офиса или фестиваля. Привозим инвентарь, готовим анонс, ведем игру и собираем понятный формат под гостей.
                </p>
                <a href="/corporate" className="mt-4 inline-flex text-sm font-black uppercase text-white/72 transition hover:text-white">
                  Новый раздел для компаний →
                </a>
              </div>
            </div>
          </div>

          <section className="mb-6 grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-5">
            {FORMAT_CARDS.map((item) => (
              <article key={item.title} className="brand-panel-dark flex h-full min-h-[250px] flex-col rounded-[18px] p-5">
                <h2 className="brand-font min-h-[58px] text-lg leading-none text-white xl:text-xl">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/62">{item.text}</p>
              </article>
            ))}
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-3">
            <div className="brand-panel rounded-[18px] p-5">
              <h2 className="brand-font text-2xl text-[#151515]">Что мы берем на себя</h2>
              <ul className="mt-4 space-y-2 text-sm font-semibold leading-relaxed text-[#151515]/68">
                {WE_HANDLE.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
            <div className="brand-panel rounded-[18px] p-5">
              <h2 className="brand-font text-2xl text-[#151515]">Что нужно от площадки</h2>
              <ul className="mt-4 space-y-2 text-sm font-semibold leading-relaxed text-[#151515]/68">
                {VENUE_NEEDS.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
            <div className="brand-panel rounded-[18px] p-5">
              <h2 className="brand-font text-2xl text-[#151515]">Для кого подходит</h2>
              <ul className="mt-4 space-y-2 text-sm font-semibold leading-relaxed text-[#151515]/68">
                {FITS_FOR.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
          </section>

          {message && <div className="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-500/15 p-4 text-emerald-100">{message}</div>}
          {error && <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/15 p-4 text-red-100">{error}</div>}

          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <form onSubmit={submit} className="brand-panel space-y-4 rounded-[18px] p-5 text-[#151515]">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-semibold">Имя</span>
                  <input required autoComplete="name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-2 block font-semibold">Компания / площадка</span>
                  <input required autoComplete="organization" value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} className={inputClass} />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block font-semibold">Telegram / телефон</span>
                <input required autoComplete="tel" value={form.contact} onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))} className={inputClass} />
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
                Заявка появится в админке. Мы увидим контакт, формат и примерное количество гостей.
              </p>
            </aside>
          </div>
        </div>
      </main>
    </ChessBackground>
  )
}
