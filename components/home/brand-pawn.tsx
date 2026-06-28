"use client"

import dynamic from "next/dynamic"
import { HeroPawnDuelFallback } from "@/components/hero/HeroPawnDuelFallback"

const HeroPawnDuel = dynamic(() => import("@/components/hero/HeroPawnDuel"), {
  ssr: false,
  loading: () => <HeroPawnDuelFallback />,
})

export function BrandPawn() {
  return <HeroPawnDuel />
}
