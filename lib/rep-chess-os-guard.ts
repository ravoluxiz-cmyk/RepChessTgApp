import { isRepChessOsPasswordConfigured, verifyRepChessOsSessionFromHeaders } from "@/lib/rep-chess-os-auth"
import { requireAdmin } from "@/lib/telegram"

export interface RepChessOsAccessError {
  status: number
  error: string
}

export async function getRepChessOsAccessError(headers: Headers): Promise<RepChessOsAccessError | null> {
  const adminUser = await requireAdmin(headers)
  if (!adminUser) {
    return { status: 403, error: "Forbidden" }
  }

  if (!isRepChessOsPasswordConfigured()) {
    return { status: 503, error: "REPCHESS_OS_PASSWORD is not configured" }
  }

  if (!verifyRepChessOsSessionFromHeaders(headers)) {
    return { status: 401, error: "Rep Chess OS is locked" }
  }

  return null
}
