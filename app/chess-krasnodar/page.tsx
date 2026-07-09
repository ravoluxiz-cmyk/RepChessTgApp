import type { Metadata } from "next"
import ChessBackground from "@/components/ChessBackground"
import { JsonLd } from "@/components/seo/json-ld"
import { BackButton } from "@/components/ui/back-button"
import { buildBreadcrumbJsonLd, buildFaqPageJsonLd, buildGraphJsonLd } from "@/lib/seo"

const SITE_URL = "https://repchesskrd.ru"
const TELEGRAM_URL = "https://t.me/RepChessKRD"

const KEY_POINTS = [
  {
    title: "Турниры",
    text: "Клубные шахматные турниры в Краснодаре для разного уровня: от первого офлайн-вечера до игроков, которым нужен рейтинг, пары и понятный регламент.",
    href: "/tournaments",
    cta: "Расписание турниров",
  },
  {
    title: "Новичкам",
    text: "Можно прийти без рейтинга и без опыта живых турниров. Объясним швейцарку, часы, запись результата и базовые правила поведения за доской.",
    href: "/beginners",
    cta: "Первый турнир",
  },
  {
    title: "Уроки",
    text: "Уроки шахмат в Краснодаре для тех, кто хочет подтянуть дебют, тактику, понимание позиции или просто перестать теряться после первых ходов.",
    href: "/lessons",
    cta: "Заявка на урок",
  },
  {
    title: "Для площадок",
    text: "Делаем шахматные мероприятия для баров, кофеен, компаний и городских проектов: привозим инвентарь, готовим анонс, ведем событие.",
    href: "/partners",
    cta: "Провести событие",
  },
]

const WHERE_TO_PLAY = [
  "клубный турнир Rep Chess KRD",
  "новичковый вечер с объяснением формата",
  "лекция или разбор партий",
  "корпоративный шахматный вечер",
  "фестивальный шахматный спот",
  "свободная игра через Telegram-анонс",
]

const FAQ = [
  {
    question: "Где играть в шахматы в Краснодаре, если я не знаю людей?",
    answer: "Приходи на ближайшее событие Rep Chess KRD. Большая часть людей приходит не компанией, а по анонсу из Telegram. На месте объясняем формат, помогаем с посадкой и подсказываем, что делать после партии.",
  },
  {
    question: "Можно ли прийти новичку на шахматный турнир?",
    answer: "Да. Если ты знаешь, как ходят фигуры, этого уже достаточно для первого вечера. Турнирный опыт, рейтинг и идеальная теория дебютов не обязательны.",
  },
  {
    question: "Где смотреть расписание шахматных турниров в Краснодаре?",
    answer: "На сайте есть раздел с расписанием, но самые быстрые анонсы, переносы, фото и обсуждения появляются в Telegram-канале Rep Chess KRD.",
  },
  {
    question: "Проводите ли вы шахматные мероприятия для компаний?",
    answer: "Да. Для компаний и площадок можно сделать турнир, лекцию, обучение, корпоративный вечер или шахматную зону на городском событии.",
  },
]

const pageJsonLd = buildGraphJsonLd([
  {
    "@type": "WebPage",
    "@id": `${SITE_URL}/chess-krasnodar#webpage`,
    name: "Где играть в шахматы в Краснодаре",
    url: `${SITE_URL}/chess-krasnodar`,
    inLanguage: "ru-RU",
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    about: {
      "@id": `${SITE_URL}/#organization`,
    },
  },
  buildFaqPageJsonLd(FAQ),
  buildBreadcrumbJsonLd([
    { name: "Главная", path: "/" },
    { name: "Шахматы в Краснодаре", path: "/chess-krasnodar" },
  ]),
])

export const metadata: Metadata = {
  title: "Где играть в шахматы в Краснодаре - турниры, клуб и уроки",
  description:
    "Где играть в шахматы в Краснодаре: турниры Rep Chess KRD, события для новичков, уроки шахмат, лекции, Telegram-канал и шахматные мероприятия для компаний.",
  keywords: [
    "где играть в шахматы в Краснодаре",
    "шахматы Краснодар",
    "играть в шахматы Краснодар",
    "шахматный клуб Краснодар",
    "шахматные турниры Краснодар",
    "турниры по шахматам Краснодар",
    "уроки шахмат Краснодар",
    "шахматы для начинающих Краснодар",
    "Rep Chess KRD",
    "Реп Чесс Краснодар",
  ],
  alternates: {
    canonical: "/chess-krasnodar",
  },
  openGraph: {
    title: "Где играть в шахматы в Краснодаре | Rep Chess KRD",
    description:
      "Турниры, уроки, лекции и живое шахматное комьюнити Rep Chess KRD в Краснодаре.",
    url: `${SITE_URL}/chess-krasnodar`,
  },
}

