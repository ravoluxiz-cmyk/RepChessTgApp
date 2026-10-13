import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react"
import { HomeHero } from "@/components/home/home-hero"
import { HomeAppShowcase } from "@/components/home/home-app-showcase"
import { HomeAccess } from "@/components/home/home-access"
import { getClubContentImages, normalizeClubContentImagePosition } from "@/lib/club-content"
import { listClubContent, listTournaments, type Tournament } from "@/lib/db"
import { JsonLd } from "@/components/seo/json-ld"
import { buildFaqPageJsonLd, buildGraphJsonLd, SITE_URL, TELEGRAM_URL } from "@/lib/seo"
import { formatTournamentFormat, getUpcomingTournaments } from "@/lib/tournament-display"
import styles from "@/components/home/home-refresh.module.css"

export const metadata: Metadata = {
  title: { absolute: "Шахматы в Краснодаре — приложение и комьюнити Rep Chess KRD" },
  description: "Rep Chess KRD — 930+ участников шахматного комьюнити Краснодара. Скачай приложение Rep Chess, вступай в Telegram и приходи на офлайн-турниры. Можно без рейтинга и опыта.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Шахматы — это люди. Rep Chess KRD",
    description: "Твоя игра. Твои люди. Краснодар. Приложение Rep Chess и комьюнити в Telegram.",
    url: SITE_URL, siteName: "Rep Chess KRD", locale: "ru_RU", type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Rep Chess KRD — шахматы в Краснодаре" }],
  },
  twitter: {
    card: "summary_large_image", title: "Шахматы — это люди. Rep Chess KRD",
    description: "Приложение, Telegram и живые шахматы в Краснодаре.", images: ["/opengraph-image"],
  },
}

export const dynamic = "force-dynamic"

const FAQ = [
  { question: "Можно прийти, если я новичок?", answer: "Да. Можно без рейтинга и опыта участия в турнирах. Выбери подходящий формат в анонсе, а если сомневаешься — напиши организатору через наш Telegram. На встрече объясним пары, часы и порядок игры." },
  { question: "Нужно обязательно приходить с компанией?", answer: "Нет, можно прийти одному. На турнире соперников определяют пары, а на свободной игре поможем найти партнёра. Знакомства — часть наших встреч." },
  { question: "Где проходят шахматные встречи в Краснодаре?", answer: "Мы встречаемся на разных городских площадках. Точный адрес, дата, время и условия участия есть в анонсе каждого события. Актуальные анонсы ищи в приложении Rep Chess и Telegram-канале @RepChessKRD." },
  { question: "Как зарегистрироваться на турнир?", answer: "Найди событие в приложении Rep Chess, проверь город Краснодар и нажми кнопку регистрации. Для отдельных клубных встреч способ записи указан в анонсе в Telegram." },
  { question: "Что есть в приложении Rep Chess?", answer: "Поиск и регистрация на турниры, пары и результаты туров, личный рейтинг и лиги, а также встроенные шахматные часы. Приложение доступно для iOS и Android." },
  { question: "Можно организовать шахматный вечер для команды?", answer: "Да. Делаем шахматные мероприятия для компаний и площадок: турнир, лекцию или свободную игру. Расскажи о своей задаче на странице «Для компаний», и мы предложим формат." },
]

const FALLBACK_PHOTOS = [
  { id: "brand-evening", title: "Шахматный вечер Rep Chess", imageUrl: "/home/chess-evening.jpg", imagePosition: "center center" },
  { id: "brand-people", title: "Люди и партии Rep Chess", imageUrl: "/home/chess-friends.jpg", imagePosition: "center center" },
  { id: "brand-park", title: "Партия на свежем воздухе", imageUrl: "/home/chess-park.jpg", imagePosition: "center center" },
  { id: "brand-cafe", title: "Шахматы за столиком в кафе", imageUrl: "/home/chess-cafe.jpg", imagePosition: "32% center" },
  { id: "brand-community", title: "Открытая встреча сообщества Rep Chess", imageUrl: "/home/chess-community.jpg", imagePosition: "center center" },
]

function eventDate(tournament: Tournament) {
  if (!tournament.start_at || Number.isNaN(Date.parse(tournament.start_at))) return "Дату анонсируем скоро"
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow",
  }).format(new Date(tournament.start_at))
}

