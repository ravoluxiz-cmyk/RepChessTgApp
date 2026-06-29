import type { Metadata } from "next"

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
  return children
}
