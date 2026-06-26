import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Матч",
  robots: {
    index: false,
    follow: false,
  },
}

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return children
}
