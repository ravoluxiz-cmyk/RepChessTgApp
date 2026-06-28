"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import type { ClubContent, ClubContentType } from "@/lib/club-content"
import { CLUB_CONTENT_TYPE_LABELS, CLUB_CONTENT_TYPES } from "@/lib/club-content"
import { ArrowLeft, Edit3, Plus, Save, Trash2 } from "lucide-react"

type FormState = {
  id?: number
  type: ClubContentType
  title: string
  subtitle: string
  body: string
  image_url: string
  external_url: string
  author_name: string
  is_published: boolean
  is_featured: boolean
  sort_order: string
}

const EMPTY_FORM: FormState = {
  type: "news",
  title: "",
  subtitle: "",
  body: "",
  image_url: "",
  external_url: "",
  author_name: "",
  is_published: true,
  is_featured: false,
  sort_order: "100",
}

export default function AdminClubContentPage() {
  const router = useRouter()
  const { initData, isReady } = useTelegramWebApp()
  const [content, setContent] = useState<ClubContent[]>([])
  const [filter, setFilter] = useState<ClubContentType | "all">("all")
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
  }), [initData])

  async function load() {
    if (!isReady) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/club-content?type=${filter}`, {
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
        cache: "no-store",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось загрузить контент")
      setContent(Array.isArray(data.content) ? data.content : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить контент")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, initData, isReady])

  function edit(item: ClubContent) {
    setMessage(null)
    setError(null)
    setForm({
      id: item.id && item.id > 0 ? item.id : undefined,
      type: item.type,
      title: item.title || "",
      subtitle: item.subtitle || "",
      body: item.body || "",
      image_url: item.image_url || "",
      external_url: item.external_url || "",
      author_name: item.author_name || "",
      is_published: item.is_published !== false,
      is_featured: !!item.is_featured,
      sort_order: String(item.sort_order ?? 100),
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch("/api/admin/club-content", {
        method: form.id ? "PATCH" : "POST",
        headers,
        body: JSON.stringify({
          ...form,
          sort_order: Number(form.sort_order || 100),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось сохранить карточку")
      setMessage(form.id ? "Карточка обновлена" : "Карточка создана")
      setForm(EMPTY_FORM)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить карточку")
    } finally {
      setSaving(false)
    }
  }

  async function remove(item: ClubContent) {
    if (!item.id || item.id < 0) return
    if (!window.confirm(`Удалить карточку «${item.title}»?`)) return

    setError(null)
    const response = await fetch(`/api/admin/club-content?id=${item.id}`, {
      method: "DELETE",
      headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
    })
    if (response.ok) {
      setContent((prev) => prev.filter((contentItem) => contentItem.id !== item.id))
    } else {
      const data = await response.json().catch(() => ({}))
      setError(data.error || "Не удалось удалить карточку")
    }
  }

  const inputClass = "w-full rounded-2xl border border-[#151515]/15 bg-white px-3 py-3 text-[#151515] outline-none focus:bg-[#f4f4f0]"

  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <button onClick={() => router.push("/admin")} className="mb-6 inline-flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            Админ-меню
          </button>

          <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
            <div className="brand-bg-icons pointer-events-none absolute -right-20 -top-24 h-72 w-72 opacity-[0.08]" />
            <div className="brand-chip mb-4 w-fit px-3 py-1 text-xs font-black uppercase">Club CMS</div>
            <h1 className="brand-title text-4xl text-white sm:text-6xl">Контент клуба</h1>
            <p className="mt-3 max-w-2xl text-white/62">
              Новости, лекции, правила, отзывы и доска почета управляются одной карточной системой.
            </p>
          </section>

          {message && <div className="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-500/15 p-4 text-emerald-100">{message}</div>}
          {error && <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/15 p-4 text-red-100">{error}</div>}

          <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
            <form onSubmit={submit} className="brand-panel space-y-4 rounded-[22px] p-5 text-[#151515]">
              <div className="flex items-center justify-between gap-3">
                <div className="brand-font text-2xl">{form.id ? "Редактировать" : "Новая карточка"}</div>
                {form.id && (
                  <button type="button" onClick={() => setForm(EMPTY_FORM)} className="rounded-full bg-[#151515] px-3 py-2 text-xs font-black uppercase text-white">
                    Сброс
                  </button>
                )}
              </div>

              <label className="block">
                <span className="mb-2 block font-semibold">Тип</span>
                <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as ClubContentType }))} className={inputClass}>
                  {CLUB_CONTENT_TYPES.map((type) => <option key={type} value={type}>{CLUB_CONTENT_TYPE_LABELS[type]}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-semibold">Заголовок</span>
                <input required value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className={inputClass} />
              </label>

              <label className="block">
                <span className="mb-2 block font-semibold">Подзаголовок</span>
                <input value={form.subtitle} onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))} className={inputClass} />
              </label>

              <label className="block">
                <span className="mb-2 block font-semibold">Текст</span>
                <textarea rows={7} value={form.body} onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))} className={`${inputClass} resize-none`} />
              </label>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <ImageUploadField
                  value={form.image_url}
                  onChange={(value) => setForm((prev) => ({ ...prev, image_url: value }))}
                  endpoint="/api/admin/club-content/upload"
                  authHeader={initData ? `Bearer ${initData}` : undefined}
                  inputClassName={inputClass}
                  labelClassName="mb-2 block font-semibold"
                  label="Картинка / фото галереи"
                  previewAlt="Картинка клубной карточки"
                  previewClassName="aspect-[4/3] w-full object-cover"
                />
                <label className="block">
                  <span className="mb-2 block font-semibold">Внешняя ссылка</span>
                  <input value={form.external_url} onChange={(e) => setForm((prev) => ({ ...prev, external_url: e.target.value }))} className={inputClass} />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-semibold">Автор / участник</span>
                  <input value={form.author_name} onChange={(e) => setForm((prev) => ({ ...prev, author_name: e.target.value }))} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-2 block font-semibold">Порядок</span>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))} className={inputClass} />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-[#151515]/10 bg-[#151515]/5 p-3 font-bold">
                  <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))} />
                  Опубликовано
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-[#151515]/10 bg-[#151515]/5 p-3 font-bold">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))} />
                  Закрепить
                </label>
              </div>

              <button disabled={saving} className="brand-button inline-flex w-full items-center justify-center gap-2 px-4 py-3 disabled:opacity-60">
                {form.id ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {saving ? "Сохранение..." : form.id ? "Сохранить" : "Добавить"}
              </button>
            </form>

            <section>
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setFilter("all")} className={`shrink-0 rounded-full px-4 py-2 text-sm font-black uppercase ${filter === "all" ? "bg-white text-[#151515]" : "bg-white/10 text-white/75"}`}>
                  Все
                </button>
                {CLUB_CONTENT_TYPES.map((type) => (
                  <button key={type} onClick={() => setFilter(type)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-black uppercase ${filter === type ? "bg-[#fff200] text-[#151515]" : "bg-white/10 text-white/75"}`}>
                    {CLUB_CONTENT_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>

              {loading && <div className="text-white/70">Загрузка...</div>}
              {!loading && content.length === 0 && <div className="rounded-[22px] border border-white/10 bg-white/5 p-6 text-white/70">Карточек пока нет</div>}

              <div className="grid gap-3">
                {content.map((item) => (
                  <article key={`${item.id}-${item.title}`} className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-[#151515]">{CLUB_CONTENT_TYPE_LABELS[item.type]}</span>
                          {item.is_featured && <span className="rounded-full bg-[#fff200] px-3 py-1 text-xs font-black uppercase text-[#151515]">Закреплено</span>}
                          <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${item.is_published === false ? "bg-red-500/20 text-red-100" : "bg-emerald-500/20 text-emerald-100"}`}>
                            {item.is_published === false ? "скрыто" : "опубликовано"}
                          </span>
                        </div>
                        <h2 className="mt-3 text-xl font-black text-white">{item.title}</h2>
                        {item.subtitle && <p className="mt-1 text-white/70">{item.subtitle}</p>}
                        {item.body && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/58">{item.body}</p>}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button onClick={() => edit(item)} className="rounded-full bg-white p-3 text-[#151515]" title="Редактировать">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button disabled={!item.id || item.id < 0} onClick={() => remove(item)} className="rounded-full bg-red-500/20 p-3 text-red-100 disabled:cursor-not-allowed disabled:opacity-40" title="Удалить">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </ChessBackground>
  )
}