export default function ChessKrasnodarPage() {
  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <JsonLd data={pageJsonLd} />

        <div className="mx-auto max-w-6xl">
          <BackButton />

          <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-stretch">
            <article className="brand-panel-dark relative min-w-0 overflow-hidden p-5 sm:p-8">
              <div className="brand-bg-icons pointer-events-none absolute -right-24 -top-24 h-80 w-80 opacity-[0.07]" />
              <h1 className="brand-title seo-hero-title text-white">
                Где играть в шахматы в Краснодаре
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/68 sm:text-lg">
                Если хочется играть не только онлайн, Rep Chess KRD собирает людей за живой доской: турниры, новичковые вечера, лекции, уроки и клубные встречи в Краснодаре. Главная точка связи - Telegram, а сайт помогает быстро найти расписание, формат и заявку.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="/tournaments" className="brand-button inline-flex min-h-12 items-center justify-center px-5 py-3">
                  Смотреть расписание
                </a>
                <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black uppercase text-white transition hover:bg-white hover:text-[#151515]">
                  Telegram Rep Chess KRD
                </a>
              </div>
            </article>

            <aside className="brand-panel min-w-0 p-5 text-[#151515] sm:p-6">
              <h2 className="brand-title text-3xl leading-none">Что здесь есть</h2>
              <ul className="mt-5 space-y-3 text-sm font-semibold leading-relaxed text-[#151515]/70">
                {WHERE_TO_PLAY.map((item) => (
                  <li key={item} className="rounded-2xl border border-[#151515]/10 bg-white px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-2">
            {KEY_POINTS.map((item) => (
              <article key={item.title} className="brand-panel-dark flex min-h-[260px] flex-col p-5 sm:p-6">
                <h2 className="brand-font text-3xl leading-none text-white">{item.title}</h2>
                <p className="mt-4 flex-1 text-base leading-relaxed text-white/62">{item.text}</p>
                <a href={item.href} className="mt-6 inline-flex text-sm font-black uppercase text-white/78 transition hover:text-white">
                  {item.cta} →
                </a>
              </article>
            ))}
          </section>

          <section className="brand-panel mt-5 p-5 text-[#151515] sm:p-7">
            <h2 className="brand-title text-3xl leading-none sm:text-5xl">
              Шахматы в Краснодаре без лишнего официоза
            </h2>
            <div className="mt-5 grid gap-5 text-base font-semibold leading-relaxed text-[#151515]/68 lg:grid-cols-2">
              <p>
                Rep Chess KRD - это городское шахматное комьюнити, где можно прийти на турнир, познакомиться с людьми, сыграть блиц, обсудить партию и остаться в клубе. Мы не делаем из шахмат закрытую секцию: формат понятный, анонсы живые, регистрация короткая.
              </p>
              <p>
                Если ты ищешь шахматный клуб в Краснодаре, турниры по шахматам, уроки для начинающих или просто место, где играют офлайн, начни с расписания и Telegram-канала. Там быстрее всего появляются даты, площадки, переносы, фото и записи.
              </p>
            </div>
          </section>

          <section className="mt-5 grid gap-3 md:grid-cols-2">
            {FAQ.map((item) => (
              <article key={item.question} className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5">
                <h2 className="brand-font text-2xl leading-none text-white">{item.question}</h2>
                <p className="mt-4 text-sm leading-relaxed text-white/62">{item.answer}</p>
              </article>
            ))}
          </section>

          <section className="brand-panel-dark mt-5 p-5 sm:p-7">
            <h2 className="brand-title text-3xl leading-none text-white sm:text-5xl">
              Быстрый вход в клуб
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/64">
              Для поиска лучше, когда на сайте есть страницы. Для жизни клуба быстрее Telegram: там анонсы шахматных турниров в Краснодаре, записи, обсуждения, фото и новости Rep Chess KRD.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="brand-button inline-flex min-h-12 items-center justify-center px-5 py-3">
                Перейти в Telegram
              </a>
              <a href="/tournaments" className="brand-button-dark inline-flex min-h-12 items-center justify-center px-5 py-3">
                Ближайшие события
              </a>
            </div>
          </section>
        </div>
      </main>
    </ChessBackground>
  )
}
