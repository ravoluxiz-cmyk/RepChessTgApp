"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import type { ClubContent, ClubContentType } from "@/lib/club-content"
import { CLUB_CONTENT_TYPE_DESCRIPTIONS, CLUB_CONTENT_TYPE_LABELS, CLUB_CONTENT_TYPES } from "@/lib/club-content"
import { ArrowLeft, ExternalLink, Megaphone, Quote, ScrollText, Sparkles, Trophy } from "lucide-react"

const TYPE_ICONS: Record<ClubContentType, typeof Trophy> = {
  honor: Trophy,
  news: Megaphone,
  lecture: Sparkles,
  rules: ScrollText,
  review: Quote,
}

const TYPE_ACCENTS: Record<ClubContentType, string> = {
  honor: "bg-[#fff200] text-[#151515]",
  news: "bg-[#1357ff] text-white",
  lecture: "bg-white text-[#151515]",
  rules: "bg-[#20d66b] text-[#151515]",
  review: "bg-[#ff1515] text-white",
}

export default function ClubPage() {
  const router = useRouter()
  const [content, setContent] = useState<ClubContent[]>([])
  const [activeType, setActiveType] = useState<ClubContentType | "all">("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/club-content", { cache: "no-store" })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || "Не удалось загрузить контент клуба")
        setContent(Array.isArray(data.content) ? data.content : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить контент клуба")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const visibleContent = useMemo(() => {
    if (activeType === "all") return content
    return content.filter((item) => item.type === activeType)
  }, [activeType, content])

  const featured = content.find((item) => item.is_featured) || content[0]

  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <button onClick={() => router.push("/")} className="mb-6 inline-flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            Главное меню
          </button>

          <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
            <div className="brand-bg-illustration pointer-events-none absolute -right-24 -bottom-20 h-80 w-[420px] opacity-[0.08]" />
            <div className="brand-chip mb-4 w-fit px-3 py-1 text-xs font-black uppercase">
              Club Feed
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <h1 className="brand-title text-4xl text-white sm:text-6xl">Клуб Rep Chess KRD</h1>
                <p className="mt-3 max-w-2xl text-white/62">
                  Доска почета, лекции, новости, отзывы и правила наших недушных шахмат.
                </p>
              </div>

              {featured && (
                <div className="rounded-[22px] bg-white p-4 text-[#151515]">
                  <div className="text-xs font-black uppercase opacity-55">Закреплено</div>
                  <div className="mt-2 brand-font text-xl leading-none">{featured.title}</div>
                  {featured.subtitle && <p className="mt-2 text-sm font-semibold opacity-70">{featured.subtitle}</p>}
                </div>
              )}
            </div>
          </section>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveType("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-black uppercase transition ${activeType === "all" ? "bg-white text-[#151515]" : "bg-white/10 text-white/75 hover:bg-white/15"}`}
            >
              Все
            </button>
            {CLUB_CONTENT_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type]
              const active = activeType === type
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-black uppercase transition ${active ? TYPE_ACCENTS[type] : "bg-white/10 text-white/75 hover:bg-white/15"}`}
                >
                  <Icon className="h-4 w-4" />
                  {CLUB_CONTENT_TYPE_LABELS[type]}
                </button>
              )
            })}
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/15 p-4 text-red-100">{error}</div>}
          {loading && <div className="text-white/70">Загрузка...</div>}

          {!loading && (
            <div className="grid gap-4 md:grid-cols-2">
              {visibleContent.map((item) => {
                const Icon = TYPE_ICONS[item.type]
                return (
                  <article key={`${item.type}-${item.id}-${item.title}`} className="brand-panel-dark overflow-hidden rounded-[22px]">
                    {item.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt="" className="h-56 w-full object-cover" />
                    )}
                    <div className="p-5">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black uppercase ${TYPE_ACCENTS[item.type]}`}>
                          <Icon className="h-4 w-4" />
                          {CLUB_CONTENT_TYPE_LABELS[item.type]}
                        </span>
                        {item.is_featured && <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase text-white/70">Важно</span>}
                      </div>
                      <h2 className="brand-font text-2xl leading-none text-white">{item.title}</h2>
                      {item.subtitle && <p className="mt-3 font-semibold text-white/72">{item.subtitle}</p>}
                      {item.body && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/64">{item.body}</p>}
                      {item.author_name && <div className="mt-4 text-sm font-bold text-white/60">- {item.author_name}</div>}
                      {item.external_url && (
                        <a href={item.external_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#151515]">
                          Открыть ссылку
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {!loading && visibleContent.length === 0 && (
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-6 text-white/70">
              В этом разделе пока нет опубликованных карточек. В админке можно добавить первую.
            </div>
          )}

          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {CLUB_CONTENT_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type]
              return (
                <div key={type} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                  <Icon className="mb-3 h-5 w-5 text-white" />
                  <div className="font-black">{CLUB_CONTENT_TYPE_LABELS[type]}</div>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">{CLUB_CONTENT_TYPE_DESCRIPTIONS[type]}</p>
                </div>
              )
            })}
          </section>
        </div>
      </main>
    </ChessBackground>
  )
}
