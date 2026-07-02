"use client"

const STORAGE_KEY = "repchess_web_user"

interface StoredWebUser {
  id: number
  first_name: string
  last_name: string
  username: string
}

function createWebUser(): StoredWebUser {
  const id = 900000000 + Math.floor(Math.random() * 89999999)
  return {
    id,
    first_name: "Web",
    last_name: "Player",
    username: `web_${id}`,
  }
}

export function getWebUserAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const user = raw ? (JSON.parse(raw) as StoredWebUser) : createWebUser()

    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    }

    return {
      "X-RepChess-Web-User": JSON.stringify(user),
    }
  } catch {
    return {
      "X-RepChess-Web-User": JSON.stringify(createWebUser()),
    }
  }
}

export function getProfileAuthHeaders(initData: string): Record<string, string> {
  if (initData) {
    return { Authorization: `Bearer ${initData}` }
  }

  return {}
}
