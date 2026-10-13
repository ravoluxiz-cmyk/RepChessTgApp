import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { TELEGRAM_URL } from "@/lib/seo"
import { HomeNavigation } from "./home-navigation"
import styles from "./home-refresh.module.css"

type HeroPhoto = { imageUrl: string; title: string; imagePosition: string }

export function HomeHero({ photo, polaroid }: { photo: HeroPhoto; polaroid: HeroPhoto }) {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroBackground}><Image src={photo.imageUrl} alt="" fill priority sizes="100vw" unoptimized={/^https?:\/\//.test(photo.imageUrl)} style={{ objectPosition: photo.imagePosition }} /></div>
      <HomeNavigation />
      <div className={styles.heroContent}>
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>ШАХМАТНОЕ КОМЬЮНИТИ КРАСНОДАРА</p>
          <h1 id="home-title" className={styles.heroTitle}><span>ШАХМАТЫ —</span>{" "}<span>ЭТО <mark>ЛЮДИ.</mark></span></h1>
          <p className={styles.heroLead}>Твои люди уже здесь. Находи игру в приложении, знакомься в Telegram и приходи за доску в Краснодаре.</p>
          <div className={styles.heroActions}><a href="#app" className={`${styles.button} ${styles.buttonYellow}`}>Скачать приложение <ArrowUpRight size={22} aria-hidden="true" /></a><a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={`${styles.button} ${styles.buttonOutlineLight}`}>Войти в Telegram <ArrowUpRight size={22} aria-hidden="true" /></a></div>
          <p className={styles.heroNote}>Можно одному. Можно без рейтинга. Можно просто любить шахматы.</p>
        </div>
        <div className={styles.heroCollage} aria-hidden="true">
          <figure className={styles.heroPolaroid}><div><Image src={polaroid.imageUrl} alt="" fill sizes="320px" unoptimized={/^https?:\/\//.test(polaroid.imageUrl)} style={{ objectPosition: polaroid.imagePosition }} /></div><figcaption>ЗА ДОСКОЙ — СВОИ.</figcaption></figure>
          <div className={styles.citySticker}>[ КРАСНОДАР ]</div>
        </div>
      </div>
      <div className={styles.heroBottom}><span>CHESS IS REP</span><span>ЖИВЫЕ ПАРТИИ. РЕАЛЬНЫЕ ЛЮДИ.</span><a href="#app">ТВОЙ СЛЕДУЮЩИЙ ХОД ↓</a></div>
    </section>
  )
}
