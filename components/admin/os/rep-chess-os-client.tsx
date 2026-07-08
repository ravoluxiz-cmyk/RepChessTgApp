"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  BarChart3,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ClipboardCopy,
  DollarSign,
  Flag,
  LayoutDashboard,
  ListChecks,
  Lock,
  LogOut,
  MessageSquareText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import ChessBackground from "@/components/ChessBackground"
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp"

type AccessState = "checking" | "locked" | "ready" | "forbidden" | "not_configured"

type OsRow = Record<string, unknown> & { id?: string | number }

type ResourceName =
  | "tasks"
  | "leads"
  | "directions"
  | "plans"
  | "events"
  | "event_checklist_items"
  | "finance_entries"
  | "weekly_reviews"
  | "message_templates"

type SectionKey =
  | "dashboard"
  | "tasks"
  | "leads"
  | "directions"
  | "plans"
  | "events"
  | "finance_entries"
  | "weekly_reviews"
  | "message_templates"
  | "settings"

export type RepChessOsSectionKey = SectionKey

type FieldType = "text" | "textarea" | "select" | "number" | "date" | "checkbox"

interface FieldConfig {
  name: string
  label: string
  type: FieldType
  options?: readonly string[]
  wide?: boolean
}

interface ColumnConfig {
  key: string
  label: string
  kind?: "currency" | "date" | "number" | "percent" | "tags" | "status"
}

interface FilterConfig {
  key: string
  label: string
  options: readonly string[]
}

interface QuickViewConfig {
  label: string
  filters: Record<string, string>
}

interface ResourceConfig {
  resource: ResourceName
  title: string
  subtitle: string
  createLabel: string
  emptyLabel: string
  fields: FieldConfig[]
  columns: ColumnConfig[]
  filters?: FilterConfig[]
  statusField?: string
  statusOptions?: readonly string[]
  quickViews?: QuickViewConfig[]
  layout?: "table" | "cards"
  copyField?: string
}

interface DashboardData {
  metrics: Record<string, unknown>
  nextActions: {
    tasks: OsRow[]
    followUps: OsRow[]
    events: OsRow[]
    highPriorityTasks: OsRow[]
    tasksTodayOrTomorrow: OsRow[]
  }
  strategicProgress: OsRow[]
  latestWeeklyReview: OsRow | null
}

const TASK_STATUSES = ["Inbox", "Сегодня", "Эта неделя", "В работе", "Ожидание ответа", "Готово", "Отложено"] as const
const TASK_AREAS = [
  "Regular Events",
  "Corporate",
  "Education",
  "Big Events / ТЦ",
  "Developers / ЖК",
  "Rating",
  "Grants",
  "Media / Telegram",
  "Operations",
  "Personal System",
] as const
const TASK_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const
const PLAN_HORIZONS = ["Краткосрочный", "Среднесрочный", "Долгосрочный"] as const
const PLAN_STATUSES = ["Не начато", "В работе", "Есть прогресс", "Выполнено", "Пауза", "Отменено"] as const
const PLAN_DIRECTIONS = ["Regular Events", "Corporate", "Education", "Big Events / ТЦ", "Developers / ЖК", "Rating", "Grants", "Media / Telegram", "Operations", "Finance", "Strategic"] as const
const LEAD_SEGMENTS = ["Corporate", "Education", "ТЦ", "Developers / ЖК", "Event Agencies", "Festivals", "Venues", "Media", "Grants", "Other"] as const
const LEAD_STATUSES = ["Новый лид", "Контакт найден", "Первое сообщение отправлено", "Ответили", "Созвон / встреча", "КП отправлено", "Переговоры", "Сделка выиграна", "Сделка проиграна", "Пауза"] as const
const EVENT_TYPES = ["Regular", "Special", "Corporate", "Education", "Rating", "Big Event", "Festival"] as const
const EVENT_STATUSES = ["Запланирован", "В подготовке", "Проведён", "Перенесён", "Отменён"] as const
const CHECKLIST_STAGES = ["За 7+ дней", "За 3-5 дней", "За 1 день", "В день турнира", "После турнира"] as const
const CHECKLIST_STATUSES = ["Не начато", "В работе", "Готово", "Не требуется", "Проблема"] as const
const FINANCE_TYPES = ["Income", "Expense"] as const
const FINANCE_DIRECTIONS = ["Regular Events", "Corporate", "Education", "Big Events / ТЦ", "Developers / ЖК", "Rating", "Grants", "Other"] as const
const MESSAGE_CATEGORIES = ["Новая площадка", "Follow-up", "Действующая площадка", "Специвент", "ТЦ", "Фестиваль", "Corporate", "Education", "Media", "Отказ от бесплатного формата", "Post-event", "Команда", "Анонсы", "Коллаборации"] as const
const MESSAGE_EFFECTIVENESS = ["unknown", "good", "bad"] as const

const EMPTY_ROWS: Record<ResourceName, OsRow[]> = {
  tasks: [],
  leads: [],
  directions: [],
  plans: [],
  events: [],
  event_checklist_items: [],
  finance_entries: [],
  weekly_reviews: [],
  message_templates: [],
}

const SECTIONS: Array<{ key: SectionKey; label: string; icon: LucideIcon; resource?: ResourceName; path: string }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/os/dashboard" },
  { key: "tasks", label: "Tasks", icon: ListChecks, resource: "tasks", path: "/admin/os/tasks" },
  { key: "leads", label: "Leads", icon: BriefcaseBusiness, resource: "leads", path: "/admin/os/leads" },
  { key: "directions", label: "Directions", icon: Target, resource: "directions", path: "/admin/os/directions" },
  { key: "plans", label: "Plans", icon: Flag, resource: "plans", path: "/admin/os/plans" },
  { key: "events", label: "Events", icon: CalendarDays, resource: "events", path: "/admin/os/events" },
  { key: "finance_entries", label: "Finance", icon: DollarSign, resource: "finance_entries", path: "/admin/os/finance" },
  { key: "weekly_reviews", label: "Weekly Review", icon: BarChart3, resource: "weekly_reviews", path: "/admin/os/weekly-review" },
  { key: "message_templates", label: "Message Library", icon: MessageSquareText, resource: "message_templates", path: "/admin/os/messages" },
  { key: "settings", label: "Settings", icon: Settings, path: "/admin/os/settings" },
]

