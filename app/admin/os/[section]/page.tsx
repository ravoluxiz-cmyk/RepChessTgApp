import type { Metadata } from "next"
import { notFound } from "next/navigation"
import RepChessOsClient, { type RepChessOsSectionKey } from "@/components/admin/os/rep-chess-os-client"

export const metadata: Metadata = {
  title: "Rep Chess OS",
  robots: {
    index: false,
    follow: false,
  },
}

const SECTION_MAP = {
  dashboard: "dashboard",
  tasks: "tasks",
  leads: "leads",
  directions: "directions",
  plans: "plans",
  events: "events",
  finance: "finance_entries",
  "weekly-review": "weekly_reviews",
  messages: "message_templates",
  settings: "settings",
} as const satisfies Record<string, RepChessOsSectionKey>

export default async function RepChessOsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const initialSection = SECTION_MAP[section as keyof typeof SECTION_MAP]

  if (!initialSection) {
    notFound()
  }

  return <RepChessOsClient initialSection={initialSection} />
}
