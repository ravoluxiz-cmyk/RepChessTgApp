import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Шахматные мероприятия для компаний и площадок",
  description: "Rep Chess KRD проводит шахматные турниры, корпоративы, лекции, обучение и pop-up форматы для компаний, площадок и партнеров в Краснодаре.",
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
  return children
}
