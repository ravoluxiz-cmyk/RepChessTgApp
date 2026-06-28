import ChessBackground from "@/components/ChessBackground";
import { HomeHero } from "@/components/home/home-hero";
import { CLUB_CONTENT_TYPE_LABELS } from "@/lib/club-content";
import { listClubContent, listTournaments, type Tournament } from "@/lib/db";
import { ArrowRight, CalendarDays, Camera, Flame, MapPin, Send, Trophy, Users } from "lucide-react";

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

export const revalidate = 60

export default async function Home() {
  const [tournaments, clubContent] = await Promise.all([
    listTournaments(),
    listClubContent({ publishedOnly: true }),
  ])

  const upcomingTournament = getUpcomingTournament(tournaments)
  const galleryItems = clubContent
    .filter((item) => item.type === "gallery" && item.image_url)
    .slice(0, 6)
  const featuredClubItems = clubContent
    .filter((item) => item.type !== "gallery")
    .slice(0, 3)

  const activeTournaments = tournaments.filter((tournament) => Number(tournament.archived ?? 0) === 0)
  const registrationCount = tournaments.reduce((sum, tournament) => sum + Number(tournament.registration_count || 0), 0)

  return (
    <ChessBackground>
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4">
        <HomeHero />

        <main className="space-y-5 pb-16 sm:space-y-7 sm:pb-24">
          <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="brand-panel-dark relative overflow-hidden p-5 sm:p-7">
              <div className="brand-bg-icons pointer-events-none absolute -right-20 -top-24 h-72 w-72 opacity-[0.08]" />
              <div className="brand-chip mb-5 w-fit px-3 py-1 text-xs font-black uppercase">Кто мы</div>
              <h2 className="brand-title max-w-3xl text-3xl text-white sm:text-5xl md:text-6xl">
                Шахматы без пыли и лишнего пафоса
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/68 sm:text-lg">
                Rep Chess KRD собирает людей вокруг турниров, уроков, лекций и живого комьюнити. Мы делаем шахматы понятными, социальными и красивыми: можно прийти первый раз, сыграть блиц, познакомиться с людьми и остаться в клубе.
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
              {[
                { label: "Активных турниров", value: activeTournaments.length, icon: Trophy, color: "#fff200" },
                { label: "Регистраций в системе", value: registrationCount, icon: Users, color: "#20d66b" },
                { label: "Канал клуба", value: "Telegram", icon: Send, color: "#1357ff" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="brand-panel-dark flex min-h-32 items-center gap-4 p-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[#151515]" style={{ backgroundColor: item.color }}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="brand-font text-3xl text-white">{item.value}</div>
                      <div className="mt-1 text-sm font-bold uppercase text-white/56">{item.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <article className="brand-panel relative overflow-hidden p-5 sm:p-6">
              <div className="brand-chip mb-4 w-fit px-3 py-1 text-xs font-black uppercase">Ближайшее событие</div>
              {upcomingTournament ? (
                <>
                  {upcomingTournament.poster_url && (
                    <div className="mb-5 overflow-hidden rounded-[16px] bg-[#151515]/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={upcomingTournament.poster_url} alt={upcomingTournament.title} className="aspect-[16/10] w-full object-cover" />
                    </div>
                  )}
                  <h2 className="brand-font text-2xl leading-tight sm:text-3xl">{upcomingTournament.title}</h2>
                  <div className="mt-4 grid gap-3 text-sm font-bold text-[#151515]/72">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      {getTournamentDate(upcomingTournament)}
                    </div>
                    {(upcomingTournament.location || upcomingTournament.address) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {upcomingTournament.location || upcomingTournament.address}
                      </div>
                    )}
                  </div>
                  {upcomingTournament.description && (
                    <p className="mt-4 line-clamp-4 leading-relaxed text-[#151515]/68">{upcomingTournament.description}</p>
                  )}
                  <a href="/tournaments" className="brand-button mt-6 inline-flex w-full items-center justify-center gap-2 px-5 py-3 sm:w-auto">
                    Записаться
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </>
              ) : (
                <>
                  <h2 className="brand-font text-2xl leading-tight sm:text-3xl">Скоро новый турнир</h2>
                  <p className="mt-4 leading-relaxed text-[#151515]/68">
                    Расписание обновляется в админке. Подпишитесь на Telegram, чтобы первым увидеть анонс.
                  </p>
                  <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="brand-button mt-6 inline-flex items-center justify-center gap-2 px-5 py-3">
                    Открыть Telegram
                    <Send className="h-5 w-5" />
                  </a>
                </>
              )}
            </article>

            <article className="brand-panel-dark overflow-hidden p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="brand-chip mb-3 w-fit px-3 py-1 text-xs font-black uppercase">Фотогалерея</div>
                  <h2 className="brand-title text-3xl text-white sm:text-5xl">Живой клуб</h2>
                </div>
                <Camera className="hidden h-10 w-10 text-white/45 sm:block" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {galleryItems.map((item, index) => (
                  <div key={`${item.id}-${item.title}`} className={`overflow-hidden rounded-[18px] border border-white/10 bg-white/5 ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url || ""} alt={item.title} className="aspect-square h-full w-full object-cover" />
                  </div>
                ))}
                {galleryItems.length === 0 && (
                  <div className="col-span-full rounded-[18px] border border-white/10 bg-white/5 p-6 text-white/62">
                    Добавьте карточки типа “Галерея” в админке, и фото появятся здесь.
                  </div>
                )}
              </div>
            </article>
          </section>

          <section className="brand-panel-dark p-5 sm:p-7">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <div className="brand-chip mb-3 w-fit px-3 py-1 text-xs font-black uppercase">Club feed</div>
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

          <section className="brand-panel relative overflow-hidden p-5 sm:p-7">
            <div className="brand-sticker pointer-events-none absolute -right-10 top-8 h-12 w-36 rotate-[-12deg] bg-[#ff1515]" />
            <div className="max-w-3xl">
              <div className="brand-chip mb-4 w-fit px-3 py-1 text-xs font-black uppercase">Главная площадка</div>
              <h2 className="brand-title text-3xl sm:text-5xl">Все начинается в Telegram</h2>
              <p className="mt-4 text-base leading-relaxed text-[#151515]/68 sm:text-lg">
                Там появляются быстрые анонсы, обсуждения, фото, регистрация на клубные активности и вся живая коммуникация. Сайт нужен как удобная витрина и система записи, но пульс клуба находится в канале.
              </p>
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="brand-button mt-6 inline-flex w-full items-center justify-center gap-2 px-5 py-3 sm:w-auto">
                Подписаться на Rep Chess KRD
                <Flame className="h-5 w-5" />
              </a>
            </div>
          </section>
        </main>
      </div>
    </ChessBackground>
  );
}