const RESOURCE_CONFIGS: Record<ResourceName, ResourceConfig> = {
  tasks: {
    resource: "tasks",
    title: "Tasks",
    subtitle: "Операционные задачи по направлениям",
    createLabel: "Новая задача",
    emptyLabel: "Задач пока нет",
    statusField: "status",
    statusOptions: TASK_STATUSES,
    quickViews: [
      { label: "Все", filters: {} },
      { label: "Сегодня", filters: { due: "today" } },
      { label: "Просрочено", filters: { due: "overdue" } },
      { label: "Ожидание ответа", filters: { status: "Ожидание ответа" } },
    ],
    filters: [
      { key: "status", label: "Статус", options: TASK_STATUSES },
      { key: "area", label: "Направление", options: TASK_AREAS },
      { key: "priority", label: "Приоритет", options: TASK_PRIORITIES },
      { key: "due", label: "Дедлайн", options: ["today", "overdue"] },
    ],
    columns: [
      { key: "title", label: "Задача" },
      { key: "status", label: "Статус", kind: "status" },
      { key: "area", label: "Направление" },
      { key: "priority", label: "Приоритет" },
      { key: "due_date", label: "Дедлайн", kind: "date" },
      { key: "owner", label: "Owner" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", wide: true },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "area", label: "Area", type: "select", options: TASK_AREAS },
      { name: "priority", label: "Priority", type: "select", options: TASK_PRIORITIES },
      { name: "status", label: "Status", type: "select", options: TASK_STATUSES },
      { name: "due_date", label: "Due date", type: "date" },
      { name: "owner", label: "Owner", type: "text" },
      { name: "related_type", label: "Related type", type: "text" },
      { name: "related_id", label: "Related id", type: "text" },
    ],
  },
  leads: {
    resource: "leads",
    title: "Leads",
    subtitle: "Продажи, партнёры и follow-up",
    createLabel: "Новый лид",
    emptyLabel: "Лидов пока нет",
    statusField: "status",
    statusOptions: LEAD_STATUSES,
    quickViews: [
      { label: "Все лиды", filters: {} },
      { label: "Сегодня follow-up", filters: { due: "today" } },
      { label: "Просрочено", filters: { due: "overdue" } },
      { label: "Corporate", filters: { segment: "Corporate" } },
      { label: "Education", filters: { segment: "Education" } },
      { label: "ТЦ", filters: { segment: "ТЦ" } },
      { label: "Developers / ЖК", filters: { segment: "Developers / ЖК" } },
    ],
    filters: [
      { key: "status", label: "Статус", options: LEAD_STATUSES },
      { key: "segment", label: "Сегмент", options: LEAD_SEGMENTS },
      { key: "due", label: "Follow-up", options: ["today", "overdue"] },
    ],
    columns: [
      { key: "name", label: "Лид" },
      { key: "status", label: "Статус", kind: "status" },
      { key: "segment", label: "Сегмент" },
      { key: "potential_value", label: "Потенциал", kind: "currency" },
      { key: "probability", label: "Вероятность", kind: "percent" },
      { key: "next_action_date", label: "Follow-up", kind: "date" },
      { key: "next_action", label: "Действие" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", wide: true },
      { name: "segment", label: "Segment", type: "select", options: LEAD_SEGMENTS },
      { name: "status", label: "Status", type: "select", options: LEAD_STATUSES },
      { name: "contact_name", label: "Contact name", type: "text" },
      { name: "contact_role", label: "Contact role", type: "text" },
      { name: "telegram", label: "Telegram", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "website", label: "Website", type: "text" },
      { name: "source", label: "Source", type: "text" },
      { name: "potential_value", label: "Potential value", type: "number" },
      { name: "probability", label: "Probability, %", type: "number" },
      { name: "next_action", label: "Next action", type: "text", wide: true },
      { name: "next_action_date", label: "Next action date", type: "date" },
      { name: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  directions: {
    resource: "directions",
    title: "Directions",
    subtitle: "Стратегические направления роста",
    createLabel: "Новое направление",
    emptyLabel: "Направлений пока нет",
    layout: "cards",
    columns: [
      { key: "name", label: "Направление" },
      { key: "target_revenue", label: "Цель", kind: "currency" },
      { key: "current_status", label: "Статус" },
      { key: "next_step", label: "Следующий шаг" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", wide: true },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "goal", label: "Goal", type: "textarea", wide: true },
      { name: "target_revenue", label: "Target revenue", type: "number" },
      { name: "current_status", label: "Current status", type: "textarea", wide: true },
      { name: "main_metric", label: "Main metric", type: "text" },
      { name: "risks", label: "Risks", type: "textarea", wide: true },
      { name: "next_step", label: "Next step", type: "textarea", wide: true },
    ],
  },
  plans: {
    resource: "plans",
    title: "Plans",
    subtitle: "Краткосрочная, среднесрочная и долгосрочная стратегия",
    createLabel: "Новый план",
    emptyLabel: "Планов пока нет",
    statusField: "status",
    statusOptions: PLAN_STATUSES,
    quickViews: [
      { label: "Все", filters: {} },
      { label: "Краткосрочные", filters: { horizon: "Краткосрочный" } },
      { label: "Среднесрочные", filters: { horizon: "Среднесрочный" } },
      { label: "Долгосрочные", filters: { horizon: "Долгосрочный" } },
      { label: "В работе", filters: { status: "В работе" } },
      { label: "Есть прогресс", filters: { status: "Есть прогресс" } },
    ],
    filters: [
      { key: "horizon", label: "Горизонт", options: PLAN_HORIZONS },
      { key: "direction", label: "Направление", options: PLAN_DIRECTIONS },
      { key: "status", label: "Статус", options: PLAN_STATUSES },
      { key: "priority", label: "Приоритет", options: TASK_PRIORITIES },
    ],
    columns: [
      { key: "title", label: "План" },
      { key: "horizon", label: "Горизонт", kind: "status" },
      { key: "direction", label: "Направление" },
      { key: "status", label: "Статус", kind: "status" },
      { key: "priority", label: "Приоритет" },
      { key: "target_date", label: "Цель к", kind: "date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", wide: true },
      { name: "horizon", label: "Horizon", type: "select", options: PLAN_HORIZONS },
      { name: "direction", label: "Direction", type: "select", options: PLAN_DIRECTIONS },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "target_result", label: "Target result", type: "textarea", wide: true },
      { name: "target_date", label: "Target date", type: "date" },
      { name: "status", label: "Status", type: "select", options: PLAN_STATUSES },
      { name: "priority", label: "Priority", type: "select", options: TASK_PRIORITIES },
    ],
  },
  events: {
    resource: "events",
    title: "Events",
    subtitle: "Ивенты и подготовка",
    createLabel: "Новый ивент",
    emptyLabel: "Ивентов пока нет",
    statusField: "status",
    statusOptions: EVENT_STATUSES,
    filters: [
      { key: "status", label: "Статус", options: EVENT_STATUSES },
      { key: "event_type", label: "Тип", options: EVENT_TYPES },
    ],
    columns: [
      { key: "title", label: "Ивент" },
      { key: "event_type", label: "Тип" },
      { key: "venue", label: "Площадка" },
      { key: "date", label: "Дата", kind: "date" },
      { key: "status", label: "Статус", kind: "status" },
      { key: "fixed_fee", label: "Fee", kind: "currency" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", wide: true },
      { name: "event_type", label: "Event type", type: "select", options: EVENT_TYPES },
      { name: "venue", label: "Venue", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "time", label: "Time", type: "text" },
      { name: "format", label: "Format", type: "text" },
      { name: "control", label: "Control", type: "text" },
      { name: "rounds", label: "Rounds", type: "number" },
      { name: "host", label: "Host", type: "text" },
      { name: "fixed_fee", label: "Fixed fee", type: "number" },
      { name: "expected_participants", label: "Expected participants", type: "number" },
      { name: "actual_participants", label: "Actual participants", type: "number" },
      { name: "status", label: "Status", type: "select", options: EVENT_STATUSES },
      { name: "swiss_link", label: "Swiss link", type: "text", wide: true },
      { name: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  event_checklist_items: {
    resource: "event_checklist_items",
    title: "Event Checklist",
    subtitle: "Подготовка к ивентам",
    createLabel: "Пункт чек-листа",
    emptyLabel: "Пункты чек-листа появятся после создания ивента",
    statusField: "status",
    statusOptions: CHECKLIST_STATUSES,
    filters: [
      { key: "stage", label: "Этап", options: CHECKLIST_STAGES },
      { key: "status", label: "Статус", options: CHECKLIST_STATUSES },
    ],
    columns: [
      { key: "stage", label: "Этап" },
      { key: "title", label: "Пункт" },
      { key: "status", label: "Статус", kind: "status" },
      { key: "owner", label: "Owner" },
      { key: "due_date", label: "Дедлайн", kind: "date" },
    ],
    fields: [
      { name: "event_id", label: "Event id", type: "text", wide: true },
      { name: "stage", label: "Stage", type: "select", options: CHECKLIST_STAGES },
      { name: "title", label: "Title", type: "text", wide: true },
      { name: "status", label: "Status", type: "select", options: CHECKLIST_STATUSES },
      { name: "owner", label: "Owner", type: "text" },
      { name: "due_date", label: "Due date", type: "date" },
      { name: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  finance_entries: {
    resource: "finance_entries",
    title: "Finance",
    subtitle: "Простая управленческая картина",
    createLabel: "Запись",
    emptyLabel: "Финансовых записей пока нет",
    filters: [
      { key: "type", label: "Тип", options: FINANCE_TYPES },
      { key: "direction", label: "Направление", options: FINANCE_DIRECTIONS },
    ],
    columns: [
      { key: "date", label: "Дата", kind: "date" },
      { key: "type", label: "Тип" },
      { key: "source", label: "Источник" },
      { key: "direction", label: "Направление" },
      { key: "amount", label: "Сумма", kind: "currency" },
      { key: "cheslav_share", label: "Чеслав", kind: "currency" },
    ],
    fields: [
      { name: "date", label: "Date", type: "date" },
      { name: "type", label: "Type", type: "select", options: FINANCE_TYPES },
      { name: "source", label: "Source", type: "text" },
      { name: "direction", label: "Direction", type: "select", options: FINANCE_DIRECTIONS },
      { name: "amount", label: "Amount", type: "number" },
      { name: "cheslav_share", label: "Cheslav share", type: "number" },
      { name: "ilya_share", label: "Ilya share", type: "number" },
      { name: "expense_category", label: "Expense category", type: "text" },
      { name: "related_event_id", label: "Related event id", type: "text" },
      { name: "related_lead_id", label: "Related lead id", type: "text" },
      { name: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  weekly_reviews: {
    resource: "weekly_reviews",
    title: "Weekly Review",
    subtitle: "Еженедельный обзор результата",
    createLabel: "Новая неделя",
    emptyLabel: "Weekly review пока нет",
    columns: [
      { key: "week_start", label: "Старт", kind: "date" },
      { key: "week_end", label: "Финиш", kind: "date" },
      { key: "events_count", label: "Ивенты", kind: "number" },
      { key: "revenue", label: "Выручка", kind: "currency" },
      { key: "cheslav_income", label: "Чеслав", kind: "currency" },
      { key: "next_week_focus", label: "Фокус" },
    ],
    fields: [
      { name: "week_start", label: "Week start", type: "date" },
      { name: "week_end", label: "Week end", type: "date" },
      { name: "events_count", label: "Events count", type: "number" },
      { name: "participants_count", label: "Participants count", type: "number" },
      { name: "revenue", label: "Revenue", type: "number" },
      { name: "cheslav_income", label: "Cheslav income", type: "number" },
      { name: "new_subscribers", label: "New subscribers", type: "number" },
      { name: "new_leads", label: "New leads", type: "number" },
      { name: "proposals_sent", label: "Proposals sent", type: "number" },
      { name: "meetings_count", label: "Meetings count", type: "number" },
      { name: "deals_won", label: "Deals won", type: "number" },
      { name: "what_worked", label: "What worked", type: "textarea", wide: true },
      { name: "what_failed", label: "What failed", type: "textarea", wide: true },
      { name: "next_week_focus", label: "Next week focus", type: "textarea", wide: true },
    ],
  },
  message_templates: {
    resource: "message_templates",
    title: "Message Library",
    subtitle: "Шаблоны сообщений и follow-up",
    createLabel: "Шаблон",
    emptyLabel: "Шаблонов пока нет",
    copyField: "body",
    filters: [
      { key: "category", label: "Категория", options: MESSAGE_CATEGORIES },
      { key: "effectiveness", label: "Эффективность", options: MESSAGE_EFFECTIVENESS },
    ],
    columns: [
      { key: "title", label: "Название" },
      { key: "category", label: "Категория" },
      { key: "tags", label: "Tags", kind: "tags" },
      { key: "is_favorite", label: "Favorite" },
      { key: "effectiveness", label: "Эффективность", kind: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", wide: true },
      { name: "category", label: "Category", type: "select", options: MESSAGE_CATEGORIES },
      { name: "body", label: "Body", type: "textarea", wide: true },
      { name: "tags", label: "Tags, comma-separated", type: "text", wide: true },
      { name: "is_favorite", label: "Favorite", type: "checkbox" },
      { name: "effectiveness", label: "Effectiveness", type: "select", options: MESSAGE_EFFECTIVENESS },
    ],
  },
}

function rowId(row: OsRow) {
  return row.id === undefined || row.id === null ? "" : String(row.id)
}

function stringValue(value: unknown) {
  if (value === null || value === undefined) return ""
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "boolean") return value ? "Да" : "Нет"
  return String(value)
}

function numberValue(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function dateKey(value: unknown) {
  return typeof value === "string" ? value.slice(0, 10) : ""
}

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(numberValue(value))
}

function formatDate(value: unknown) {
  const key = dateKey(value)
  if (!key) return "—"
  return new Date(`${key}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  })
}

function formatCell(row: OsRow, column: ColumnConfig) {
  const value = row[column.key]
  if (column.kind === "currency") return formatCurrency(value)
  if (column.kind === "date") return formatDate(value)
  if (column.kind === "number") return new Intl.NumberFormat("ru-RU").format(numberValue(value))
  if (column.kind === "percent") return `${numberValue(value)}%`
  if (column.kind === "tags") return stringValue(value) || "—"
  return stringValue(value) || "—"
}

function statusClass(value: unknown) {
  const status = String(value || "")
  if (["Готово", "Сделка выиграна", "Проведён", "Выполнено", "good"].includes(status)) {
    return "border-[#20d66b]/40 bg-[#20d66b]/12 text-[#bdf8d2]"
  }
  if (["Critical", "Сделка проиграна", "Отменён", "Проблема", "Отменено", "bad"].includes(status)) {
    return "border-[#ff1515]/40 bg-[#ff1515]/12 text-[#ffc7c7]"
  }
  if (["Ожидание ответа", "КП отправлено", "В подготовке", "Переговоры", "Есть прогресс", "Среднесрочный"].includes(status)) {
    return "border-[#fff200]/35 bg-[#fff200]/12 text-[#fff9a8]"
  }
  if (["High", "Сегодня", "В работе", "Ответили", "Созвон / встреча", "Краткосрочный"].includes(status)) {
    return "border-[#1357ff]/40 bg-[#1357ff]/14 text-[#c8d7ff]"
  }
  return "border-white/12 bg-white/[0.06] text-white/75"
}

function isOverdue(row: OsRow, key: string) {
  const value = dateKey(row[key])
  return Boolean(value && value < new Date().toISOString().slice(0, 10))
}

function applyClientFilters(rows: OsRow[], filters: Record<string, string>) {
  const search = filters.search?.trim().toLowerCase() || ""
  return rows.filter((row) => {
    for (const [key, value] of Object.entries(filters)) {
      if (!value || value === "all" || key === "search") continue
      if (key === "due") {
        const dueKey = row.next_action_date !== undefined ? "next_action_date" : "due_date"
        const date = dateKey(row[dueKey])
        const today = new Date().toISOString().slice(0, 10)
        if (value === "today" && date !== today) return false
        if (value === "overdue" && (!date || date >= today)) return false
        continue
      }
      if (String(row[key] || "") !== value) return false
    }

    if (search) {
      const haystack = Object.values(row).join(" ").toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}

function expectedPipelineValue(rows: OsRow[]) {
  return rows.reduce((sum, row) => {
    const probability = numberValue(row.probability) > 1
      ? numberValue(row.probability) / 100
      : numberValue(row.probability)
    return sum + numberValue(row.potential_value) * probability
  }, 0)
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
      <div className="mb-3 h-1.5 w-10 rounded-full" style={{ backgroundColor: accent }} />
      <div className="text-xs font-black uppercase tracking-normal text-white/45">{label}</div>
      <div className="mt-2 break-words text-2xl font-black text-white">{value}</div>
    </div>
  )
}

function DashboardActionList({ title, rows, dateKeyName }: { title: string; rows: OsRow[]; dateKeyName: string }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <h3 className="mb-3 text-sm font-black uppercase text-white/60">{title}</h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={`${title}-${rowId(row)}`} className="flex items-center justify-between gap-3 rounded-lg bg-black/25 px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-white">{stringValue(row.title || row.name)}</div>
              <div className="truncate text-xs text-white/48">{stringValue(row.next_action || row.venue || row.area || row.segment)}</div>
            </div>
            <span className={`shrink-0 rounded-full border px-2 py-1 text-xs ${isOverdue(row, dateKeyName) ? "border-[#ff1515]/50 bg-[#ff1515]/15 text-[#ffc7c7]" : "border-white/10 bg-white/5 text-white/62"}`}>
              {formatDate(row[dateKeyName])}
            </span>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-white/45">Пока пусто</div>}
      </div>
    </section>
  )
}

function StrategicProgress({ rows }: { rows: OsRow[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase text-white/60">Стратегический прогресс</h3>
        <span className="rounded-full border border-white/10 bg-black/25 px-2 py-1 text-xs text-white/45">
          {rows.length} направлений
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {rows.map((row) => (
          <article key={stringValue(row.name)} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate text-base font-black text-white">{stringValue(row.name)}</h4>
                <p className="mt-1 text-sm text-white/52">{stringValue(row.goal) || stringValue(row.current_status)}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-white/60">
                {formatCurrency(row.potential_revenue)}
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-white/[0.04] px-3 py-2">
                <div className="text-xs text-white/38">Tasks</div>
                <div className="font-black text-white">{stringValue(row.active_tasks || 0)}</div>
              </div>
              <div className="rounded-lg bg-white/[0.04] px-3 py-2">
                <div className="text-xs text-white/38">Leads</div>
                <div className="font-black text-white">{stringValue(row.active_leads || 0)}</div>
              </div>
              <div className="rounded-lg bg-white/[0.04] px-3 py-2">
                <div className="text-xs text-white/38">Plans</div>
                <div className="font-black text-white">{stringValue(row.active_plans || 0)}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-white/62">{stringValue(row.next_step) || "Следующий шаг не задан"}</div>
          </article>
        ))}
      </div>
    </section>
  )
}

function DashboardView({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  if (loading && !data) {
    return <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5 text-white/60">Загрузка...</div>
  }

  const metrics = data?.metrics || {}
  const metricCards = [
    { label: "Выручка месяца", value: formatCurrency(metrics.monthRevenue), accent: "#20d66b" },
    { label: "Плановая выручка", value: formatCurrency(metrics.monthRevenuePlan), accent: "#fff200" },
    { label: "Pipeline expected", value: formatCurrency(metrics.expectedPipelineValue), accent: "#20d66b" },
    { label: "Доля Чеслава", value: formatCurrency(metrics.cheslavShare), accent: "#1357ff" },
    { label: "Ивенты месяца", value: stringValue(metrics.eventsThisMonth || 0), accent: "#ff1515" },
    { label: "Активные лиды", value: stringValue(metrics.activeLeads || 0), accent: "#20d66b" },
    { label: "КП отправлено", value: stringValue(metrics.proposalsSent || 0), accent: "#fff200" },
    { label: "Созвоны / встречи", value: stringValue(metrics.meetings || 0), accent: "#1357ff" },
    { label: "Задачи сегодня", value: stringValue(metrics.tasksToday || 0), accent: "#1357ff" },
    { label: "Просроченные задачи", value: stringValue(metrics.overdueTasks || 0), accent: "#ff1515" },
    { label: "Follow-up просрочен", value: stringValue(metrics.overdueFollowUps || 0), accent: "#ff1515" },
    { label: "Фокус недели", value: stringValue(metrics.weekFocus), accent: "#fff200" },
  ]

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase text-white/45">Фокус недели</div>
            <h2 className="mt-1 text-2xl font-black text-white">{stringValue(metrics.weekFocus)}</h2>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/60">
            Rep Chess KRD
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <DashboardActionList title="Ближайшие задачи" rows={data?.nextActions.tasks || []} dateKeyName="due_date" />
        <DashboardActionList title="Follow-up по лидам" rows={data?.nextActions.followUps || []} dateKeyName="next_action_date" />
        <DashboardActionList title="Ближайшие ивенты" rows={data?.nextActions.events || []} dateKeyName="date" />
        <DashboardActionList title="Высокий приоритет" rows={data?.nextActions.highPriorityTasks || []} dateKeyName="due_date" />
        <DashboardActionList title="Сегодня / завтра" rows={data?.nextActions.tasksTodayOrTomorrow || []} dateKeyName="due_date" />
      </section>

      <StrategicProgress rows={data?.strategicProgress || []} />
    </div>
  )
}

function defaultFormValue(field: FieldConfig, row?: OsRow | null) {
  const value = row?.[field.name]
  if (field.type === "checkbox") return Boolean(value)
  if (Array.isArray(value)) return value.join(", ")
  if (field.type === "date") return dateKey(value)
  if (value !== undefined && value !== null) return String(value)
  if (field.type === "select") return field.options?.[0] || ""
  return ""
}

function ResourceEditor({
  config,
  row,
  onCancel,
  onSubmit,
}: {
  config: ResourceConfig
  row: OsRow | null
  onCancel: () => void
  onSubmit: (payload: Record<string, string | boolean>) => Promise<void>
}) {
  const [form, setForm] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {}
    for (const field of config.fields) {
      initial[field.name] = defaultFormValue(field, row)
    }
    return initial
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-[#151515] p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-white">{row ? "Редактирование" : config.createLabel}</h3>
        <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/10">
          Закрыть
        </button>
      </div>

      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        {config.fields.map((field) => {
          const value = form[field.name]
          const commonClass = "w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#20d66b]"
          return (
            <label key={field.name} className={field.wide || field.type === "textarea" ? "sm:col-span-2" : ""}>
              <span className="mb-1.5 block text-xs font-bold uppercase text-white/45">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  value={String(value || "")}
                  onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                  className={`${commonClass} min-h-24 resize-y`}
                />
              ) : field.type === "select" ? (
                <select
                  value={String(value || "")}
                  onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                  className={commonClass}
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.checked }))}
                  className="h-5 w-5 rounded border-white/20 bg-black/30 accent-[#20d66b]"
                />
              ) : (
                <input
                  type={field.type}
                  value={String(value || "")}
                  onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                  className={commonClass}
                />
              )}
            </label>
          )
        })}

        {error && <div className="sm:col-span-2 rounded-lg border border-[#ff1515]/30 bg-[#ff1515]/12 p-3 text-sm text-[#ffc7c7]">{error}</div>}

        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-black text-[#151515] transition-colors hover:bg-white/90 disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {saving ? "Сохраняю..." : "Сохранить"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/10"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

function SummaryStrip({ config, rows }: { config: ResourceConfig; rows: OsRow[] }) {
  if (config.resource === "leads") {
    const active = rows.filter((row) => !["Сделка выиграна", "Сделка проиграна", "Пауза"].includes(String(row.status || ""))).length
    const proposals = rows.filter((row) => row.status === "КП отправлено").length
    return (
      <div className="grid gap-2 sm:grid-cols-3">
        <MetricCard label="Active leads" value={String(active)} accent="#20d66b" />
        <MetricCard label="КП отправлено" value={String(proposals)} accent="#fff200" />
        <MetricCard label="Expected pipeline" value={formatCurrency(expectedPipelineValue(rows))} accent="#1357ff" />
      </div>
    )
  }

  if (config.resource === "finance_entries") {
    const income = rows.filter((row) => row.type === "Income").reduce((sum, row) => sum + numberValue(row.amount), 0)
    const expense = rows.filter((row) => row.type === "Expense").reduce((sum, row) => sum + numberValue(row.amount), 0)
    const cheslav = rows.filter((row) => row.type === "Income").reduce((sum, row) => sum + numberValue(row.cheslav_share), 0)
    const ilya = rows.filter((row) => row.type === "Income").reduce((sum, row) => sum + numberValue(row.ilya_share), 0)
    return (
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Income" value={formatCurrency(income)} accent="#20d66b" />
        <MetricCard label="Expense" value={formatCurrency(expense)} accent="#ff1515" />
        <MetricCard label="Net" value={formatCurrency(income - expense)} accent="#1357ff" />
        <MetricCard label="Чеслав" value={formatCurrency(cheslav)} accent="#fff200" />
        <MetricCard label="Илья" value={formatCurrency(ilya)} accent="#20d66b" />
      </div>
    )
  }

  if (config.resource === "tasks") {
    const today = new Date().toISOString().slice(0, 10)
    const overdue = rows.filter((row) => row.status !== "Готово" && dateKey(row.due_date) && dateKey(row.due_date) < today).length
    const waiting = rows.filter((row) => row.status === "Ожидание ответа").length
    return (
      <div className="grid gap-2 sm:grid-cols-3">
        <MetricCard label="Всего задач" value={String(rows.length)} accent="#1357ff" />
        <MetricCard label="Просрочено" value={String(overdue)} accent="#ff1515" />
        <MetricCard label="Ожидание ответа" value={String(waiting)} accent="#fff200" />
      </div>
    )
  }

  if (config.resource === "plans") {
    const active = rows.filter((row) => !["Выполнено", "Отменено"].includes(String(row.status || ""))).length
    const done = rows.filter((row) => row.status === "Выполнено").length
    const shortTerm = rows.filter((row) => row.horizon === "Краткосрочный").length
    return (
      <div className="grid gap-2 sm:grid-cols-3">
        <MetricCard label="Активные планы" value={String(active)} accent="#1357ff" />
        <MetricCard label="Краткосрочные" value={String(shortTerm)} accent="#fff200" />
        <MetricCard label="Выполнено" value={String(done)} accent="#20d66b" />
      </div>
    )
  }

  return null
}

function DirectionCards({
  rows,
  relatedCounts,
  onEdit,
}: {
  rows: OsRow[]
  relatedCounts: Record<string, { tasks: number; leads: number }>
  onEdit: (row: OsRow) => void
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {rows.map((row) => {
        const name = stringValue(row.name)
        const counts = relatedCounts[name] || { tasks: 0, leads: 0 }
        return (
          <article key={rowId(row)} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-white">{name}</h3>
                <div className="mt-1 text-sm text-white/50">{stringValue(row.main_metric) || "metric not set"}</div>
              </div>
              <button onClick={() => onEdit(row)} className="rounded-lg border border-white/10 p-2 text-white/70 hover:bg-white/10" title="Редактировать">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-black/25 p-3">
                <div className="text-xs uppercase text-white/40">Target revenue</div>
                <div className="mt-1 font-black text-white">{formatCurrency(row.target_revenue)}</div>
              </div>
              <div className="rounded-lg bg-black/25 p-3">
                <div className="text-xs uppercase text-white/40">Related</div>
                <div className="mt-1 font-black text-white">{counts.tasks} tasks / {counts.leads} leads</div>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-white/70">{stringValue(row.goal) || stringValue(row.description) || "Цель не задана"}</p>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="text-xs uppercase text-white/40">Next step</div>
                <div className="mt-1 text-white">{stringValue(row.next_step) || "—"}</div>
              </div>
              {row.risks ? <div className="text-white/48">Risk: {stringValue(row.risks)}</div> : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function ResourceView({
  config,
  rows,
  loading,
  relatedCounts = {},
  onSave,
  onDelete,
  onQuickUpdate,
  onCreateTaskFromPlan,
  onRefresh,
}: {
  config: ResourceConfig
  rows: OsRow[]
  loading: boolean
  relatedCounts?: Record<string, { tasks: number; leads: number }>
  onSave: (resource: ResourceName, payload: Record<string, string | boolean>, id?: string) => Promise<void>
  onDelete: (resource: ResourceName, id: string) => Promise<void>
  onQuickUpdate: (resource: ResourceName, id: string, payload: Record<string, string | boolean>) => Promise<void>
  onCreateTaskFromPlan?: (plan: OsRow) => Promise<void>
  onRefresh: (resource: ResourceName) => Promise<void>
}) {
  const [filters, setFilters] = useState<Record<string, string>>({ search: "" })
  const [editingRow, setEditingRow] = useState<OsRow | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredRows = useMemo(() => applyClientFilters(rows, filters), [rows, filters])

  const openCreate = () => {
    setEditingRow(null)
    setEditorOpen(true)
  }

  const submit = async (payload: Record<string, string | boolean>) => {
    await onSave(config.resource, payload, editingRow ? rowId(editingRow) : undefined)
    setEditorOpen(false)
    setEditingRow(null)
  }

  const copyText = async (row: OsRow) => {
    if (!config.copyField) return
    await navigator.clipboard.writeText(stringValue(row[config.copyField]))
    setCopiedId(rowId(row))
    window.setTimeout(() => setCopiedId(null), 1200)
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">{config.title}</h2>
          <p className="mt-1 text-sm text-white/50">{config.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onRefresh(config.resource)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-white/70 hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Обновить
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-black text-[#151515] hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            {config.createLabel}
          </button>
        </div>
      </div>

      <SummaryStrip config={config} rows={rows} />

      {config.quickViews?.length ? (
        <div className="flex flex-wrap gap-2">
          {config.quickViews.map((view) => {
            const active = Object.entries(view.filters).every(([key, value]) => filters[key] === value)
              && Object.keys(filters).filter((key) => key !== "search" && filters[key] && filters[key] !== "all").length === Object.keys(view.filters).length
            return (
              <button
                key={view.label}
                onClick={() => setFilters((prev) => ({ search: prev.search || "", ...view.filters }))}
                className={`rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${active ? "border-white bg-white text-[#151515]" : "border-white/10 bg-white/[0.04] text-white/68 hover:bg-white/10 hover:text-white"}`}
              >
                {view.label}
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-3 xl:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={filters.search || ""}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-[#20d66b]"
            placeholder="Поиск"
          />
        </label>
        {config.filters?.map((filter) => (
          <label key={filter.key} className="min-w-44">
            <select
              value={filters[filter.key] || "all"}
              onChange={(event) => setFilters((prev) => ({ ...prev, [filter.key]: event.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#20d66b]"
              title={filter.label}
            >
              <option value="all">{filter.label}: all</option>
              {filter.options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {editorOpen && (
        <ResourceEditor
          key={`${config.resource}-${editingRow ? rowId(editingRow) : "new"}`}
          config={config}
          row={editingRow}
          onCancel={() => {
            setEditorOpen(false)
            setEditingRow(null)
          }}
          onSubmit={submit}
        />
      )}

      {config.layout === "cards" ? (
        <DirectionCards
          rows={filteredRows}
          relatedCounts={relatedCounts}
          onEdit={(row) => {
            setEditingRow(row)
            setEditorOpen(true)
          }}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/[0.04]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/30 text-xs uppercase text-white/45">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key} className="px-3 py-3 font-black">{column.label}</th>
                ))}
                <th className="px-3 py-3 font-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={rowId(row)} className="border-t border-white/10 align-top">
                  {config.columns.map((column) => (
                    <td key={column.key} className="max-w-72 px-3 py-3 text-white/76">
                      {column.kind === "status" ? (
                        <span className={`inline-flex max-w-full rounded-full border px-2 py-1 text-xs font-bold ${statusClass(row[column.key])}`}>
                          <span className="truncate">{formatCell(row, column)}</span>
                        </span>
                      ) : (
                        <span className={column.key === "title" || column.key === "name" ? "font-bold text-white" : ""}>
                          {formatCell(row, column)}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <div className="flex min-w-44 flex-wrap items-center gap-2">
                      {config.statusField && config.statusOptions ? (
                        <select
                          value={String(row[config.statusField] || "")}
                          onChange={(event) => void onQuickUpdate(config.resource, rowId(row), { [config.statusField as string]: event.target.value })}
                          className="max-w-40 rounded-lg border border-white/10 bg-black/35 px-2 py-1 text-xs text-white outline-none"
                          title="Статус"
                        >
                          {config.statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : null}
                      {config.resource === "tasks" && row.status !== "Готово" ? (
                        <button
                          onClick={() => void onQuickUpdate(config.resource, rowId(row), { status: "Готово" })}
                          className="rounded-lg border border-[#20d66b]/30 p-2 text-[#bdf8d2] hover:bg-[#20d66b]/10"
                          title="Готово"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : null}
                      {config.resource === "plans" ? (
                        <button
                          onClick={() => void onCreateTaskFromPlan?.(row)}
                          className="rounded-lg border border-[#20d66b]/30 p-2 text-[#bdf8d2] hover:bg-[#20d66b]/10"
                          title="Создать задачу из плана"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      ) : null}
                      {config.copyField ? (
                        <button
                          onClick={() => void copyText(row)}
                          className="rounded-lg border border-white/10 p-2 text-white/70 hover:bg-white/10"
                          title="Скопировать"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        onClick={() => {
                          setEditingRow(row)
                          setEditorOpen(true)
                        }}
                        className="rounded-lg border border-white/10 p-2 text-white/70 hover:bg-white/10"
                        title="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => void onDelete(config.resource, rowId(row))}
                        className="rounded-lg border border-[#ff1515]/30 p-2 text-[#ffc7c7] hover:bg-[#ff1515]/10"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {copiedId === rowId(row) ? <span className="text-xs text-[#20d66b]">Copied</span> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-4 text-sm text-white/50">Загрузка...</div>}
          {!loading && filteredRows.length === 0 && <div className="p-4 text-sm text-white/45">{config.emptyLabel}</div>}
        </div>
      )}
    </section>
  )
}

function buildRelatedCounts(tasks: OsRow[], leads: OsRow[]) {
  const counts: Record<string, { tasks: number; leads: number }> = {}
  const aliases: Record<string, string[]> = {
    "Rating Tournaments": ["Rating"],
    "Media / Telegram Growth": ["Media / Telegram"],
  }

  for (const area of [...TASK_AREAS, "Rating Tournaments", "Media / Telegram Growth"]) {
    counts[area] = { tasks: 0, leads: 0 }
  }

  for (const task of tasks) {
    const area = stringValue(task.area)
    const target = Object.entries(aliases).find(([, list]) => list.includes(area))?.[0] || area
    if (!counts[target]) counts[target] = { tasks: 0, leads: 0 }
    counts[target].tasks += 1
  }

  for (const lead of leads) {
    const segment = stringValue(lead.segment)
    const target = segment === "ТЦ" ? "Big Events / ТЦ" : segment
    if (!counts[target]) counts[target] = { tasks: 0, leads: 0 }
    counts[target].leads += 1
  }

  return counts
}

function taskAreaFromPlanDirection(direction: unknown) {
  const value = stringValue(direction)
  return (TASK_AREAS as readonly string[]).includes(value) ? value : "Operations"
}

function LockScreen({
  accessState,
  password,
  error,
  loading,
  onPasswordChange,
  onSubmit,
  onBack,
}: {
  accessState: AccessState
  password: string
  error: string | null
  loading: boolean
  onPasswordChange: (password: string) => void
  onSubmit: (event: React.FormEvent) => Promise<void>
  onBack: () => void
}) {
  return (
    <ChessBackground>
      <main className="min-h-screen px-4 py-6 text-white">
        <div className="mx-auto max-w-md">
          <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            Админ-меню
          </button>

          <form onSubmit={(event) => void onSubmit(event)} className="rounded-lg border border-white/10 bg-white/[0.06] p-5 backdrop-blur-lg">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-[#20d66b]/15 p-3">
                <Lock className="h-6 w-6 text-[#bdf8d2]" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Rep Chess OS</h1>
                <p className="text-sm text-white/50">Дополнительный доступ</p>
              </div>
            </div>

            {accessState === "forbidden" ? (
              <div className="rounded-lg border border-[#ff1515]/30 bg-[#ff1515]/12 p-3 text-sm text-[#ffc7c7]">
                Сначала нужен вход в админку.
              </div>
            ) : accessState === "not_configured" ? (
              <div className="rounded-lg border border-[#fff200]/30 bg-[#fff200]/12 p-3 text-sm text-[#fff9a8]">
                REPCHESS_OS_PASSWORD не настроен в окружении.
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white/62">OS password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => onPasswordChange(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-3 text-white outline-none focus:border-[#20d66b]"
                    autoComplete="current-password"
                    required
                  />
                </label>

                {error && <div className="mt-4 rounded-lg border border-[#ff1515]/30 bg-[#ff1515]/12 p-3 text-sm text-[#ffc7c7]">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-black text-[#151515] hover:bg-white/90 disabled:opacity-60"
                >
                  <ShieldCheck className="h-5 w-5" />
                  {loading ? "Проверяю..." : "Открыть OS"}
                </button>
              </>
            )}
          </form>
        </div>
      </main>
    </ChessBackground>
  )
}

function SettingsView({ onLogout }: { onLogout: () => Promise<void> }) {
  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-white p-2 text-[#151515]">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Settings</h2>
            <p className="text-sm text-white/50">Доступ и служебные параметры Rep Chess OS</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="text-xs font-black uppercase text-white/42">Admin access</div>
            <div className="mt-2 text-lg font-black text-white">Обычная админка + OS password</div>
            <p className="mt-2 text-sm text-white/55">
              Раздел и API `/api/admin/os/*` открываются только после проверки админа и отдельной signed cookie.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="text-xs font-black uppercase text-white/42">Environment</div>
            <div className="mt-2 text-lg font-black text-white">REPCHESS_OS_PASSWORD</div>
            <p className="mt-2 text-sm text-white/55">
              В production нужно задать этот env. Без него OS покажет экран настройки и не откроет данные.
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={() => void onLogout()}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#151515] hover:bg-white/90"
      >
        <LogOut className="h-4 w-4" />
        Выйти из Rep Chess OS
      </button>
    </section>
  )
}

export default function RepChessOsClient({ initialSection = "dashboard" }: { initialSection?: SectionKey }) {
  const router = useRouter()
  const { initData, isReady } = useTelegramWebApp()
  const [accessState, setAccessState] = useState<AccessState>("checking")
  const [activeSection, setActiveSection] = useState<SectionKey>(initialSection)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [rows, setRows] = useState<Record<ResourceName, OsRow[]>>(EMPTY_ROWS)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  const navigateToSection = useCallback((section: { key: SectionKey; path: string }) => {
    setActiveSection(section.key)
    setPageError(null)

    if (typeof window !== "undefined" && window.location.pathname !== section.path) {
      window.history.pushState({ repChessOsSection: section.key }, "", section.path)
    }
  }, [])

  useEffect(() => {
    function handlePopState() {
      const section = SECTIONS.find((item) => item.path === window.location.pathname)
      if (section) {
        setActiveSection(section.key)
        setPageError(null)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const buildHeaders = useCallback((extra: Record<string, string> = {}) => {
    return initData ? { Authorization: `Bearer ${initData}`, ...extra } : extra
  }, [initData])

  const loadDashboard = useCallback(async () => {
    setLoadingKey("dashboard")
    setPageError(null)
    try {
      const response = await fetch("/api/admin/os/dashboard", {
        headers: buildHeaders(),
        cache: "no-store",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось загрузить Dashboard")
      setDashboard(data as DashboardData)
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Не удалось загрузить Dashboard")
    } finally {
      setLoadingKey(null)
    }
  }, [buildHeaders])

  const loadResource = useCallback(async (resource: ResourceName) => {
    setLoadingKey(resource)
    setPageError(null)
    try {
      const response = await fetch(`/api/admin/os/${resource}`, {
        headers: buildHeaders(),
        cache: "no-store",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Не удалось загрузить данные")
      setRows((prev) => ({ ...prev, [resource]: Array.isArray(data.rows) ? data.rows as OsRow[] : [] }))
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Не удалось загрузить данные")
    } finally {
      setLoadingKey(null)
    }
  }, [buildHeaders])

  const loadActive = useCallback(async () => {
    if (activeSection === "dashboard" || activeSection === "settings") {
      if (activeSection === "settings") return
      await loadDashboard()
      return
    }

    const section = SECTIONS.find((item) => item.key === activeSection)
    if (!section?.resource) return

    if (section.resource === "directions") {
      await Promise.all([loadResource("directions"), loadResource("tasks"), loadResource("leads")])
      return
    }

    if (section.resource === "events") {
      await Promise.all([loadResource("events"), loadResource("event_checklist_items")])
      return
    }

    await loadResource(section.resource)
  }, [activeSection, loadDashboard, loadResource])

  useEffect(() => {
    if (!isReady) return

    async function checkAccess() {
      try {
        const response = await fetch("/api/admin/os/check", {
          headers: buildHeaders(),
          cache: "no-store",
        })
        if (response.ok) {
          setAccessState("ready")
          return
        }
        if (response.status === 503) {
          setAccessState("not_configured")
          return
        }
        if (response.status === 403) {
          setAccessState("forbidden")
          return
        }
        setAccessState("locked")
      } catch {
        setAccessState("locked")
      }
    }

    void checkAccess()
  }, [buildHeaders, isReady])

  useEffect(() => {
    if (accessState !== "ready") return
    void loadActive()
  }, [accessState, loadActive])

  const login = async (event: React.FormEvent) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await fetch("/api/admin/os/login", {
        method: "POST",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ password }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.status === 503) {
        setAccessState("not_configured")
        throw new Error("REPCHESS_OS_PASSWORD не настроен")
      }
      if (response.status === 403) {
        setAccessState("forbidden")
        throw new Error("Сначала нужен вход в админку")
      }
      if (!response.ok) throw new Error(data.error || "Неверный пароль")
      setPassword("")
      setAccessState("ready")
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Не удалось открыть OS")
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = async () => {
    await fetch("/api/admin/os/logout", { method: "POST" }).catch(() => null)
    setAccessState("locked")
    setDashboard(null)
  }

  const saveRow = async (resource: ResourceName, payload: Record<string, string | boolean>, id?: string) => {
    const response = await fetch(id ? `/api/admin/os/${resource}/${id}` : `/api/admin/os/${resource}`, {
      method: id ? "PATCH" : "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || "Не удалось сохранить")
    await loadResource(resource)
    if (resource === "events") await loadResource("event_checklist_items")
    if (activeSection === "dashboard") await loadDashboard()
  }

  const deleteRow = async (resource: ResourceName, id: string) => {
    if (!id || !window.confirm("Удалить запись?")) return
    const response = await fetch(`/api/admin/os/${resource}/${id}`, {
      method: "DELETE",
      headers: buildHeaders(),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setPageError(data.error || "Не удалось удалить")
      return
    }
    await loadResource(resource)
  }

  const quickUpdate = async (resource: ResourceName, id: string, payload: Record<string, string | boolean>) => {
    if (!id) return
    const response = await fetch(`/api/admin/os/${resource}/${id}`, {
      method: "PATCH",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setPageError(data.error || "Не удалось обновить")
      return
    }
    await loadResource(resource)
  }

  const createTaskFromPlan = async (plan: OsRow) => {
    try {
      await saveRow("tasks", {
        title: stringValue(plan.title),
        description: stringValue(plan.target_result || plan.description),
        area: taskAreaFromPlanDirection(plan.direction),
        priority: stringValue(plan.priority || "Medium"),
        status: "Inbox",
        due_date: dateKey(plan.target_date),
        related_type: "plan",
        related_id: rowId(plan),
      })
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Не удалось создать задачу из плана")
    }
  }

  if (accessState !== "ready") {
    return (
      <LockScreen
        accessState={accessState}
        password={password}
        error={authError}
        loading={authLoading || accessState === "checking"}
        onPasswordChange={setPassword}
        onSubmit={login}
        onBack={() => router.push("/admin")}
      />
    )
  }

  const active = SECTIONS.find((section) => section.key === activeSection) || SECTIONS[0]
  const activeConfig = active.resource ? RESOURCE_CONFIGS[active.resource] : null
  const relatedCounts = buildRelatedCounts(rows.tasks, rows.leads)

  return (
    <ChessBackground>
      <main className="min-h-screen text-white">
        <div className="mx-auto flex max-w-[1480px] flex-col lg:min-h-screen lg:flex-row">
          <aside className="border-b border-white/10 bg-black/30 p-3 backdrop-blur-lg lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button onClick={() => router.push("/admin")} className="inline-flex items-center gap-2 text-sm font-bold text-white/65 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Admin
              </button>
              <button onClick={() => void logout()} className="rounded-lg border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white" title="Выйти из OS">
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.05] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 text-[#151515]">
                  <Flag className="h-5 w-5" />
                </div>
                <div>
                  <div className="brand-font text-lg uppercase">Rep Chess OS</div>
                  <div className="text-xs text-white/45">KRD operations</div>
                </div>
              </div>
            </div>

            <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                const activeItem = section.key === activeSection
                return (
                  <button
                    key={section.key}
                    onClick={() => navigateToSection(section)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors ${activeItem ? "bg-white text-[#151515]" : "text-white/68 hover:bg-white/10 hover:text-white"}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{section.label}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          <section className="min-w-0 flex-1 px-3 py-4 sm:px-5 lg:px-7 lg:py-6">
            <header className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-black uppercase text-white/50">
                  <BookOpenText className="h-3.5 w-3.5" />
                  Internal
                </div>
                <h1 className="brand-title text-4xl text-white sm:text-5xl">{active.label}</h1>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-white/55">
                {new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            </header>

            {pageError && (
              <div className="mb-4 rounded-lg border border-[#ff1515]/30 bg-[#ff1515]/12 p-3 text-sm text-[#ffc7c7]">
                {pageError}
              </div>
            )}

            {activeSection === "dashboard" ? (
              <DashboardView data={dashboard} loading={loadingKey === "dashboard"} />
            ) : activeSection === "settings" ? (
              <SettingsView onLogout={logout} />
            ) : activeConfig ? (
              <div className="space-y-6">
                <ResourceView
                  config={activeConfig}
                  rows={rows[activeConfig.resource]}
                  loading={loadingKey === activeConfig.resource}
                  relatedCounts={relatedCounts}
                  onSave={saveRow}
                  onDelete={deleteRow}
                  onQuickUpdate={quickUpdate}
                  onCreateTaskFromPlan={createTaskFromPlan}
                  onRefresh={loadResource}
                />
                {activeConfig.resource === "events" ? (
                  <ResourceView
                    config={RESOURCE_CONFIGS.event_checklist_items}
                    rows={rows.event_checklist_items}
                    loading={loadingKey === "event_checklist_items"}
                    onSave={saveRow}
                    onDelete={deleteRow}
                    onQuickUpdate={quickUpdate}
                    onCreateTaskFromPlan={createTaskFromPlan}
                    onRefresh={loadResource}
                  />
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </ChessBackground>
  )
}
