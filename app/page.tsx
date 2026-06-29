import ChessBackground from "@/components/ChessBackground";
import { HomeHero } from "@/components/home/home-hero";
import { MobileDock } from "@/components/home/mobile-dock";
import { CLUB_CONTENT_TYPE_LABELS } from "@/lib/club-content";
import { listClubContent, listTournaments, type Tournament } from "@/lib/db";
import { ArrowRight, Brain, Building2, CalendarDays, Camera, Crown, Flame, GraduationCap, Handshake, MapPin, MessageCircle, Search, Send, ShoppingBag, Sparkles, Trophy, Users, Zap } from "lucide-react";

const TELEGRAM_URL = "https://t.me/RepChessKRD"

function getTournamentDate(tournament?: Tournament | null) {
  if (!tournament?.start_at) return "Дата скоро"

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(new Date(tournament.start_at))
}

function getTournamentTime(tournament: Tournament) {
  const value = tournament.start_at || tournament.created_at
  if (!value) return Number.MAX_SAFE_INTEGER
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time
}

function getUpcomingTournament(tournaments: Tournament[]) {
  const now = Date.now()
  return tournaments
    .filter((tournament) => Number(tournament.archived ?? 0) === 0)
    .filter((tournament) => getTournamentTime(tournament) >= now || Number(tournament.allow_join) === 1)
    .sort((a, b) => getTournamentTime(a) - getTournamentTime(b))[0] || null
}

function getVisibleEvents(tournaments: Tournament[]) {
  const now = Date.now()

  return tournaments
    .filter((tournament) => Number(tournament.archived ?? 0) === 0)
    .filter((tournament) => getTournamentTime(tournament) >= now || Number(tournament.allow_join) === 1)
    .sort((a, b) => getTournamentTime(a) - getTournamentTime(b))
    .slice(0, 3)
}

function getEventStatus(tournament: Tournament) {
  if (Number(tournament.allow_join) !== 1) return "скоро анонс"
  if (Number(tournament.registration_count || 0) >= 24) return "мест мало"
  return "запись открыта"
}

function getEventStatusClass(status: string) {
  if (status === "мест мало") return "bg-[#fff200] text-[#151515]"
  if (status === "скоро анонс") return "bg-white/12 text-white"
  return "bg-[#20d66b] text-[#151515]"
}

const SCENARIOS = [
  {
    title: "Я новичок",
    text: "Не знаешь, что такое швейцарка? Нормально. Покажем, куда садиться, когда жать часы и с кем играть.",
    cta: "Старт для новичка",
    href: "/beginners",
    icon: GraduationCap,
    accent: "#20d66b",
  },
  {
    title: "Я уже играю",
    text: "Блиц, Фишер, рейтинг, новые соперники и партии, после которых хочется сразу обсудить позицию.",
    cta: "К расписанию",
    href: "/tournaments",
    icon: Trophy,
    accent: "#fff200",
  },
  {
    title: "Хочу корпоратив",
    text: "Соберем шахматный вечер для команды, бара, фестиваля или площадки. Можно турнир, лекцию или микс.",
    cta: "Запросить формат",
    href: "/partners",
    icon: Building2,
    accent: "#1357ff",
  },
  {
    title: "Хочу в комьюнити",
    text: "Там новости, фото, правила, отзывы, доска почета и все, что обычно происходит между турнирами.",
    cta: "Открыть клуб",
    href: "/club",
    icon: MessageCircle,
    accent: "#ff1515",
  },
  {
    title: "Хочу мерч",
    text: "Футболки и клубные вещи Rep Chess KRD. Смотри карточки, выбирай размер, оставляй заявку.",
    cta: "Открыть витрину",
    href: "/merch",
    icon: ShoppingBag,
    accent: "#fff200",
  },
]

const CLUB_NUMBERS = [
  { value: "700+", label: "активных игроков в Краснодаре" },
  { value: "20+", label: "человек на клубных турнирах" },
  { value: "14", label: "городов Rep Chess" },
  { value: "40 000+", label: "игроков Rep Chess по городам" },
]

