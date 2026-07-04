import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import { buildBreadcrumbJsonLd, buildGraphJsonLd } from "@/lib/seo"

const lessonsJsonLd = buildGraphJsonLd([
  {
    "@type": "WebPage",
    "@id": "https://repchesskrd.ru/lessons#webpage",
    name: "Уроки шахмат в Краснодаре",
    url: "https://repchesskrd.ru/lessons",
    inLanguage: "ru-RU",
    isPartOf: {
      "@id": "https://repchesskrd.ru/#website",
    },
    about: {
      "@id": "https://repchesskrd.ru/#organization",
    },
  },
  {
    "@type": "Service",
    "@id": "https://repchesskrd.ru/lessons#service",
    name: "Уроки шахмат Rep Chess KRD",
    provider: {
      "@id": "https://repchesskrd.ru/#organization",
    },
    areaServed: {
      "@type": "City",
      name: "Краснодар",
    },
    serviceType: "Обучение шахматам",
  },
  buildBreadcrumbJsonLd([
    { name: "Главная", path: "/" },
    { name: "Уроки", path: "/lessons" },
  ]),
])

export const metadata: Metadata = {
  title: "Уроки шахмат в Краснодаре - обучение для новичков и любителей",
  description: "Уроки шахмат Rep Chess KRD в Краснодаре: обучение для начинающих, клубная практика, разбор партий, лекции и помощь с первым турниром.",
  alternates: {
    canonical: "/lessons",
  },
  openGraph: {
    title: "Уроки шахмат в Краснодаре | Rep Chess KRD",
    description: "Индивидуальные и клубные шахматные занятия Rep Chess KRD.",
    url: "https://repchesskrd.ru/lessons",
  },
}

export default function LessonsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={lessonsJsonLd} />
      {children}
    </>
  )
}
