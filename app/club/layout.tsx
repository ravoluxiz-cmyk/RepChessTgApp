import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import { buildBreadcrumbJsonLd, buildGraphJsonLd } from "@/lib/seo"

const clubJsonLd = buildGraphJsonLd([
  {
    "@type": "CollectionPage",
    "@id": "https://repchesskrd.ru/club#webpage",
    name: "Клуб Rep Chess KRD",
    url: "https://repchesskrd.ru/club",
    inLanguage: "ru-RU",
    isPartOf: {
      "@id": "https://repchesskrd.ru/#website",
    },
    about: {
      "@id": "https://repchesskrd.ru/#organization",
    },
  },
  buildBreadcrumbJsonLd([
    { name: "Главная", path: "/" },
    { name: "Клуб", path: "/club" },
  ]),
])

export const metadata: Metadata = {
  title: "Шахматный клуб Rep Chess KRD - новости, правила и отзывы",
  description: "Клуб Rep Chess KRD в Краснодаре: новости шахматного комьюнити, лекции, правила турниров, отзывы участников и доска почета.",
  alternates: {
    canonical: "/club",
  },
  openGraph: {
    title: "Клуб Rep Chess KRD",
    description: "Новости, лекции, правила, отзывы и доска почета Rep Chess KRD.",
    url: "https://repchesskrd.ru/club",
  },
}

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={clubJsonLd} />
      {children}
    </>
  )
}
