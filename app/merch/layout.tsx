import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Шахматный мерч Rep Chess KRD - футболки, лонгсливы и клубные вещи",
  description: "Купить шахматный мерч Rep Chess KRD в Краснодаре: футболки I Hate Chess, лонгсливы, клубная одежда, цены, размеры и заявка на заказ.",
  alternates: {
    canonical: "/merch",
  },
  openGraph: {
    title: "Шахматный мерч Rep Chess KRD",
    description: "Футболки, лонгсливы и клубные вещи Rep Chess KRD для шахматного комьюнити Краснодара.",
    url: "https://repchesskrd.ru/merch",
  },
}

export default function MerchLayout({ children }: { children: React.ReactNode }) {
  return children
}
