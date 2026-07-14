import type { Metadata } from "next"
import RepChessOsClient from "@/components/admin/os/rep-chess-os-client"

export const metadata: Metadata = {
  title: "Rep Chess OS",
  description: "Закрытая операционная панель Rep Chess KRD.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function RepChessOsPage() {
  return <RepChessOsClient />
}
