import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BadgeCheck, Building2, CalendarDays, CheckCircle2, Download, Flag, Handshake, LineChart, MessageCircle, Trophy, Users } from "lucide-react"
import ChessBackground from "@/components/ChessBackground"
import { CorporateRequestForm } from "@/components/corporate/corporate-request-form"
import { JsonLd } from "@/components/seo/json-ld"
import { getClubContentCoverImage } from "@/lib/club-content"
import { listClubContent, type ClubContent } from "@/lib/db"
import { SITE_URL, TELEGRAM_URL, buildBreadcrumbJsonLd, buildFaqPageJsonLd, buildGraphJsonLd } from "@/lib/seo"

const KP_URL = "/files/Rep_Chess_KRD_Corporate_KP.pdf"
const OG_IMAGE = "/icon.svg"

const OFFER_ITEMS = [
  {
    icon: Trophy,
    title: "Турнир под ключ",
    text: "Регламент, посадка, часы, ведущий, результаты и понятная механика для участников любого уровня.",
  },
  {
    icon: Users,
    title: "Командный вечер",
    text: "Сценарий для офиса, отдела, HR-события или закрытого вечера с коллегами.",
  },
  {
    icon: CalendarDays,
    title: "Внутренняя лига",
    text: "Сезонный формат на несколько недель с таблицей, турами, финалом и корпоративным рейтингом.",
  },
  {
    icon: BadgeCheck,
    title: "Обучение сотрудников",
    text: "Занятия для новичков, разборы партий и спокойная практика перед турниром или лигой.",
  },
]

const USE_CASES = [
  "Офисный корпоратив",
  "Спартакиада компании",
  "Family day",
  "HR-активность",
  "Клуб сотрудников",
  "День здоровья",
  "Партнёрское событие",
  "Закрытый турнир",
]

const BENEFITS = [
  "люди быстро включаются, даже если давно не играли",
  "формат легко масштабируется от 12 до 80+ участников",
  "событие дает фото, истории и повод для внутренней коммуникации",
  "можно сделать мягкий вход для новичков и отдельный вызов для сильных игроков",
]

const FORMAT_PACKAGES = [
  {
    name: "Корпоративный турнир",
    price: "от 30 000 ₽",
    text: "2-3 часа, ведущий, инвентарь, сетка, результаты, призовая механика.",
  },
  {
    name: "Тимбилдинг",
    price: "от 60 000 ₽",
    text: "Смешанный вечер: турнир, командные задания, шахматный квиз и свободная игра.",
  },
  {
    name: "Спартакиада / family day",
    price: "от 100 000 ₽",
    text: "Большой поток участников, отдельная шахматная зона, ведущий и сценарий под площадку.",
  },
  {
    name: "Внутренняя лига",
    price: "от 120 000 ₽",
    text: "Серия туров, таблица, финал, коммуникация с участниками и регулярное ведение.",
  },
]

const INCLUDED = [
  "подбор формата под задачу компании",
  "регламент, тайминг и схема проведения",
  "комплекты шахмат и часы",
  "ведущий и судейское сопровождение",
  "таблица результатов и финальная выдача победителей",
  "рекомендации по призам, анонсу и внутренней коммуникации",
]

const TIMELINE = [
  { label: "01", title: "Заявка", text: "Вы оставляете контакт, задачу и примерное количество участников." },
  { label: "02", title: "Созвон", text: "Уточняем площадку, уровень игроков, дату, бюджет и ожидания." },
  { label: "03", title: "Формат", text: "Собираем сценарий, тайминг, стоимость и список подготовки." },
  { label: "04", title: "Событие", text: "Проводим игру, ведем участников, считаем результаты и закрываем финал." },
]

const FAQ = [
  {
    question: "Сколько человек может участвовать?",
    answer: "Комфортный диапазон для одного ведущего: 12-40 участников. Для больших событий добавляем ассистентов и делим поток на зоны.",
  },
  {
    question: "Можно провести для новичков?",
    answer: "Да. Перед стартом объясняем регламент, часы, базовые правила турнира и помогаем участникам спокойно войти в игру.",
  },
  {
    question: "Что нужно от компании?",
    answer: "Площадка со столами и стульями, контакт ответственного человека, дата, примерное количество участников и понятная задача события.",
  },
  {
    question: "Можно сделать брендирование?",
    answer: "Да. Можно добавить корпоративное название турнира, брендированные таблицы, призы, фото-зону и визуальные элементы под событие.",
  },
]

