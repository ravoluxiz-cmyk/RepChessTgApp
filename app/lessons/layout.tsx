import type { Metadata } from "next"

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
  return children
}
