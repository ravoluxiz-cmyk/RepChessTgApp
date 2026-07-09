"use client"

export function getWebUserAuthHeaders(): Record<string, string> {
  return {}
}

export function getProfileAuthHeaders(initData: string): Record<string, string> {
  if (initData) {
    return { Authorization: `Bearer ${initData}` }
  }

  return {}
}
