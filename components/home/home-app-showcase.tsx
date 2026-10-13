"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import styles from "./home-refresh.module.css"

const FEATURES = [
  { id: "events", label: "Турниры", title: "НАЙДИ СВОЮ ИГРУ.", text: "Выбирай город Краснодар, смотри ближайшие встречи и записывайся на турнир. Дата, место и формат — перед глазами.", image: "/home/app-home.png", alt: "Главный экран приложения Rep Chess с турнирами и записью", crop: false },
  { id: "rating", label: "Рейтинг", title: "СЛЕДИ ЗА ПРОГРЕССОМ.", text: "Смотри результаты, свой рейтинг и место в лиге. Каждая встреча — новый соперник и ещё один повод вернуться за доску.", image: "/home/app-rating.png", alt: "Экран рейтинга и лиг в приложении Rep Chess", crop: true },
  { id: "clock", label: "Часы", title: "ЧАСЫ ВСЕГДА С СОБОЙ.", text: "Встроенный двойной таймер для живой партии. Выбирай контроль времени — и можно играть прямо сейчас.", image: "/home/app-clock.png", alt: "Встроенные шахматные часы в приложении Rep Chess", crop: true },
] as const
const STORES = [
  { name: "App Store", platform: "iPhone и iPad", url: "https://apps.apple.com/app/id6776794104" },
  { name: "Google Play", platform: "Android", url: "https://play.google.com/store/apps/details?id=ru.nfg.repchess" },
  { name: "RuStore", platform: "Android", url: "https://www.rustore.ru/catalog/app/ru.nfg.repchess" },
  { name: "AppGallery", platform: "Huawei", url: "https://appgallery.huawei.com/app/C117930615" },
]

export function HomeAppShowcase() {
  const [activeId, setActiveId] = useState<string>("events")
  const active = FEATURES.find((feature) => feature.id === activeId) || FEATURES[0]
  return (
    <section id="app" className={styles.appSection} aria-labelledby="app-title">
      <div className={styles.sectionTopline}><span>ПРИЛОЖЕНИЕ REP CHESS</span><span>IOS + ANDROID</span></div>
      <div className={styles.appLayout}>
        <div className={styles.appContent}>
          <h2 id="app-title" className={styles.sectionTitle}>ТВОЯ ИГРА.<br />ВСЕГДА<br /><span>ПОД РУКОЙ.</span></h2>
          <p className={styles.appLead}>От первой записи до следующей лиги. Всё, что нужно для живых шахмат, — в приложении Rep Chess.</p>
          <div className={styles.featureTabs} aria-label="Возможности приложения">{FEATURES.map((feature) => <button type="button" key={feature.id} aria-pressed={active.id === feature.id} aria-controls="home-app-feature" onClick={() => setActiveId(feature.id)}>{feature.label}</button>)}</div>
          <div id="home-app-feature" className={styles.featureDescription} aria-live="polite"><h3>{active.title}</h3><p>{active.text}</p></div>
          <div className={styles.storeLinks} aria-label="Скачать приложение">{STORES.map((store) => <a href={store.url} key={store.name} target="_blank" rel="noopener noreferrer"><span><small>{store.platform}</small><strong>{store.name}</strong></span><ArrowUpRight size={19} aria-hidden="true" /></a>)}</div>
          <p className={styles.appFootnote}>На компьютере выбери магазин для своего телефона.<br /><a href="https://repchess.ru/app/" target="_blank" rel="noopener noreferrer">Все способы установки ↗</a></p>
        </div>
        <div className={styles.appVisual}>
          <span className={styles.appVisualLabel}>ИЗ ОНЛАЙНА — ЗА ДОСКУ</span><div className={styles.checkerPattern} aria-hidden="true" />
          <div className={styles.phoneDevice}><div className={styles.phoneScreen}>{active.crop ? <Image key={active.image} src={active.image} width={1080} height={1920} alt={active.alt} className={styles.phonePromoImage} sizes="(max-width: 640px) 420px, 620px" /> : <Image key={active.image} src={active.image} width={1080} height={2400} alt={active.alt} className={styles.phoneFullImage} sizes="(max-width: 640px) 230px, 290px" />}</div></div>
          <span className={styles.appVisualCaption}>ЭКРАН ПРИЛОЖЕНИЯ REP CHESS</span>
        </div>
      </div>
    </section>
  )
}
