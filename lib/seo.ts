import type { Tournament } from "@/lib/db"
import type { MerchProduct } from "@/lib/merch-products"

export const SITE_URL = "https://repchesskrd.ru"
export const TELEGRAM_URL = "https://t.me/RepChessKRD"

type FaqItem = {
  question: string
  answer: string
}

type BreadcrumbItem = {
  name: string
  path: string
}

function cleanText(value?: string | null) {
  return String(value || "").replace(/\s+/g, " ").trim()
}

export function absoluteUrl(pathOrUrl: string) {
  if (!pathOrUrl) return SITE_URL
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`
}

export function buildFaqPageJsonLd(items: FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function buildOrganizationJsonLd() {
  return {
    "@type": "SportsOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: "Rep Chess KRD",
    alternateName: ["Реп Чесс Краснодар", "Rep Chess Краснодар"],
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    image: absoluteUrl("/icon.svg"),
    sport: "Chess",
    areaServed: {
      "@type": "City",
      name: "Краснодар",
      addressCountry: "RU",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: TELEGRAM_URL,
      availableLanguage: "Russian",
    },
    sameAs: [
      "https://repchess.ru",
      TELEGRAM_URL,
    ],
    description: "Шахматное комьюнити в Краснодаре: Telegram-канал, турниры, уроки, лекции, клубные встречи, мерч и корпоративные шахматные мероприятия.",
  }
}

export function buildWebsiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Rep Chess KRD",
    inLanguage: "ru-RU",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  }
}

export function buildTournamentEventJsonLd(tournament: Tournament) {
  const startDate = tournament.start_at || tournament.created_at
  if (!startDate) return null

  const url = absoluteUrl(tournament.id ? `/tournaments#tournament-${tournament.id}` : "/tournaments")
  const image = tournament.poster_url ? absoluteUrl(tournament.poster_url) : absoluteUrl("/icon.svg")
  const description = cleanText(tournament.description) || `Шахматный турнир Rep Chess KRD в Краснодаре: ${tournament.title}.`
  const placeName = cleanText(tournament.location) || "Rep Chess KRD"
  const address = cleanText(tournament.address) || "Краснодар"

  return {
    "@type": "Event",
    name: tournament.title,
    url,
    startDate,
    endDate: tournament.end_at || undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [image],
    description,
    location: {
      "@type": "Place",
      name: placeName,
      address: {
        "@type": "PostalAddress",
        streetAddress: address,
        addressLocality: "Краснодар",
        addressCountry: "RU",
      },
    },
    organizer: {
      "@id": `${SITE_URL}/#organization`,
    },
    offers: {
      "@type": "Offer",
      url,
      availability: Number(tournament.allow_join) === 1
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      price: 0,
      priceCurrency: "RUB",
      validFrom: tournament.created_at || startDate,
    },
  }
}

export function buildTournamentItemListJsonLd(tournaments: Tournament[]) {
  const events = tournaments
    .map(buildTournamentEventJsonLd)
    .filter(Boolean)

  return {
    "@type": "ItemList",
    name: "Ближайшие шахматные турниры Rep Chess KRD в Краснодаре",
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: event,
    })),
  }
}

export function buildProductJsonLd(product: MerchProduct) {
  return {
    "@type": "Product",
    "@id": `${SITE_URL}/merch#${product.id}`,
    name: product.name,
    image: [absoluteUrl(product.image)],
    description: product.shortDescription,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Rep Chess KRD",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/merch#${product.id}`,
      priceCurrency: "RUB",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  }
}

export function buildGraphJsonLd(nodes: Array<Record<string, unknown> | null | undefined>) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  }
}
