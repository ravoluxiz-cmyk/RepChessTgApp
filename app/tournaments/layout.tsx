import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Шахматные турниры в Краснодаре",
  description: "Расписание шахматных турниров Rep Chess KRD в Краснодаре: клубные вечера, регистрация на события, адреса площадок и афиши мероприятий.",
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
