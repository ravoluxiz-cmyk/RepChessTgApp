import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Уроки шахмат в Краснодаре",
  description: "Запись на уроки шахмат Rep Chess KRD в Краснодаре для новичков, любителей и игроков, которые хотят прокачать практику и понимание игры.",
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
  return children
}
