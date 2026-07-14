import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Выход",
  description: "Выход из профиля игрока Rep Chess KRD.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function LogoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