export default async function Home() {
  const [tournaments, clubContent] = await Promise.all([
    listTournaments(), listClubContent({ publishedOnly: true }),
  ])
  const now = Date.now()
  const events = getUpcomingTournaments(tournaments)
    .filter((event) => !event.start_at || Date.parse(event.start_at) >= now).slice(0, 3)
  const publishedPhotos = clubContent
    .filter((item) => item.type === "gallery" && Number(item.id) > 0)
    .flatMap((item) => getClubContentImages(item).map((imageUrl, index) => ({
      id: `${item.id}-${index}`, title: item.title,
      imageUrl: imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl,
      imagePosition: normalizeClubContentImagePosition(item.image_position),
    })))
    .filter((item) => /^\/(?!\/)|^https?:\/\//.test(item.imageUrl))
  const seenPhotos = new Set<string>()
  const photoPool = [...publishedPhotos, ...FALLBACK_PHOTOS].filter((photo) => {
    const key = photo.imageUrl.split(/[?#]/)[0]
    if (seenPhotos.has(key)) return false
    seenPhotos.add(key)
    return true
  })
  const [heroPhoto, polaroidPhoto] = photoPool
  const photos = photoPool.slice(2, 5)
  const pageJsonLd = buildGraphJsonLd([
    {
      "@type": "WebPage", "@id": `${SITE_URL}/#home`, url: SITE_URL,
      name: "Шахматы в Краснодаре — Rep Chess KRD", inLanguage: "ru-RU",
      description: "Приложение Rep Chess, Telegram-комьюнити и офлайн-шахматные турниры в Краснодаре.",
      isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "MobileApplication", name: "Rep Chess: Шахматы",
      operatingSystem: "iOS, Android", applicationCategory: "LifestyleApplication",
      url: "https://repchess.ru/app/", description: FAQ[4].answer,
      featureList: ["Поиск и регистрация на шахматные турниры", "Рейтинг и лиги", "Пары и результаты туров", "Шахматные часы"],
      installUrl: ["https://apps.apple.com/app/id6776794104", "https://play.google.com/store/apps/details?id=ru.nfg.repchess", "https://www.rustore.ru/catalog/app/ru.nfg.repchess"],
    },
    buildFaqPageJsonLd(FAQ),
  ])

  return (
    <div className={styles.home}>
      <a href="#main-content" className={styles.skipLink}>К содержанию</a>
      <JsonLd data={pageJsonLd} />
      <HomeHero photo={heroPhoto} polaroid={polaroidPhoto} />
      <main id="main-content">
        <div className={styles.ticker} aria-hidden="true"><span>CHESS IS REP</span><span>+</span><span>КРАСНОДАР</span><span>+</span><span>УВИДИМСЯ ЗА ДОСКОЙ</span></div>
        <HomeAppShowcase />
        <section id="community" className={styles.community} aria-labelledby="community-title">
          <div className={styles.sectionTopline}><span>СВОИ ЛЮДИ</span><span>REP CHESS KRD</span></div>
          <div className={styles.communityHeading}>
            <h2 id="community-title" className={styles.sectionTitle}>ПРИХОДИ ОДИН.<br /><span>УХОДИ СО СВОИМИ.</span></h2>
            <div className={styles.communityCopy}>
              <p>Анонсы, фотографии, разговоры после партий и люди, с которыми хочется сыграть ещё. Между встречами мы всегда на связи в Telegram.</p>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={`${styles.button} ${styles.buttonYellow}`}>Зайти в @RepChessKRD <ArrowUpRight size={20} aria-hidden="true" /></a>
            </div>
          </div>
          <div className={styles.photoGrid}>{photos.map((photo, index) => (
            <figure key={photo.id} className={index === 1 ? styles.photoPortrait : styles.photoLandscape}>
              <Image src={photo.imageUrl} alt={photo.title} fill sizes="(max-width: 640px) 85vw, (max-width: 1000px) 45vw, 30vw" unoptimized={/^https?:\/\//.test(photo.imageUrl)} style={{ objectPosition: photo.imagePosition }} />
            </figure>
          ))}</div>
          <div className={styles.communityBottom}>
            <div className={styles.memberCount}><strong>930+</strong><span>участников<br />в Краснодаре</span></div>
            <p>Можно без рейтинга.<br />Можно без компании.<br /><strong>Главное — хотеть играть.</strong></p>
            <Link href="/beginners" className={styles.underlink}>Мой первый турнир <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </section>
        <section id="events" className={styles.events} aria-labelledby="events-title">
          <div className={styles.sectionTopline}><span>ИЗ ОНЛАЙНА — ЗА ДОСКУ</span><span>КРАСНОДАР</span></div>
          <div className={styles.sectionHeadingRow}><h2 id="events-title" className={styles.sectionTitle}>ВСТРЕТИМСЯ<br />ЗА ДОСКОЙ.</h2><Link href="/tournaments" className={styles.underlink}>Всё расписание <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
          {events.length ? <div className={styles.eventGrid}>{events.map((event) => (
            <article className={styles.eventCard} key={event.id || event.title}>
              <p className={styles.eventStatus}>{Number(event.allow_join) === 1 ? "Запись открыта" : "Скоро анонс"}</p>
              <h3>{event.title}</h3>
              <div className={styles.eventDetails}><p><CalendarDays size={17} aria-hidden="true" />{eventDate(event)}</p><p><MapPin size={17} aria-hidden="true" />{event.location || event.address || "Площадку анонсируем скоро"}</p><p>{formatTournamentFormat(event)}</p></div>
              <a href={event.event_url || `/tournaments${event.id ? `#tournament-${event.id}` : ""}`} target={event.event_url ? "_blank" : undefined} rel={event.event_url ? "noopener noreferrer" : undefined} className={styles.eventLink}>Подробнее <ArrowUpRight size={20} aria-hidden="true" /></a>
            </article>
          ))}</div> : <div className={styles.eventEmpty}><div><h3>СЛЕДУЮЩИЙ ХОД СКОРО.</h3><p>Готовим новые встречи. Свежие анонсы появятся в приложении и нашем Telegram — заглядывай, чтобы выбрать свой вечер.</p></div><a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={`${styles.button} ${styles.buttonDark}`}>Следить за анонсами <ArrowUpRight size={20} aria-hidden="true" /></a></div>}
        </section>
        <section className={styles.corporate} aria-labelledby="corporate-title">
          <div><p className={styles.eyebrow}>ДЛЯ КОМПАНИЙ И ПЛОЩАДОК</p><h2 id="corporate-title" className={styles.sectionTitle}>СОБЕРЁМ ВАШИХ.<br />ЗА ОДНИМ СТОЛОМ.</h2></div>
          <div><p>Шахматный вечер для команды, бара, фестиваля или городского проекта. Подберём формат под ваших людей.</p><Link href="/corporate" className={styles.underlink}>Обсудить мероприятие <ArrowUpRight size={20} aria-hidden="true" /></Link></div>
        </section>
        <section className={styles.faq} aria-labelledby="faq-title">
          <div className={styles.faqIntro}><p className={styles.eyebrow}>ПЕРЕД ПЕРВЫМ ХОДОМ</p><h2 id="faq-title" className={styles.sectionTitle}>ЕСТЬ <br />ВОПРОСЫ?</h2><p>Если не нашёл ответ — напиши нам в Telegram. Поможем разобраться.</p></div>
          <div className={styles.faqList}>{FAQ.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
        </section>
        <section className={styles.finalCall} aria-labelledby="join-title"><p className={styles.eyebrow}>ТВОЯ ИГРА НАЧИНАЕТСЯ ЗДЕСЬ</p><h2 id="join-title">ТВОЙ ХОД.</h2><div className={styles.heroActions}><a href="#app" className={`${styles.button} ${styles.buttonDark}`}>Скачать приложение <ArrowUpRight size={21} aria-hidden="true" /></a><a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={`${styles.button} ${styles.buttonOutlineDark}`}>Войти в Telegram <ArrowUpRight size={21} aria-hidden="true" /></a></div></section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerBrand}><Link href="/" aria-label="Rep Chess KRD — главная"><Image src="/home/rep-chess-krd-white.png" width={604} height={421} alt="Rep Chess KRD" /></Link><p>Шахматы, люди, Краснодар.</p></div>
        <nav aria-label="Разделы сайта"><Link href="/tournaments">Турниры</Link><Link href="/beginners">Новичкам</Link><Link href="/corporate">Для компаний</Link><Link href="/partners">Партнёрам</Link><Link href="/merch">Мерч</Link><Link href="/club">Жизнь клуба</Link><Link href="/lessons">Лекции и уроки</Link><Link href="/profile">Личный кабинет</Link></nav>
        <div className={styles.footerBottom}><span>© Rep Chess KRD</span><a href="https://repchess.ru/" target="_blank" rel="noopener noreferrer">Rep Chess в других городах ↗</a><HomeAccess /></div>
      </footer>
    </div>
  )
}
