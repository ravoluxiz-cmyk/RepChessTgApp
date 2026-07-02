"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    async function logout() {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
      router.push("/")
      router.refresh()
    }

    logout()
  }, [router])

  return (
    <ChessBackground>
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-white">
        <div>
          <h1 className="brand-title text-4xl">Выходим из профиля</h1>
          <p className="mt-3 text-white/60">Сессия закрывается.</p>
        </div>
      </div>
    </ChessBackground>
  )
}
