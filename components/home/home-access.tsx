"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import styles from "./home-refresh.module.css"

export function HomeAccess() {
  const router = useRouter()
  const { webApp, isReady } = useTelegramWebApp()
  const initData = webApp?.initData || ""
  useEffect(() => {
    if (!isReady || !initData) return
    const controller = new AbortController()
    fetch("/api/profile", { headers: { Authorization: `Bearer ${initData}` }, signal: controller.signal })
      .catch((error: Error) => { if (error.name !== "AbortError") console.error("Home profile sync failed:", error) })
    return () => controller.abort()
  }, [isReady, initData])
  async function openAdmin() {
    try {
      const response = await fetch("/api/admin/check", { headers: initData ? { Authorization: `Bearer ${initData}` } : undefined })
      router.push(response.ok ? "/admin" : "/admin/login")
    } catch { router.push("/admin/login") }
  }
  return <button type="button" className={styles.footerAdmin} onClick={openAdmin}>Организаторам ↗</button>
}
