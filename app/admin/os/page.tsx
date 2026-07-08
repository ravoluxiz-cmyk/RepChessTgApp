import type { Metadata } from "next"
import RepChessOsClient from "@/components/admin/os/rep-chess-os-client"

export const metadata: Metadata = {
  title: "Rep Chess OS",
  robots: {
    index: false,
    follow: false,
  },
}

export default function RepChessOsPage() {
  return <RepChessOsClient />
}
