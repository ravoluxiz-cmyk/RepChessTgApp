export const PLAYER_STATUSES = [
  "Player",
  "Admin",
  "Boss",
  "Chief",
  "Legend",
  "Goat",
  "CM",
  "FM",
  "IM",
  "GM",
  "WCM",
  "WFM",
  "WIM",
  "WGM",
] as const

export type PlayerStatus = (typeof PLAYER_STATUSES)[number]

const PLAYER_STATUS_SET = new Set<string>(PLAYER_STATUSES)
const ADMIN_PLAYER_STATUS_SET = new Set<string>(["Admin", "Boss", "Chief"])

export function isPlayerStatus(value: unknown): value is PlayerStatus {
  return typeof value === "string" && PLAYER_STATUS_SET.has(value)
}

export function normalizePlayerStatus(value: unknown): PlayerStatus {
  return isPlayerStatus(value) ? value : "Player"
}

export function resolvePlayerStatus(
  playerStatus: unknown,
  role?: unknown
): PlayerStatus {
  if (isPlayerStatus(playerStatus)) return playerStatus
  if (isPlayerStatus(role)) return role
  if (role === "admin" || role === "moderator") return "Admin"
  return "Player"
}

export function isAdministrativePlayerStatus(value: unknown): boolean {
  return typeof value === "string" && ADMIN_PLAYER_STATUS_SET.has(value)
}
