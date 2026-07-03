"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { ClubContent, ClubContentType } from "@/lib/club-content"
import {
  CLUB_CONTENT_TYPE_DESCRIPTIONS,
  CLUB_CONTENT_TYPE_LABELS,
  CLUB_CONTENT_TYPES,
  getClubContentImages,
  normalizeClubContentImagePosition,
} from "@/lib/club-content"
import { TELEGRAM_URL } from "@/lib/tournament-display"
import { BackButton } from "@/components/ui/back-button"
import { Camera, ChevronLeft, ChevronRight, ExternalLink, Megaphone, Quote, ScrollText, Sparkles, Trophy } from "lucide-react"

const TYPE_ICONS: Record<ClubContentType, typeof Trophy> = {
  honor: Trophy,
  news: Megaphone,
  lecture: Sparkles,
  rules: ScrollText,
  review: Quote,
  gallery: Camera,
}

const TYPE_ACCENTS: Record<ClubContentType, string> = {
  honor: "bg-[#fff200] text-[#151515]",
  news: "bg-[#1357ff] text-white",
  lecture: "bg-white text-[#151515]",
  rules: "bg-[#20d66b] text-[#151515]",
  review: "bg-[#ff1515] text-white",
  gallery: "bg-white/15 text-white",
}

function ClubContentImageCarousel({ item }: { item: ClubContent }) {
  const images = getClubContentImages(item)
  const [activeIndex, setActiveIndex] = useState(0)
  const imagePosition = normalizeClubContentImagePosition(item.image_position)

  if (!images.length) return null

  function showPrevious() {
    setActiveIndex((current) => current === 0 ? images.length - 1 : current - 1)
  }

  function showNext() {
    setActiveIndex((current) => current === images.length - 1 ? 0 : current + 1)
  }

  return (
    <div className="relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[activeIndex]}
        alt=""
        className="h-56 w-full object-cover"
        style={{ objectPosition: imagePosition }}
        loading="lazy"
        decoding="async"
      />
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/85"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/85"
            aria-label="Следующее фото"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white">
            {activeIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  )
}

export function ClubPageClient({ content }: { content: ClubContent[] }) {
  const [activeType, setActiveType] = useState<ClubContentType | "all">("all")

  const visibleContent = useMemo(() => {
    if (activeType === "all") return content
    return content.filter((item) => item.type === activeType)
  }, [activeType, content])

  const typeCounts = useMemo(() => {
    const counts = new Map<ClubContentType, number>()
    CLUB_CONTENT_TYPES.forEach((type) => counts.set(type, 0))
    content.forEach((item) => counts.set(item.type, (counts.get(item.type) || 0) + 1))
    return counts
  }, [content])

  const availableTypes = CLUB_CONTENT_TYPES.filter((type) => (typeCounts.get(type) || 0) > 0)
  const featured = content.find((item) => item.is_featured) || content[0]
  const activeTitle = activeType === "all"
    ? "Вся клубная лента"
    : activeType === "honor"
      ? "Лента участников"
      : activeType === "gallery"
        ? "Фото с турниров"
        : CLUB_CONTENT_TYPE_LABELS[activeType]

  return (
    <main className="min-h-screen px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex justify-start">
          <BackButton href="/" label="Главное меню" />
        </div>

        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
          <div className="brand-bg-illustration pointer-events-none absolute -right-24 -bottom-20 h-80 w-[420px] opacity-[0.08]" />
          <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="brand-title text-4xl text-white sm:text-6xl">Клуб Rep Chess KRD</h1>
              <p className="mt-3 max-w-2xl text-white/62">
                Новости, лекции, отзывы, правила вечеров и доска почета. Все, что хочется сохранить после турнира.
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

        {content.length > 0 && (
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveType("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-black uppercase transition ${activeType === "all" ? "bg-white text-[#151515]" : "bg-white/10 text-white/75 hover:bg-white/15"}`}
            >
              Все {content.length > 0 && <span className="opacity-55">{content.length}</span>}
            </button>
            {availableTypes.map((type) => {
              const Icon = TYPE_ICONS[type]
              const active = activeType === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-black uppercase transition ${active ? TYPE_ACCENTS[type] : "bg-white/10 text-white/75 hover:bg-white/15"}`}
                >
                  <Icon className="h-4 w-4" />
                  {CLUB_CONTENT_TYPE_LABELS[type]} <span className="opacity-55">{typeCounts.get(type)}</span>
                </button>
              )
            })}
          </div>
        )}

        {visibleContent.length > 0 ? (
          <>
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="brand-font text-3xl leading-none text-white">{activeTitle}</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {visibleContent.map((item) => (
                <article key={`${item.type}-${item.id}-${item.title}`} className="brand-panel-dark overflow-hidden rounded-[22px]">
                  <ClubContentImageCarousel item={item} />
                  <div className="p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
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
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-6 text-white/70">
            <h2 className="brand-font text-2xl text-white">Раздел клуба наполняется</h2>
            <p className="mt-3 max-w-2xl">
              Пока самые свежие новости, фото и записи на турниры появляются в Telegram Rep Chess KRD.
            </p>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black uppercase text-[#151515]"
            >
              Открыть Telegram
            </a>
          </div>
        )}

        {availableTypes.length > 0 && (
          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableTypes.map((type) => {
              const Icon = TYPE_ICONS[type]
              return (
                <Link key={type} href="#" onClick={(event) => { event.preventDefault(); setActiveType(type) }} className="rounded-[18px] border border-white/10 bg-black/20 p-4 transition hover:bg-white/[0.06]">
                  <Icon className="mb-3 h-5 w-5 text-white" />
                  <div className="font-black">{CLUB_CONTENT_TYPE_LABELS[type]}</div>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">{CLUB_CONTENT_TYPE_DESCRIPTIONS[type]}</p>
                </Link>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}