const jsonLd = buildGraphJsonLd([
  {
    "@type": "Service",
    "@id": `${SITE_URL}/corporate#service`,
    name: "Корпоративные шахматы для команд",
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
    areaServed: {
      "@type": "City",
      name: "Краснодар",
    },
    serviceType: "Корпоративные шахматные турниры, лиги и обучение",
    url: `${SITE_URL}/corporate`,
    image: `${SITE_URL}${OG_IMAGE}`,
    offers: {
      "@type": "OfferCatalog",
      name: "Форматы корпоративных шахмат Rep Chess KRD",
      itemListElement: FORMAT_PACKAGES.map((item) => ({
        "@type": "Offer",
        name: item.name,
        description: item.text,
        priceCurrency: "RUB",
      })),
    },
  },
  {
    "@type": "WebPage",
    "@id": `${SITE_URL}/corporate#webpage`,
    name: "Корпоративные шахматы для команд",
    url: `${SITE_URL}/corporate`,
    inLanguage: "ru-RU",
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    about: {
      "@id": `${SITE_URL}/corporate#service`,
    },
  },
  buildFaqPageJsonLd(FAQ),
  buildBreadcrumbJsonLd([
    { name: "Главная", path: "/" },
    { name: "Для компаний", path: "/corporate" },
  ]),
])

