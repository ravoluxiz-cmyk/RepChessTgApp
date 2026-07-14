import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Прогноз рейтинга",
  description: "Прогноз изменения рейтинга Rep Chess KRD перед партией.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function RatingPredictLayout({ children }: { children: React.ReactNode }) {
  return children
}
