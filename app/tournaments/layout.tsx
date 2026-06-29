import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Шахматные турниры в Краснодаре - расписание и запись",
  description: "Актуальное расписание шахматных турниров Rep Chess KRD в Краснодаре: клубные вечера, блиц, форматы для новичков, регистрация, адреса площадок и афиши.",
  alternates: {
    canonical: "/tournaments",
  },
  openGraph: {
    title: "Шахматные турниры в Краснодаре | Rep Chess KRD",
    description: "Актуальное расписание шахматных турниров и клубных мероприятий Rep Chess KRD.",
    url: "https://repchesskrd.ru/tournaments",
  },
}

export default function TournamentsLayout({ children }: { children: React.ReactNode }) {
  return children
}