export const metadata: Metadata = {
  title: "Корпоративные шахматы для команд - Rep Chess KRD",
  description:
    "Турниры, лиги и обучение по шахматам для сотрудников в Краснодаре. Форматы для офиса, спартакиады, family day и внутренних мероприятий.",
  keywords: [
    "корпоративные шахматы Краснодар",
    "шахматный турнир для компании Краснодар",
    "тимбилдинг шахматы Краснодар",
    "шахматная лига для сотрудников",
    "шахматы для сотрудников",
    "Rep Chess KRD для компаний",
  ],
  alternates: {
    canonical: "/corporate",
  },
  openGraph: {
    title: "Корпоративные шахматы для команд | Rep Chess KRD",
    description: "Турниры, лиги и обучение для сотрудников. Формат для офиса, спартакиады, family day и внутренних мероприятий.",
    url: `${SITE_URL}/corporate`,
    images: [
      {
        url: OG_IMAGE,
        width: 512,
        height: 512,
        alt: "Корпоративные шахматы Rep Chess KRD",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Корпоративные шахматы для команд | Rep Chess KRD",
    description: "Турниры, лиги и обучение для сотрудников в Краснодаре.",
    images: [OG_IMAGE],
  },
}

export const dynamic = "force-dynamic"
export const revalidate = 0

function getCorporateHeroImage(items: ClubContent[]) {
  return items
    .filter((item) => Number(item.id || 0) > 0)
    .filter((item) => item.type === "gallery" || item.type === "news" || item.type === "honor")
    .map((item) => getClubContentCoverImage(item))
    .filter((imageUrl) => !imageUrl.startsWith("/merch/"))
    .find((imageUrl): imageUrl is string => Boolean(imageUrl))
}

export default async function CorporatePage() {
  const clubContent = await listClubContent({ publishedOnly: true })
  const heroImage = getCorporateHeroImage(clubContent)

  return (
    <ChessBackground>
      <JsonLd data={jsonLd} />
      <main className="min-h-screen text-white">
        <section className="relative isolate min-h-[86svh] overflow-hidden px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          {heroImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt="Событие Rep Chess KRD"
                className="absolute inset-0 -z-20 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.78)_44%,rgba(0,0,0,0.34)_75%,rgba(0,0,0,0.58)_100%)]" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 -z-20 bg-[#151515]" />
              <div className="brand-photo-strip absolute inset-0 -z-20 opacity-[0.18]" />
              <div className="brand-pixel-corner right-[8%] top-[18%] -z-10 opacity-[0.16]" />
              <div className="brand-doodle bottom-[16%] right-[18%] -z-10 h-44 w-44 opacity-[0.16]" />
              <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.68)_52%,rgba(255,21,21,0.18)_100%)]" />
            </>
          )}
          <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#151515] to-transparent" />

          <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-full border border-white/12 bg-black/30 px-4 py-3 backdrop-blur-md" aria-label="Навигация по разделу">
            <Link href="/" className="brand-font text-sm uppercase tracking-normal text-white">
              Rep Chess KRD
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase text-white/72">
              <Link href="/tournaments" className="rounded-full px-3 py-2 transition hover:bg-white hover:text-[#151515]">Расписание</Link>
              <Link href="/corporate" className="rounded-full bg-white px-3 py-2 text-[#151515]">Для компаний</Link>
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="rounded-full px-3 py-2 transition hover:bg-white hover:text-[#151515]">Telegram</a>
            </div>
          </nav>

          <div className="mx-auto flex w-full max-w-7xl flex-1 items-center pt-16 sm:pt-24">
            <div className="w-full min-w-0 max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff1515]/50 bg-[#ff1515]/18 px-4 py-2 text-xs font-black uppercase text-white">
                <Building2 className="h-4 w-4" />
                Для HR, event, office и internal comms
              </div>
              <h1 className="brand-title max-w-full text-[clamp(1.55rem,7.6vw,5rem)] text-white">
                Корпоративные шахматы для команд
              </h1>
              <p className="mt-6 max-w-full text-base font-semibold leading-relaxed text-white/76 sm:max-w-3xl sm:text-xl">
                Турниры, лиги и обучение для сотрудников. Формат для офиса, спартакиады, family day и внутренних мероприятий.
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <a href="#request" className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black uppercase text-[#151515] transition hover:-translate-y-0.5 hover:bg-[#fff200] sm:w-auto">
                  <MessageCircle className="h-5 w-5" />
                  Обсудить формат
                </a>
                <a href={KP_URL} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-white/18 bg-white/10 px-6 py-4 text-sm font-black uppercase text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#151515] sm:w-auto">
                  <Download className="h-5 w-5" />
                  Скачать КП
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <section className="-mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {OFFER_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title} className="brand-panel-dark min-h-[220px] p-5">
                  <Icon className="h-7 w-7 text-[#ff1515]" />
                  <h2 className="brand-font mt-6 text-xl leading-tight text-white">{item.title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-white/60">{item.text}</p>
                </article>
              )
            })}
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="brand-panel p-5 sm:p-7">
              <h2 className="brand-title text-3xl text-[#151515] sm:text-5xl">Где работает формат</h2>
              <p className="mt-5 text-base font-semibold leading-relaxed text-[#151515]/68">
                Шахматы хорошо заходят там, где нужно собрать людей вокруг понятного действия: сыграть, посоревноваться, познакомиться и получить общий финал вечера.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {USE_CASES.map((item, index) => (
                <div key={item} className="flex min-h-24 items-center gap-4 rounded-[18px] border border-white/10 bg-white/[0.06] p-4">
                  <span className="brand-font flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm text-[#151515]" style={{ backgroundColor: ["#ff1515", "#fff200", "#20d66b", "#1357ff"][index % 4] }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-black uppercase text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="brand-panel-dark p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <LineChart className="h-7 w-7 text-[#20d66b]" />
                <h2 className="brand-title text-3xl text-white sm:text-5xl">Польза для команды</h2>
              </div>
              <div className="space-y-3">
                {BENEFITS.map((item) => (
                  <div key={item} className="flex gap-3 rounded-[16px] border border-white/10 bg-white/[0.05] p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#20d66b]" />
                    <p className="text-sm font-semibold leading-relaxed text-white/68">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="brand-panel p-5 sm:p-7">
              <h2 className="brand-title text-3xl text-[#151515] sm:text-5xl">Кто проводит</h2>
              <p className="mt-5 text-base font-semibold leading-relaxed text-[#151515]/68">
                Rep Chess KRD проводит офлайн-шахматы в Краснодаре: клубные турниры, лекции, новичковые вечера и события для площадок. Мы говорим с участниками нормальным языком, держим темп и берем на себя игровую часть.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["20+", "участников на клубных турнирах"],
                  ["700+", "активных игроков в городе"],
                  ["14", "городов Rep Chess"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[16px] bg-[#151515] p-4 text-white">
                    <div className="brand-font text-3xl">{value}</div>
                    <div className="mt-2 text-xs font-bold uppercase text-white/56">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-5 brand-panel-dark p-5 sm:p-7">
            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h2 className="brand-title text-3xl text-white sm:text-5xl">Форматы и стоимость</h2>
                <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-white/62 sm:text-base">
                  Итоговая смета зависит от количества участников, площадки, длительности, состава команды и задач брендинга.
                </p>
              </div>
              <a href={KP_URL} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black uppercase text-[#151515] transition hover:bg-[#fff200]">
                <Download className="h-5 w-5" />
                Скачать КП
              </a>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {FORMAT_PACKAGES.map((item) => (
                <article key={item.name} className="flex min-h-[230px] flex-col rounded-[18px] border border-white/10 bg-white/[0.06] p-5">
                  <h3 className="brand-font text-xl leading-tight text-white">{item.name}</h3>
                  <div className="brand-font mt-5 text-2xl text-[#fff200]">{item.price}</div>
                  <p className="mt-4 text-sm leading-relaxed text-white/58">{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="brand-panel p-5 sm:p-7">
              <h2 className="brand-title text-3xl text-[#151515] sm:text-5xl">Что входит</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {INCLUDED.map((item) => (
                  <div key={item} className="rounded-[16px] border border-[#151515]/10 bg-[#151515]/5 p-4 text-sm font-bold leading-relaxed text-[#151515]/70">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="brand-panel-dark p-5 sm:p-7">
              <h2 className="brand-title text-3xl text-white sm:text-5xl">Пилот</h2>
              <p className="mt-5 text-base font-semibold leading-relaxed text-white/64">
                Можно начать с одного события на 20-30 участников: проверить интерес, собрать обратную связь и понять, нужен ли компании регулярный формат.
              </p>
              <a href="#request" className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff1515] px-5 py-3 text-sm font-black uppercase text-white transition hover:bg-white hover:text-[#151515] sm:w-auto">
                Запросить пилот
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </section>

          <section className="mt-5 brand-panel-dark p-5 sm:p-7">
            <h2 className="brand-title text-3xl text-white sm:text-5xl">Как запускаем</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {TIMELINE.map((item) => (
                <article key={item.label} className="rounded-[18px] border border-white/10 bg-white/[0.06] p-5">
                  <div className="brand-font text-sm text-[#ff1515]">{item.label}</div>
                  <h3 className="brand-font mt-5 text-xl leading-tight text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/58">{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="brand-panel-dark p-5 sm:p-7">
              <Flag className="h-8 w-8 text-[#1357ff]" />
              <h2 className="brand-title mt-5 text-3xl text-white sm:text-5xl">Внутренняя лига</h2>
              <p className="mt-5 text-base font-semibold leading-relaxed text-white/64">
                Подходит для компаний, где шахматы хочется сделать регулярной активностью: туры по расписанию, таблица, финал, победители месяца и общая история сезона.
              </p>
            </div>
            <div className="brand-panel p-5 sm:p-7">
              <Handshake className="h-8 w-8 text-[#ff1515]" />
              <h2 className="brand-title mt-5 text-3xl text-[#151515] sm:text-5xl">Брендинг события</h2>
              <p className="mt-5 text-base font-semibold leading-relaxed text-[#151515]/68">
                Добавляем название компании, визуальный стиль события, призовую механику, фото-точки и материалы для внутреннего анонса.
              </p>
            </div>
          </section>

          <section id="request" className="mt-5 grid scroll-mt-8 gap-5 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="brand-panel-dark p-5 sm:p-7">
              <h2 className="brand-title text-3xl text-white sm:text-5xl">Обсудить формат</h2>
              <p className="mt-5 text-base font-semibold leading-relaxed text-white/64">
                Оставьте заявку, и мы предложим сценарий под вашу задачу, количество участников и площадку.
              </p>
              <div className="mt-6 rounded-[18px] border border-white/10 bg-white/[0.06] p-5">
                <div className="brand-font text-xl text-white">В OS появится лид</div>
                <p className="mt-3 text-sm leading-relaxed text-white/58">
                  Заявка сохраняется на сервере, а в Rep Chess OS создается corporate-лид со статусом “Новый лид”.
                </p>
              </div>
            </div>
            <CorporateRequestForm />
          </section>

          <footer className="mt-8 flex flex-col gap-4 border-t border-white/10 py-8 text-sm font-black uppercase text-white/54 sm:flex-row sm:items-center sm:justify-between">
            <div>Rep Chess KRD · Corporate</div>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="transition hover:text-white">Главная</Link>
              <Link href="/tournaments" className="transition hover:text-white">Расписание</Link>
              <Link href="/corporate" className="transition hover:text-white">Для компаний</Link>
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="transition hover:text-white">Telegram</a>
            </div>
          </footer>
        </div>
      </main>
    </ChessBackground>
  )
}
