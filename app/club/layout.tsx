import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Клуб, новости, правила и отзывы",
  description: "Клуб Rep Chess KRD: новости, лекции, правила недушных шахмат, отзывы участников и доска почета шахматного комьюнити Краснодара.",
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
