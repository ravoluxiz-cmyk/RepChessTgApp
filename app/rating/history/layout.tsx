import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "История рейтинга",
  description: "История изменения рейтинга игрока Rep Chess KRD.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function RatingHistoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