const FORMATS = [
  { title: "BLITZ 5+3", text: "Быстро, шумно, с часами. Иногда успеваешь подумать, иногда просто веришь руке.", icon: Zap },
  { title: "Новички", text: "Без экзамена на входе. Объясним формат и поможем сыграть первую партию.", icon: GraduationCap },
  { title: "Фишер", text: "960 стартовых позиций. Меньше заучки, больше настоящего шахматного хаоса.", icon: Sparkles },
  { title: "Лекции", text: "Разбираем партии, идеи и позиции нормальным языком, а не как в старой методичке.", icon: Brain },
  { title: "Корпоративы", text: "Шахматный вечер для команды: турнир, квиз, лекция или свободная игра.", icon: Handshake },
  { title: "Hand & Brain", text: "Один говорит фигуру, второй делает ход. Дружба проверяется за пять минут.", icon: Users },
]

const HONOR_FALLBACK = [
  { title: "Игрок месяца", name: "Герой клубного вечера", metric: "за стабильную игру и вайб" },
  { title: "Лучший новичок", name: "Первый турнир", metric: "за смелость прийти и сыграть" },
  { title: "Топ посещаемости", name: "Постоянный участник", metric: "за любовь к клубным вечерам" },
]

const SEO_TOPICS = [
  {
    title: "Шахматы в Краснодаре",
    text: "Ищешь шахматы в Краснодаре не в формате тихого кружка? У нас играют офлайн, знакомятся, спорят о партиях и возвращаются на следующие вечера.",
  },
  {
    title: "Турниры по шахматам",
    text: "В расписании есть дата, площадка, формат, афиша и запись. Самые быстрые анонсы и переносы все равно сначала улетают в Telegram.",
  },
  {
    title: "Шахматы для начинающих",
    text: "Можно прийти без рейтинга и без уверенности в себе. Организатор объяснит пары, часы и что делать после партии.",
  },
  {
    title: "Уроки, лекции и клубный контент",
    text: "Проводим уроки шахмат, лекции и разборы. Плюс собираем новости клуба, отзывы и доску почета, чтобы история вечеров не терялась.",
  },
  {
    title: "Мерч и стиль клуба",
    text: "В мерче лежат футболки и вещи Rep Chess KRD. Не обязательная форма, просто приятно, когда клуб виден и вне доски.",
  },
  {
    title: "Шахматные мероприятия для компаний",
    text: "Делаем корпоративные турниры, лекции и шахматные зоны для компаний, баров, фестивалей и городских проектов.",
  },
]

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Rep Chess KRD — шахматы в Краснодаре",
  url: "https://repchesskrd.ru",
  inLanguage: "ru-RU",
  description: "Шахматный клуб Rep Chess KRD в Краснодаре: Telegram-канал, турниры, уроки, лекции, мерч и корпоративные шахматные мероприятия.",
  about: [
    "шахматы в Краснодаре",
    "турниры по шахматам",
    "шахматный клуб",
    "уроки шахмат",
    "шахматный мерч",
  ],
  mainEntity: {
    "@type": "SportsOrganization",
    name: "Rep Chess KRD",
    url: "https://repchesskrd.ru",
    sameAs: "https://t.me/RepChessKRD",
  },
}

export const revalidate = 60

