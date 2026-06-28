import ChessBackground from "@/components/ChessBackground"
import { BackButton } from "@/components/ui/back-button"
import { ArrowRight, CalendarDays, GraduationCap, MessageCircle, ShieldCheck, Trophy } from "lucide-react"

const STEPS = [
  "Приходи за 10 минут до начала, даже если идешь один.",
  "Организатор объяснит формат, пары, часы и что делать после партии.",
  "Если это первый турнир, просто скажи об этом. Мы не делаем вид, что все родились с рейтингом.",
]

const FAQ = [
  {
    title: "Можно без рейтинга?",
    text: "Да. Стартовый рейтинг и калибровка нужны системе, но на первый вечер можно приходить спокойно.",
  },
  {
    title: "Что такое швейцарка?",
    text: "Это формат, где ты играешь несколько туров с соперниками близко к твоему результату. Объясним на месте.",
  },
  {
    title: "Будет душно?",
    text: "Нет. Мы играем честно, но без шахматного снобизма. Главные ценности: кайф, комьюнити и шахматы.",
  },
]

export const metadata = {
  title: "Новичкам",
  description: "Как прийти на первое шахматное событие Rep Chess KRD в Краснодаре: формат, уровень, регистрация и Telegram.",
}

export default function BeginnersPage() {
  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <BackButton />

          <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="brand-panel-dark relative overflow-hidden p-5 sm:p-8">
              <div className="brand-bg-icons pointer-events-none absolute -right-24 -top-24 h-80 w-80 opacity-[0.08]" />
              <div className="brand-chip mb-5 w-fit px-3 py-1 text-xs font-black uppercase">Beginner friendly</div>
              <h1 className="brand-title text-4xl text-white sm:text-6xl md:text-7xl">Первый турнир без паники</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/66 sm:text-lg">
                Нормально, если ты не знаешь, что такое швейцарка, как ставить часы или что делать после партии. Приходи, мы объясним формат и поможем зайти в клуб без ощущения экзамена.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="/tournaments" className="brand-button inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3">
                  Смотреть события
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a href="https://t.me/RepChessKRD" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black uppercase text-white transition hover:bg-white hover:text-[#151515]">
                  Telegram клуба
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { icon: GraduationCap, title: "Играю впервые", text: "Подойдут уроки и beginner-friendly события." },
                { icon: ShieldCheck, title: "Знаю правила", text: "Можно смело пробовать клубный турнир." },
                { icon: Trophy, title: "Играю онлайн", text: "Блиц и Фишер быстро покажут твой стиль." },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.title} className="brand-panel-dark flex min-h-32 items-center gap-4 p-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#151515]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="brand-font text-xl text-white">{item.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-white/58">{item.text}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="brand-panel p-5 sm:p-6">
              <div className="brand-chip mb-4 w-fit px-3 py-1 text-xs font-black uppercase">Как это проходит</div>
              <div className="space-y-4">
                {STEPS.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="brand-font flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#151515] text-white">{index + 1}</div>
                    <p className="pt-2 font-semibold leading-relaxed text-[#151515]/68">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {FAQ.map((item) => (
                <article key={item.title} className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5">
                  <h3 className="brand-font text-xl text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/62">{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-5 brand-panel relative overflow-hidden p-5 sm:p-7">
            <CalendarDays className="absolute right-6 top-6 h-12 w-12 text-[#151515]/18" />
            <h2 className="brand-title text-3xl sm:text-5xl">Начать проще с ближайшего события</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[#151515]/68">
              В карточке события будет дата, место, формат и кнопка записи. Если сомневаешься, напиши в Telegram — подскажем, какой формат выбрать.
            </p>
            <a href="/tournaments" className="brand-button mt-6 inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3">
              К расписанию
              <ArrowRight className="h-5 w-5" />
            </a>
          </section>
        </div>
      </main>
    </ChessBackground>
  )
}
