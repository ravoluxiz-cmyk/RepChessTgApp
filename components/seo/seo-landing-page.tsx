import ChessBackground from "@/components/ChessBackground"
import { BackButton } from "@/components/ui/back-button"

type SeoLinkCard = {
  title: string
  text: string
  href?: string
  cta?: string
}

type SeoFaq = {
  question: string
  answer: string
}

type SeoLandingPageProps = {
  title: string
  lead: string
  listTitle: string
  listItems: string[]
  cards: SeoLinkCard[]
  introTitle: string
  introParagraphs: string[]
  faq: SeoFaq[]
  finalTitle: string
  finalText: string
  primaryHref: string
  primaryCta: string
  secondaryHref: string
  secondaryCta: string
  jsonLd: Record<string, unknown>
}

export function SeoLandingPage({
  title,
  lead,
  listTitle,
  listItems,
  cards,
  introTitle,
  introParagraphs,
  faq,
  finalTitle,
  finalText,
  primaryHref,
  primaryCta,
  secondaryHref,
  secondaryCta,
  jsonLd,
}: SeoLandingPageProps) {
  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-8 text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="mx-auto max-w-6xl">
          <BackButton />

          <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <article className="brand-panel-dark relative overflow-hidden p-5 sm:p-8">
              <div className="brand-bg-icons pointer-events-none absolute -right-24 -top-24 h-80 w-80 opacity-[0.07]" />
              <h1 className="brand-title max-w-4xl text-4xl leading-none text-white sm:text-6xl md:text-7xl">
                {title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/68 sm:text-lg">
                {lead}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href={primaryHref} className="brand-button inline-flex min-h-12 items-center justify-center px-5 py-3">
                  {primaryCta}
                </a>
                <a href={secondaryHref} className="brand-button-dark inline-flex min-h-12 items-center justify-center px-5 py-3">
                  {secondaryCta}
                </a>
              </div>
            </article>

            <aside className="brand-panel p-5 text-[#151515] sm:p-6">
              <h2 className="brand-title text-3xl leading-none">{listTitle}</h2>
              <ul className="mt-5 space-y-3 text-sm font-semibold leading-relaxed text-[#151515]/70">
                {listItems.map((item) => (
                  <li key={item} className="rounded-2xl border border-[#151515]/10 bg-white px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-2">
            {cards.map((item) => (
              <article key={item.title} className="brand-panel-dark flex min-h-[250px] flex-col p-5 sm:p-6">
                <h2 className="brand-font text-3xl leading-none text-white">{item.title}</h2>
                <p className="mt-4 flex-1 text-base leading-relaxed text-white/62">{item.text}</p>
                {item.href && item.cta ? (
                  <a href={item.href} className="mt-6 inline-flex text-sm font-black uppercase text-white/78 transition hover:text-white">
                    {item.cta} →
                  </a>
                ) : null}
              </article>
            ))}
          </section>

          <section className="brand-panel mt-5 p-5 text-[#151515] sm:p-7">
            <h2 className="brand-title text-3xl leading-none sm:text-5xl">
              {introTitle}
            </h2>
            <div className="mt-5 grid gap-5 text-base font-semibold leading-relaxed text-[#151515]/68 lg:grid-cols-2">
              {introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="mt-5 grid gap-3 md:grid-cols-2">
            {faq.map((item) => (
              <article key={item.question} className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5">
                <h2 className="brand-font text-2xl leading-none text-white">{item.question}</h2>
                <p className="mt-4 text-sm leading-relaxed text-white/62">{item.answer}</p>
              </article>
            ))}
          </section>

          <section className="brand-panel-dark mt-5 p-5 sm:p-7">
            <h2 className="brand-title text-3xl leading-none text-white sm:text-5xl">
              {finalTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/64">
              {finalText}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={primaryHref} className="brand-button inline-flex min-h-12 items-center justify-center px-5 py-3">
                {primaryCta}
              </a>
              <a href={secondaryHref} className="brand-button-dark inline-flex min-h-12 items-center justify-center px-5 py-3">
                {secondaryCta}
              </a>
            </div>
          </section>
        </div>
      </main>
    </ChessBackground>
  )
}
