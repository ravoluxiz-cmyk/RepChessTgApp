import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Рейтинг игроков",
  description: "Таблица лидеров Rep Chess KRD: рейтинг игроков клуба, статистика партий и прогресс участников шахматного сообщества.",
  alternates: {
    canonical: "/rating/leaderboard",
  },
  openGraph: {
    title: "Рейтинг игроков Rep Chess KRD",
    description: "Клубная таблица лидеров и рейтинг игроков Rep Chess KRD.",
    url: "https://repchesskrd.ru/rating/leaderboard",
  },
}

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
