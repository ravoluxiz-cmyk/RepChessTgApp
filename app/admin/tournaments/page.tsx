"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"
import { ArrowLeft, List, CalendarDays, Archive, ArchiveRestore, Trash2, ListOrdered, Settings, RefreshCw, Users, MessageCircle } from "lucide-react"

type DbTournament = {
  id: number
  title: string
  format: string
  rounds: number
  archived: number
  created_at: string
  start_at?: string | null
  location?: string | null
  registration_count?: number
}

type TelegramChat = {
  id: number
  title: string
  type: string
  username?: string
}

export default function AdminAllTournamentsPage() {
  const router = useRouter()
  const { initData } = useTelegramWebApp()
  const [tournaments, setTournaments] = useState<DbTournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [telegramChats, setTelegramChats] = useState<TelegramChat[]>([])
  const [selectedChatId, setSelectedChatId] = useState("")
  const [loadingChats, setLoadingChats] = useState(false)
  const [applyingChat, setApplyingChat] = useState(false)
  const [chatMessage, setChatMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/tournaments")
        if (!res.ok) throw new Error("Не удалось загрузить турниры")
        const data = await res.json()
        setTournaments(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Неизвестная ошибка")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleArchiveToggle(t: DbTournament, makeArchived: boolean) {
    try {
      const res = await fetch(`/api/tournaments/${t.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
        body: JSON.stringify({ archived: makeArchived ? 1 : 0 }),
      })
      if (!res.ok) throw new Error("Не удалось обновить статус")
      setTournaments(prev => prev.map(it => it.id === t.id ? { ...it, archived: makeArchived ? 1 : 0 } : it))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка выполнения")
    }
  }

  async function handleSyncCalendar() {
    setSyncing(true)
    setError(null)
    setSyncMessage(null)
    try {
      const res = await fetch("/api/tournaments/sync-calendar", {
        method: "POST",
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Не удалось импортировать календарь")

      setSyncMessage(`Импортировано событий: ${data.imported || 0}`)
      const listRes = await fetch("/api/tournaments")
      if (listRes.ok) setTournaments(await listRes.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка импорта")
    } finally {
      setSyncing(false)
    }
  }

  async function handleFindTelegramChats() {
    setLoadingChats(true)
    setError(null)
    setChatMessage(null)
    try {
      const res = await fetch("/api/admin/telegram-chats", {
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Не удалось найти чаты")

      const chats = Array.isArray(data.chats) ? data.chats : []
      setTelegramChats(chats)
      if (chats.length > 0) {
        setSelectedChatId(String(chats[0].id))
        setChatMessage(`Найдено чатов: ${chats.length}`)
      } else {
        setChatMessage("Чаты не найдены. Напишите любое сообщение в нужном Telegram-чате и нажмите «Найти чаты» ещё раз.")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка поиска чатов")
    } finally {
      setLoadingChats(false)
    }
  }

  async function handleApplyTelegramChat() {
    if (!selectedChatId) {
      setError("Сначала выберите чат")
      return
    }

    if (!confirm(`Проставить chat_id ${selectedChatId} во все турниры?`)) return

    setApplyingChat(true)
    setError(null)
    setChatMessage(null)
    try {
      const res = await fetch("/api/admin/telegram-chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
        },
        body: JSON.stringify({ chat_id: selectedChatId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Не удалось обновить турниры")

      setChatMessage(`Готово: chat_id проставлен в турниры (${data.updated || 0}).`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка обновления чата")
    } finally {
      setApplyingChat(false)
    }
  }

  async function handleDelete(t: DbTournament) {
    if (!confirm(`Удалить турнир «${t.title}»? Действие необратимо.`)) return
    try {
      const res = await fetch(`/api/tournaments/${t.id}`, {
        method: "DELETE",
        headers: initData ? { Authorization: `Bearer ${initData}` } : undefined,
      })
      if (!res.ok) throw new Error("Не удалось удалить турнир")
      setTournaments(prev => prev.filter(it => it.id !== t.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка выполнения")
    }
  }

  return (
    <ChessBackground>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <button
            className="flex items-center gap-2 text-white/80 hover:text-white"
            onClick={() => router.push("/admin")}
            title="Назад к админ‑меню"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">К админ‑меню</span>
          </button>
        </div>

        {/* Title */}
        <div className="px-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-center gap-3">
            <List className="w-8 h-8 text-violet-400" /> Турниры
          </h1>
          <p className="mt-2 text-white/60">Список турниров с действиями управления</p>
          <button
            onClick={handleSyncCalendar}
            disabled={syncing}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 font-semibold text-cyan-50 hover:bg-cyan-500/25 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Импорт..." : "Импорт из Google Calendar"}
          </button>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
            <div className="flex items-center gap-2 text-lg font-bold">
              <MessageCircle className="h-5 w-5 text-emerald-300" />
              Telegram чат регистраций
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleFindTelegramChats}
                disabled={loadingChats}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 font-semibold text-emerald-50 hover:bg-emerald-500/25 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${loadingChats ? "animate-spin" : ""}`} />
                {loadingChats ? "Ищу..." : "Найти чаты"}
              </button>

              <select
                value={selectedChatId}
                onChange={(event) => setSelectedChatId(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#1a1f2e] px-3 py-2 text-white"
              >
                <option value="">Чат не выбран</option>
                {telegramChats.map((chat) => (
                  <option key={chat.id} value={chat.id}>
                    {chat.title} ({chat.id})
                  </option>
                ))}
              </select>

              <button
                onClick={handleApplyTelegramChat}
                disabled={applyingChat || !selectedChatId}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/15 px-4 py-2 font-semibold text-violet-50 hover:bg-violet-500/25 disabled:opacity-60"
              >
                {applyingChat ? "Ставлю..." : "Проставить всем"}
              </button>
            </div>
            <p className="mt-2 text-sm text-white/55">
              Если список пустой, напишите любое новое сообщение в нужном Telegram-чате, где есть бот, и повторите поиск.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-6">
          {loading && (
            <div className="text-white/80">Загрузка...</div>
          )}

          {error && (
            <div className="backdrop-blur-lg bg-red-500/10 border border-red-400/30 rounded-2xl p-4 text-red-200 mb-4">
              {error}
            </div>
          )}

          {syncMessage && (
            <div className="backdrop-blur-lg bg-cyan-500/10 border border-cyan-400/30 rounded-2xl p-4 text-cyan-100 mb-4">
              {syncMessage}
            </div>
          )}

          {chatMessage && (
            <div className="backdrop-blur-lg bg-emerald-500/10 border border-emerald-400/30 rounded-2xl p-4 text-emerald-100 mb-4">
              {chatMessage}
            </div>
          )}

          {!loading && tournaments.length === 0 && !error && (
            <div className="text-white/70">Турниров нет</div>
          )}

          {!loading && tournaments.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((t) => (
                <div key={t.id} className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 text-white max-w-full overflow-hidden">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="text-xl font-bold truncate min-w-0 pr-2">{t.title}</div>
                    {Number(t.archived) === 1 && (
                      <span className="flex-shrink-0 text-xs px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40">Архив</span>
                    )}
                  </div>
                  <div className="text-white/70 text-sm">Формат: {t.format}, Раундов: {t.rounds}</div>
                  <div className="text-white/70 text-xs flex items-center gap-2 mt-1 min-w-0">
                    <CalendarDays className="w-3 h-3 text-white/60" />
                    <span className="truncate">{new Date(t.start_at || t.created_at).toLocaleString("ru-RU")}</span>
                  </div>
                  {t.location && (
                    <div className="mt-1 text-white/70 text-xs truncate">{t.location}</div>
                  )}
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80">
                    <Users className="h-4 w-4 text-emerald-300" />
                    Регистраций: {t.registration_count || 0}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => router.push(`/admin/tournaments/${t.id}/participants`)}
                      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg w-full sm:w-auto"
                    >
                      Открыть
                    </button>
                    <button
                      onClick={() => router.push(`/admin/tournaments/${t.id}/settings`)}
                      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg border border-white/10 w-full sm:w-auto"
                      title="Настройки турнира"
                    >
                      <Settings className="w-4 h-4" /> Настройки
                    </button>
                    {Number(t.archived) === 1 && (
                      <button
                        onClick={() => router.push(`/admin/tournaments/${t.id}/results`)}
                        className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg border border-white/10 w-full sm:w-auto"
                        title="Перейти к таблице результатов"
                      >
                        <ListOrdered className="w-4 h-4" /> Результаты
                      </button>
                    )}
                    {Number(t.archived) === 0 ? (
                      <button
                        onClick={() => handleArchiveToggle(t, true)}
                        className="inline-flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 px-3 py-2 rounded-lg border border-amber-400/30 w-full sm:w-auto"
                        title="Переместить в архив"
                      >
                        <Archive className="w-4 h-4" /> Архивировать
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchiveToggle(t, false)}
                        className="inline-flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-100 px-3 py-2 rounded-lg border border-green-400/30 w-full sm:w-auto"
                        title="Вернуть из архива"
                      >
                        <ArchiveRestore className="w-4 h-4" /> Разархивировать
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(t)}
                      className="inline-flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 px-3 py-2 rounded-lg border border-red-400/30 w-full sm:w-auto"
                      title="Удалить турнир"
                    >
                      <Trash2 className="w-4 h-4" /> Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ChessBackground>
  )
}
