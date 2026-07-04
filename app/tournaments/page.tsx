import type { Metadata } from "next"
import ChessBackground from "@/components/ChessBackground"
import { JsonLd } from "@/components/seo/json-ld"
import { TournamentsPageClient } from "@/components/tournaments/tournaments-page-client"
import { listTournaments } from "@/lib/db"
import { buildBreadcrumbJsonLd, buildGraphJsonLd, buildTournamentItemListJsonLd } from "@/lib/seo"
import { getUpcomingTournaments } from "@/lib/tournament-display"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Расписание шахматных турниров в Краснодаре - Rep Chess KRD",
  description:
    "Ближайшие шахматные турниры Rep Chess KRD в Краснодаре: даты, площадки, формат, афиши, регистрация и ссылки на Telegram-анонсы.",
  alternates: {
    canonical: "/tournaments",
  },
  openGraph: {
    title: "Расписание шахматных турниров Rep Chess KRD",
    description: "Даты, площадки, формат и регистрация на шахматные события в Краснодаре.",
    url: "https://repchesskrd.ru/tournaments",
  },
}

export default async function TournamentsPage() {
  const tournaments = getUpcomingTournaments(await listTournaments())
  const jsonLd = buildGraphJsonLd([
    {
      "@type": "CollectionPage",
      "@id": "https://repchesskrd.ru/tournaments#webpage",
      name: "Расписание шахматных турниров Rep Chess KRD",
      url: "https://repchesskrd.ru/tournaments",
      inLanguage: "ru-RU",
      isPartOf: {
        "@id": "https://repchesskrd.ru/#website",
      },
      about: {
        "@id": "https://repchesskrd.ru/#organization",
      },
    },
    buildTournamentItemListJsonLd(tournaments.slice(0, 10)),
    buildBreadcrumbJsonLd([
      { name: "Главная", path: "/" },
      { name: "Расписание", path: "/tournaments" },
    ]),
  ])

  return (
    <ChessBackground badge="" title1="" title2="" description="">
      <JsonLd data={jsonLd} />
      <TournamentsPageClient tournaments={tournaments} />
    </ChessBackground>
  )
}
