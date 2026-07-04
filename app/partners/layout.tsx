import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import { buildBreadcrumbJsonLd, buildGraphJsonLd } from "@/lib/seo"

const partnersJsonLd = buildGraphJsonLd([
  {
    "@type": "Service",
    "@id": "https://repchesskrd.ru/partners#service",
    name: "Шахматные мероприятия для компаний и площадок",
    provider: {
      "@id": "https://repchesskrd.ru/#organization",
    },
    areaServed: {
      "@type": "City",
      name: "Краснодар",
    },
    serviceType: "Организация шахматных мероприятий",
    url: "https://repchesskrd.ru/partners",
  },
  {
    "@type": "WebPage",
    "@id": "https://repchesskrd.ru/partners#webpage",
    name: "Провести мероприятие с Rep Chess KRD",
    url: "https://repchesskrd.ru/partners",
    inLanguage: "ru-RU",
    isPartOf: {
      "@id": "https://repchesskrd.ru/#website",
    },
    about: {
      "@id": "https://repchesskrd.ru/partners#service",
    },
  },
  buildBreadcrumbJsonLd([
    { name: "Главная", path: "/" },
    { name: "Для компаний и площадок", path: "/partners" },
  ]),
])

export const metadata: Metadata = {
  title: "Шахматные мероприятия для компаний в Краснодаре",
  description: "Rep Chess KRD проводит корпоративные шахматные турниры, лекции, обучение, фестивальные pop-up форматы и партнерские события для компаний и площадок Краснодара.",
  alternates: {
    canonical: "/partners",
  },
  openGraph: {
    title: "Шахматные мероприятия для компаний | Rep Chess KRD",
    description: "Корпоративные шахматные события, лекции и турниры для партнеров.",
    url: "https://repchesskrd.ru/partners",
  },
}

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={partnersJsonLd} />
      {children}
    </>
  )
}
