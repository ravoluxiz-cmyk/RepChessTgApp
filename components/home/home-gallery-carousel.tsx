"use client"

import { useState } from "react"

export type HomeGalleryItem = {
  id: string
  title: string
  imageUrl: string
  imagePosition: string
}

export function HomeGalleryCarousel({ items }: { items: HomeGalleryItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeItem = items[activeIndex]

  if (!items.length) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-white/62">
        Фотоотчеты скоро появятся здесь. Самое свежее пока выкладываем в Telegram.
      </div>
    )
  }

  function showPrevious() {
    setActiveIndex((current) => (current === 0 ? items.length - 1 : current - 1))
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % items.length)
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={activeItem.id}
          src={activeItem.imageUrl}
          alt={activeItem.title}
          className="aspect-[4/3] w-full object-cover transition duration-500 sm:aspect-[16/10] md:aspect-[16/8]"
          style={{ objectPosition: activeItem.imagePosition }}
          loading="lazy"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/26 to-transparent p-4 pt-16">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-xl font-black text-white sm:text-2xl">{activeItem.title}</div>
            </div>
            {items.length > 1 && (
              <div className="rounded-full bg-black/55 px-3 py-1 text-xs font-black text-white backdrop-blur">
                {activeIndex + 1}/{items.length}
              </div>
            )}
          </div>
        </div>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-black leading-none text-[#151515] shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition hover:scale-105"
              aria-label="Предыдущее фото"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-black leading-none text-[#151515] shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition hover:scale-105"
              aria-label="Следующее фото"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  )
}
