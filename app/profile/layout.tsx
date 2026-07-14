import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Профиль игрока",
  description: "Личный профиль игрока Rep Chess KRD с рейтингом, статусом и историей участия.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