export default async function Home() {
  const [tournaments, clubContent] = await Promise.all([
    listTournaments(),
    listClubContent({ publishedOnly: true }),
  ])

  const upcomingTournament = getUpcomingTournament(tournaments)
  const visibleEvents = getVisibleEvents(tournaments)
  const galleryItems = clubContent
    .filter((item) => item.type === "gallery" && item.image_url)
    .slice(0, 6)
  const featuredClubItems = clubContent
    .filter((item) => item.type !== "gallery")
    .slice(0, 3)

  const honorItems = clubContent
    .filter((item) => item.type === "honor")
    .slice(0, 3)

  return (
    <ChessBackground>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4">
        <HomeHero />

        <main className="space-y-5 pb-28 sm:space-y-7 sm:pb-24">
          <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="brand-panel-dark relative overflow-hidden p-5 sm:p-7">
              <div className="brand-bg-icons pointer-events-none absolute -right-20 -top-24 h-72 w-72 opacity-[0.08]" />
              <div className="brand-chip mb-5 w-fit px-3 py-1 text-xs font-black uppercase">Кто мы</div>
              <h2 className="brand-title max-w-3xl text-3xl text-white sm:text-5xl md:text-6xl">
                Шахматы без пыли
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/68 sm:text-lg">
                Мы делаем офлайн-шахматы в Краснодаре: турниры, уроки, лекции и вечера, где можно прийти одному, сыграть блиц и уйти уже с новыми знакомыми.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="brand-button inline-flex items-center justify-center gap-2 px-5 py-3">
                  <Send className="h-5 w-5" />
                  Telegram-канал
                </a>
                <a href="/club" className="brand-button-dark inline-flex items-center justify-center gap-2 px-5 py-3">
                  Новости клуба
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {CLUB_NUMBERS.map((item, index) => (
                <div key={item.label} className="brand-panel-dark flex min-h-32 items-center gap-4 p-5">
                  <div className="brand-font flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg text-[#151515]" style={{ backgroundColor: ["#fff200", "#20d66b", "#1357ff", "#ff1515"][index] }}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="brand-font text-3xl text-white">{item.value}</div>
                    <div className="mt-1 text-sm font-bold uppercase text-white/56">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="brand-panel-dark p-5 sm:p-7">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <div className="brand-chip mb-3 w-fit px-3 py-1 text-xs font-black uppercase">Скоро играем</div>
                <h2 className="brand-title text-3xl text-white sm:text-5xl">Ближайшие события</h2>
              </div>
              <a href="/tournaments" className="inline-flex items-center gap-2 text-sm font-black uppercase text-white/70 transition hover:text-white">
                Всё расписание
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {visibleEvents.length > 0 ? (
              <div className="grid gap-3 lg:grid-cols-3">
                {visibleEvents.map((tournament) => {
                  const status = getEventStatus(tournament)
                  return (
                    <article key={tournament.id || tournament.title} className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.06]">
                      {tournament.poster_url && (
                        <div className="overflow-hidden bg-black/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={tournament.poster_url} alt={tournament.title} className="aspect-[16/10] w-full object-cover transition duration-300 hover:scale-[1.035]" loading="lazy" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getEventStatusClass(status)}`}>{status}</span>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black uppercase text-white/64">beginner friendly</span>
                        </div>
                        <h3 className="brand-font text-2xl leading-none text-white">{tournament.title}</h3>
                        <div className="mt-4 grid gap-2 text-sm font-semibold text-white/62">
                          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{getTournamentDate(tournament)}</div>
                          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{tournament.location || tournament.address || "место скоро"}</div>
                          <div className="flex items-center gap-2"><Trophy className="h-4 w-4" />{tournament.format || "club format"}</div>
                          <div className="flex items-center gap-2"><Users className="h-4 w-4" />{Number(tournament.registration_count || 0)} уже в списке</div>
                        </div>
                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/52">
                          {tournament.description || "Приходи за 10 минут до начала. Формат объясним на месте, даже если это твой первый клубный вечер."}
                        </p>
                        <a href="/tournaments" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black uppercase text-[#151515] transition hover:bg-[#fff200]">
                          Записаться
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-6">
                <h3 className="brand-font text-2xl text-white">Анонсы выходят в Telegram первыми</h3>
                <p className="mt-3 max-w-2xl text-white/62">Новое событие появится здесь карточкой. А если хочешь узнать первым, лучше заглянуть в канал.</p>
                <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black uppercase text-[#151515]">
                  Открыть Telegram
                  <Send className="h-4 w-4" />
                </a>
              </div>
            )}
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {SCENARIOS.map((scenario) => {
              const Icon = scenario.icon
              return (
                <a key={scenario.title} href={scenario.href} className="brand-panel group relative min-h-[260px] overflow-hidden p-5 transition hover:-translate-y-1 hover:bg-white">
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-90 transition group-hover:scale-110" style={{ backgroundColor: scenario.accent }} />
                  <Icon className="relative z-10 h-8 w-8 text-[#151515]" />
                  <h3 className="brand-font relative z-10 mt-8 text-2xl leading-none">{scenario.title}</h3>
                  <p className="relative z-10 mt-4 text-sm font-semibold leading-relaxed text-[#151515]/68">{scenario.text}</p>
                  <div className="relative z-10 mt-6 inline-flex items-center gap-2 text-sm font-black uppercase">
                    {scenario.cta}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </a>
              )
            })}
          </section>

          <section className="brand-panel-dark p-5 sm:p-7" aria-labelledby="seo-chess-krasnodar">
            <div className="mb-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <div className="brand-chip mb-3 inline-flex w-fit items-center gap-2 px-3 py-1 text-xs font-black uppercase">
                  <Search className="h-4 w-4" />
                  Шахматы Краснодар
                </div>
                <h2 id="seo-chess-krasnodar" className="brand-title text-3xl text-white sm:text-5xl">
                  Где играть в шахматы в Краснодаре
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-white/62 sm:text-base">
                Если коротко: у нас. Есть расписание, турниры для разных уровней, уроки, лекции, мерч и отдельные форматы для компаний.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {SEO_TOPICS.map((topic) => (
                <article key={topic.title} className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5">
                  <h3 className="brand-font text-xl leading-tight text-white">{topic.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">{topic.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <article className="brand-panel-dark overflow-hidden p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="brand-chip mb-3 w-fit px-3 py-1 text-xs font-black uppercase">Живой клуб</div>
                  <h2 className="brand-title text-3xl text-white sm:text-5xl">Не кружок. Событие.</h2>
                </div>
                <Camera className="hidden h-10 w-10 text-white/45 sm:block" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {galleryItems.map((item, index) => (
                  <figure key={`${item.id}-${item.title}`} className={`group relative overflow-hidden rounded-[18px] border border-white/10 bg-white/5 ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url || ""} alt={item.title} className="aspect-square h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" loading="lazy" />
                    <figcaption className="absolute inset-x-2 bottom-2 rounded-2xl bg-black/62 px-3 py-2 text-xs font-bold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                      {item.title}
                    </figcaption>
                  </figure>
                ))}
                {galleryItems.length === 0 && (
                  <div className="col-span-full rounded-[18px] border border-white/10 bg-white/5 p-6 text-white/62">
                    Фотоотчеты скоро появятся здесь. Самое свежее пока выкладываем в Telegram.
                  </div>
                )}
              </div>
            </article>

            <article className="brand-panel p-5 sm:p-6">
              <div className="brand-chip mb-4 w-fit px-3 py-1 text-xs font-black uppercase">Ближайший вход</div>
              {upcomingTournament ? (
                <>
                  <h2 className="brand-font text-2xl leading-tight sm:text-3xl">{upcomingTournament.title}</h2>
                  <p className="mt-4 leading-relaxed text-[#151515]/68">Открой карточку, посмотри место и формат, нажми запись. Без длинных анкет и лишних кругов.</p>
                  <a href="/tournaments" className="brand-button mt-6 inline-flex w-full items-center justify-center gap-2 px-5 py-3">
                    Перейти к записи
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </>
              ) : (
                <>
                  <h2 className="brand-font text-2xl leading-tight sm:text-3xl">Скоро новый drop</h2>
                  <p className="mt-4 leading-relaxed text-[#151515]/68">Новый анонс обычно сначала появляется в канале. Потом уже красиво ложится на сайт.</p>
                  <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="brand-button mt-6 inline-flex w-full items-center justify-center gap-2 px-5 py-3">
                    Telegram
                    <Send className="h-5 w-5" />
                  </a>
                </>
              )}
            </article>
          </section>

          <section className="brand-panel-dark p-5 sm:p-7">
            <div className="mb-5">
              <div className="brand-chip mb-3 w-fit px-3 py-1 text-xs font-black uppercase">Форматы</div>
              <h2 className="brand-title text-3xl text-white sm:text-5xl">Для разных людей и настроений</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FORMATS.map((format) => {
                const Icon = format.icon
                return (
                  <article key={format.title} className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 transition hover:bg-white/[0.1]">
                    <Icon className="h-7 w-7 text-[#fff200]" />
                    <h3 className="brand-font mt-5 text-xl leading-none text-white">{format.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/58">{format.text}</p>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="brand-panel-dark p-5 sm:p-7">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <div className="brand-chip mb-3 w-fit px-3 py-1 text-xs font-black uppercase">Клубная лента</div>
                <h2 className="brand-title text-3xl text-white sm:text-5xl">Полезное внутри клуба</h2>
              </div>
              <a href="/club" className="inline-flex items-center gap-2 text-sm font-black uppercase text-white/70 transition hover:text-white">
                Все материалы
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {featuredClubItems.map((item, index) => (
                <article key={`${item.id}-${item.title}`} className="relative min-h-[220px] overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.06] p-5">
                  <div className="absolute right-4 top-4 brand-font text-5xl text-white/[0.05]">{String(index + 1).padStart(2, "0")}</div>
                  <div className="mb-4 w-fit rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-[#151515]">{CLUB_CONTENT_TYPE_LABELS[item.type]}</div>
                  <h3 className="text-xl font-black text-white">{item.title}</h3>
                  {item.subtitle && <p className="mt-3 text-sm leading-relaxed text-white/62">{item.subtitle}</p>}
                  {item.body && <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-white/48">{item.body}</p>}
                </article>
              ))}
            </div>
          </section>

          <section className="brand-panel p-5 sm:p-7">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <div className="brand-chip mb-3 w-fit px-3 py-1 text-xs font-black uppercase">Доска почёта</div>
                <h2 className="brand-title text-3xl sm:text-5xl">Герои вечера</h2>
              </div>
              <Crown className="hidden h-10 w-10 text-[#151515]/35 sm:block" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {(honorItems.length ? honorItems.map((item) => ({
                title: item.title,
                name: item.author_name || item.subtitle || "Участник клуба",
                metric: item.body || "за вклад в клубную культуру",
              })) : HONOR_FALLBACK).map((item) => (
                <article key={`${item.title}-${item.name}`} className="rounded-[20px] border border-[#151515]/10 bg-[#151515]/5 p-5">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#151515] text-white">
                    <Trophy className="h-7 w-7" />
                  </div>
                  <div className="text-xs font-black uppercase text-[#151515]/52">{item.title}</div>
                  <h3 className="brand-font mt-2 text-2xl leading-none">{item.name}</h3>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-[#151515]/62">{item.metric}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="brand-panel relative overflow-hidden p-5 sm:p-7">
            <div className="brand-sticker pointer-events-none absolute -right-10 top-8 h-12 w-36 rotate-[-12deg] bg-[#ff1515]" />
            <div className="max-w-3xl">
              <div className="brand-chip mb-4 w-fit px-3 py-1 text-xs font-black uppercase">Канал клуба</div>
              <h2 className="brand-title text-3xl sm:text-5xl">Все начинается в Telegram</h2>
              <p className="mt-4 text-base leading-relaxed text-[#151515]/68 sm:text-lg">
                Там быстрее всего появляются анонсы, переносы, фото, обсуждения и записи на ближайшие шахматные вечера.
              </p>
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="brand-button mt-6 inline-flex w-full items-center justify-center gap-2 px-5 py-3 sm:w-auto">
                Подписаться на Rep Chess KRD
                <Flame className="h-5 w-5" />
              </a>
            </div>
          </section>
        </main>
      </div>
      <MobileDock />
    </ChessBackground>
  );
}
