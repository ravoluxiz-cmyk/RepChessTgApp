import type { Metadata } from "next"

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
  return children
}
