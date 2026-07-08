import { supabaseAdmin } from "@/lib/supabase"
import { buildRepChessOsSeedData } from "@/lib/rep-chess-os-seed"

export const TASK_STATUSES = [
  "Inbox",
  "Сегодня",
  "Эта неделя",
  "В работе",
  "Ожидание ответа",
  "Готово",
  "Отложено",
] as const

export const TASK_AREAS = [
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

export const TASK_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const

export const PLAN_HORIZONS = ["Краткосрочный", "Среднесрочный", "Долгосрочный"] as const

export const PLAN_STATUSES = [
  "Не начато",
  "В работе",
  "Есть прогресс",
  "Выполнено",
  "Пауза",
  "Отменено",
] as const

export const PLAN_DIRECTIONS = [
  "Regular Events",
  "Corporate",
  "Education",
  "Big Events / ТЦ",
  "Developers / ЖК",
  "Rating",
  "Grants",
  "Media / Telegram",
  "Operations",
  "Finance",
  "Strategic",
] as const

export const LEAD_SEGMENTS = [
  "Corporate",
  "Education",
  "ТЦ",
  "Developers / ЖК",
  "Event Agencies",
  "Festivals",
  "Venues",
  "Media",
  "Grants",
  "Other",
] as const

export const LEAD_STATUSES = [
  "Новый лид",
  "Контакт найден",
  "Первое сообщение отправлено",
  "Ответили",
  "Созвон / встреча",
  "КП отправлено",
  "Переговоры",
  "Сделка выиграна",
  "Сделка проиграна",
  "Пауза",
] as const

export const EVENT_TYPES = [
  "Regular",
  "Special",
  "Corporate",
  "Education",
  "Rating",
  "Big Event",
  "Festival",
] as const

export const EVENT_STATUSES = [
  "Запланирован",
  "В подготовке",
  "Проведён",
  "Перенесён",
  "Отменён",
] as const

export const CHECKLIST_STAGES = [
  "За 7+ дней",
  "За 3-5 дней",
  "За 1 день",
  "В день турнира",
  "После турнира",
] as const

export const CHECKLIST_STATUSES = [
  "Не начато",
  "В работе",
  "Готово",
  "Не требуется",
  "Проблема",
] as const

export const FINANCE_TYPES = ["Income", "Expense"] as const

export const FINANCE_DIRECTIONS = [
  "Regular Events",
  "Corporate",
  "Education",
  "Big Events / ТЦ",
  "Developers / ЖК",
  "Rating",
  "Grants",
  "Other",
] as const

export const MESSAGE_CATEGORIES = [
  "Новая площадка",
  "Follow-up",
  "Действующая площадка",
  "Специвент",
  "ТЦ",
  "Фестиваль",
  "Corporate",
  "Education",
  "Media",
  "Отказ от бесплатного формата",
  "Post-event",
  "Команда",
  "Анонсы",
  "Коллаборации",
] as const

export const MESSAGE_EFFECTIVENESS = ["unknown", "good", "bad"] as const

export type RepChessOsResource =
  | "tasks"
  | "leads"
  | "directions"
  | "plans"
  | "events"
  | "event_checklist_items"
  | "finance_entries"
  | "weekly_reviews"
  | "message_templates"

export type RepChessOsRow = Record<string, unknown> & { id?: string | number }

export interface RepChessOsListFilters {
  status?: string
  area?: string
  segment?: string
  priority?: string
  horizon?: string
  direction?: string
  type?: string
  event_type?: string
  category?: string
  effectiveness?: string
  stage?: string
  due?: string
  search?: string
}

interface ResourceOrder {
  column: string
  ascending: boolean
}

const RESOURCE_TABLES: Record<RepChessOsResource, string> = {
  tasks: "repchess_os_tasks",
  leads: "repchess_os_leads",
  directions: "repchess_os_directions",
  plans: "repchess_os_plans",
  events: "repchess_os_events",
  event_checklist_items: "repchess_os_event_checklist_items",
  finance_entries: "repchess_os_finance_entries",
  weekly_reviews: "repchess_os_weekly_reviews",
  message_templates: "repchess_os_message_templates",
}

const RESOURCE_ORDER: Record<RepChessOsResource, ResourceOrder> = {
  tasks: { column: "due_date", ascending: true },
  leads: { column: "next_action_date", ascending: true },
  directions: { column: "created_at", ascending: true },
  plans: { column: "target_date", ascending: true },
  events: { column: "date", ascending: true },
  event_checklist_items: { column: "created_at", ascending: true },
  finance_entries: { column: "date", ascending: false },
  weekly_reviews: { column: "week_start", ascending: false },
  message_templates: { column: "updated_at", ascending: false },
}

const TASK_DONE_STATUS = "Готово"
const WON_LEAD_STATUS = "Сделка выиграна"
const LOST_LEAD_STATUS = "Сделка проиграна"
const PAUSED_LEAD_STATUS = "Пауза"
const SETUP_ERROR_MESSAGE = "База Rep Chess OS ещё не создана в Supabase. Нужно применить supabase_migration_rep_chess_os.sql, затем открыть OS снова."

export class RepChessOsSetupError extends Error {
  constructor(message = SETUP_ERROR_MESSAGE) {
    super(message)
    this.name = "RepChessOsSetupError"
  }
}

const DEFAULT_EVENT_CHECKLIST: Array<{ stage: string; title: string }> = [
  { stage: "За 7+ дней", title: "Подтвердить дату и время" },
  { stage: "За 7+ дней", title: "Согласовать формат" },
  { stage: "За 7+ дней", title: "Запросить призы" },
  { stage: "За 7+ дней", title: "Запросить поддержку в соцсетях" },
  { stage: "За 7+ дней", title: "Передать данные дизайнеру" },
  { stage: "За 7+ дней", title: "Определить ведущего" },
  { stage: "За 3-5 дней", title: "Проверить готовность афиши" },
  { stage: "За 3-5 дней", title: "Подготовить пост" },
  { stage: "За 3-5 дней", title: "Открыть регистрацию" },
  { stage: "За 3-5 дней", title: "Отправить площадке афишу и текст" },
  { stage: "За 3-5 дней", title: "Подтвердить ведущего" },
  { stage: "За 1 день", title: "Сделать напоминание в канал" },
  { stage: "За 1 день", title: "Проверить регистрацию" },
  { stage: "За 1 день", title: "Проверить инвентарь" },
  { stage: "За 1 день", title: "Подтвердить с площадкой детали" },
  { stage: "За 1 день", title: "Проверить, что ведущий знает формат и призы" },
  { stage: "В день турнира", title: "Приехать заранее" },
  { stage: "В день турнира", title: "Расставить доски, часы, номерки" },
  { stage: "В день турнира", title: "Проверить призы" },
  { stage: "В день турнира", title: "Объявить правила" },
  { stage: "В день турнира", title: "Провести турнир" },
  { stage: "В день турнира", title: "Сделать фото/видео" },
  { stage: "В день турнира", title: "Зафиксировать итоговую таблицу" },
  { stage: "В день турнира", title: "Забрать оплату / подтвердить расчёт" },
  { stage: "После турнира", title: "Внести посещаемость" },
  { stage: "После турнира", title: "Добавить ссылку на турнир" },
  { stage: "После турнира", title: "Отметить финансовый результат" },
  { stage: "После турнира", title: "Отметить проблемы" },
  { stage: "После турнира", title: "Собрать фото" },
  { stage: "После турнира", title: "Понять, нужен ли пост/сторис" },
  { stage: "После турнира", title: "Сделать вывод, повторять ли формат" },
]

export function isRepChessOsResource(value: string): value is RepChessOsResource {
  return value in RESOURCE_TABLES
}

export function getRepChessOsMeta() {
  return {
    taskStatuses: TASK_STATUSES,
    taskAreas: TASK_AREAS,
    taskPriorities: TASK_PRIORITIES,
    planHorizons: PLAN_HORIZONS,
    planStatuses: PLAN_STATUSES,
    planDirections: PLAN_DIRECTIONS,
    leadSegments: LEAD_SEGMENTS,
    leadStatuses: LEAD_STATUSES,
    eventTypes: EVENT_TYPES,
    eventStatuses: EVENT_STATUSES,
    checklistStages: CHECKLIST_STAGES,
    checklistStatuses: CHECKLIST_STATUSES,
    financeTypes: FINANCE_TYPES,
    financeDirections: FINANCE_DIRECTIONS,
    messageCategories: MESSAGE_CATEGORIES,
    messageEffectiveness: MESSAGE_EFFECTIVENESS,
  }
}

function toCleanString(value: unknown) {
  const normalized = String(value ?? "").trim()
  return normalized || null
}

function toRequiredString(value: unknown, field: string) {
  const normalized = toCleanString(value)
  if (!normalized) throw new Error(`${field} is required`)
  return normalized
}

function toNumber(value: unknown, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toInteger(value: unknown) {
  if (value === "" || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null
}

function toOptionalDate(value: unknown) {
  const normalized = toCleanString(value)
  return normalized
}

function toTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean)
  }
  const normalized = toCleanString(value)
  if (!normalized) return []
  return normalized.split(",").map((tag) => tag.trim()).filter(Boolean)
}

function readInput(input: unknown) {
  if (!input || typeof input !== "object") return {} as Record<string, unknown>
  return input as Record<string, unknown>
}

function stripUndefined(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  )
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7)
}

function dateValue(row: RepChessOsRow, key: string) {
  const value = row[key]
  return typeof value === "string" ? value.slice(0, 10) : ""
}

function isSameMonth(row: RepChessOsRow, key: string, targetMonth = monthKey()) {
  const value = dateValue(row, key)
  return value.startsWith(targetMonth)
}

function isIncompleteTask(row: RepChessOsRow) {
  return row.status !== TASK_DONE_STATUS && !row.completed_at
}

function isActiveLead(row: RepChessOsRow) {
  return ![WON_LEAD_STATUS, LOST_LEAD_STATUS, PAUSED_LEAD_STATUS].includes(String(row.status || ""))
}

function rowNumber(row: RepChessOsRow, key: string) {
  return toNumber(row[key], 0)
}

function sortByDate(rows: RepChessOsRow[], key: string, ascending = true) {
  return rows.slice().sort((left, right) => {
    const leftDate = dateValue(left, key) || "9999-12-31"
    const rightDate = dateValue(right, key) || "9999-12-31"
    return ascending ? leftDate.localeCompare(rightDate) : rightDate.localeCompare(leftDate)
  })
}

function normalizeId(id: string) {
  return /^\d+$/.test(id) ? Number(id) : id
}

function assertKnownOption(value: unknown, options: readonly string[], fallback: string) {
  const normalized = toCleanString(value)
  if (!normalized) return fallback
  return options.includes(normalized) ? normalized : fallback
}

function taskPayload(input: unknown, isCreate: boolean) {
  const body = readInput(input)
  const status = assertKnownOption(body.status, TASK_STATUSES, "Inbox")
  const payload: Record<string, unknown> = {
    title: isCreate ? toRequiredString(body.title, "title") : body.title === undefined ? undefined : toRequiredString(body.title, "title"),
    description: body.description === undefined ? undefined : toCleanString(body.description),
    area: body.area === undefined ? undefined : assertKnownOption(body.area, TASK_AREAS, "Operations"),
    priority: body.priority === undefined ? undefined : assertKnownOption(body.priority, TASK_PRIORITIES, "Medium"),
    status: body.status === undefined ? undefined : status,
    due_date: body.due_date === undefined ? undefined : toOptionalDate(body.due_date),
    owner: body.owner === undefined ? undefined : toCleanString(body.owner),
    related_type: body.related_type === undefined ? undefined : toCleanString(body.related_type),
    related_id: body.related_id === undefined ? undefined : toCleanString(body.related_id),
    completed_at: body.completed_at === undefined ? undefined : toCleanString(body.completed_at),
  }

  if (isCreate) {
    payload.status = status
    payload.area = payload.area ?? "Operations"
    payload.priority = payload.priority ?? "Medium"
  }

  if (payload.status === TASK_DONE_STATUS && body.completed_at === undefined) {
    payload.completed_at = new Date().toISOString()
  } else if (payload.status && payload.status !== TASK_DONE_STATUS) {
    payload.completed_at = null
  }

  return stripUndefined(payload)
}

function leadPayload(input: unknown, isCreate: boolean) {
  const body = readInput(input)
  const payload: Record<string, unknown> = {
    name: isCreate ? toRequiredString(body.name, "name") : body.name === undefined ? undefined : toRequiredString(body.name, "name"),
    segment: body.segment === undefined ? undefined : assertKnownOption(body.segment, LEAD_SEGMENTS, "Other"),
    status: body.status === undefined ? undefined : assertKnownOption(body.status, LEAD_STATUSES, "Новый лид"),
    contact_name: body.contact_name === undefined ? undefined : toCleanString(body.contact_name),
    contact_role: body.contact_role === undefined ? undefined : toCleanString(body.contact_role),
    telegram: body.telegram === undefined ? undefined : toCleanString(body.telegram),
    phone: body.phone === undefined ? undefined : toCleanString(body.phone),
    email: body.email === undefined ? undefined : toCleanString(body.email),
    website: body.website === undefined ? undefined : toCleanString(body.website),
    source: body.source === undefined ? undefined : toCleanString(body.source),
    potential_value: body.potential_value === undefined ? undefined : toNumber(body.potential_value, 0),
    probability: body.probability === undefined ? undefined : toNumber(body.probability, 0),
    next_action: body.next_action === undefined ? undefined : toCleanString(body.next_action),
    next_action_date: body.next_action_date === undefined ? undefined : toOptionalDate(body.next_action_date),
    notes: body.notes === undefined ? undefined : toCleanString(body.notes),
  }

  if (isCreate) {
    payload.segment = payload.segment ?? "Other"
    payload.status = payload.status ?? "Новый лид"
    payload.potential_value = payload.potential_value ?? 0
    payload.probability = payload.probability ?? 0
  }

  return stripUndefined(payload)
}

function directionPayload(input: unknown, isCreate: boolean) {
  const body = readInput(input)
  return stripUndefined({
    name: isCreate ? toRequiredString(body.name, "name") : body.name === undefined ? undefined : toRequiredString(body.name, "name"),
    description: body.description === undefined ? undefined : toCleanString(body.description),
    goal: body.goal === undefined ? undefined : toCleanString(body.goal),
    target_revenue: body.target_revenue === undefined ? undefined : toNumber(body.target_revenue, 0),
    current_status: body.current_status === undefined ? undefined : toCleanString(body.current_status),
    main_metric: body.main_metric === undefined ? undefined : toCleanString(body.main_metric),
    risks: body.risks === undefined ? undefined : toCleanString(body.risks),
    next_step: body.next_step === undefined ? undefined : toCleanString(body.next_step),
  })
}

function planPayload(input: unknown, isCreate: boolean) {
  const body = readInput(input)
  const payload = {
    title: isCreate ? toRequiredString(body.title, "title") : body.title === undefined ? undefined : toRequiredString(body.title, "title"),
    horizon: body.horizon === undefined ? undefined : assertKnownOption(body.horizon, PLAN_HORIZONS, "Краткосрочный"),
    direction: body.direction === undefined ? undefined : assertKnownOption(body.direction, PLAN_DIRECTIONS, "Operations"),
    description: body.description === undefined ? undefined : toCleanString(body.description),
    target_result: body.target_result === undefined ? undefined : toCleanString(body.target_result),
    target_date: body.target_date === undefined ? undefined : toOptionalDate(body.target_date),
    status: body.status === undefined ? undefined : assertKnownOption(body.status, PLAN_STATUSES, "Не начато"),
    priority: body.priority === undefined ? undefined : assertKnownOption(body.priority, TASK_PRIORITIES, "Medium"),
  }

  if (isCreate) {
    payload.horizon = payload.horizon ?? "Краткосрочный"
    payload.direction = payload.direction ?? "Operations"
    payload.status = payload.status ?? "Не начато"
    payload.priority = payload.priority ?? "Medium"
  }

  return stripUndefined(payload)
}

function eventPayload(input: unknown, isCreate: boolean) {
  const body = readInput(input)
  return stripUndefined({
    title: isCreate ? toRequiredString(body.title, "title") : body.title === undefined ? undefined : toRequiredString(body.title, "title"),
    event_type: body.event_type === undefined ? undefined : assertKnownOption(body.event_type, EVENT_TYPES, "Regular"),
    venue: body.venue === undefined ? undefined : toCleanString(body.venue),
    date: body.date === undefined ? undefined : toOptionalDate(body.date),
    time: body.time === undefined ? undefined : toCleanString(body.time),
    format: body.format === undefined ? undefined : toCleanString(body.format),
    control: body.control === undefined ? undefined : toCleanString(body.control),
    rounds: body.rounds === undefined ? undefined : toInteger(body.rounds),
    host: body.host === undefined ? undefined : toCleanString(body.host),
    fixed_fee: body.fixed_fee === undefined ? undefined : toNumber(body.fixed_fee, 0),
    expected_participants: body.expected_participants === undefined ? undefined : toInteger(body.expected_participants),
    actual_participants: body.actual_participants === undefined ? undefined : toInteger(body.actual_participants),
    status: body.status === undefined ? undefined : assertKnownOption(body.status, EVENT_STATUSES, "Запланирован"),
    swiss_link: body.swiss_link === undefined ? undefined : toCleanString(body.swiss_link),
    notes: body.notes === undefined ? undefined : toCleanString(body.notes),
  })
}

function checklistPayload(input: unknown, isCreate: boolean) {
  const body = readInput(input)
  return stripUndefined({
    event_id: isCreate ? toRequiredString(body.event_id, "event_id") : body.event_id === undefined ? undefined : toRequiredString(body.event_id, "event_id"),
    stage: body.stage === undefined ? undefined : assertKnownOption(body.stage, CHECKLIST_STAGES, "За 7+ дней"),
    title: isCreate ? toRequiredString(body.title, "title") : body.title === undefined ? undefined : toRequiredString(body.title, "title"),
    status: body.status === undefined ? undefined : assertKnownOption(body.status, CHECKLIST_STATUSES, "Не начато"),
    owner: body.owner === undefined ? undefined : toCleanString(body.owner),
    due_date: body.due_date === undefined ? undefined : toOptionalDate(body.due_date),
    notes: body.notes === undefined ? undefined : toCleanString(body.notes),
  })
}

function financePayload(input: unknown, isCreate: boolean) {
  const body = readInput(input)
  const type = assertKnownOption(body.type, FINANCE_TYPES, "Income")
  const amount = body.amount === undefined ? undefined : toNumber(body.amount, 0)
  const cheslavShare = body.cheslav_share === undefined ? undefined : toNumber(body.cheslav_share, 0)
  const ilyaShare = body.ilya_share === undefined ? undefined : toNumber(body.ilya_share, 0)
  const splitShare = type === "Income" && typeof amount === "number" && cheslavShare === undefined && ilyaShare === undefined
    ? Math.round(amount / 2)
    : undefined

  const payload: Record<string, unknown> = {
    date: isCreate ? toRequiredString(body.date || todayKey(), "date") : body.date === undefined ? undefined : toRequiredString(body.date, "date"),
    type: body.type === undefined ? undefined : type,
    source: body.source === undefined ? undefined : toCleanString(body.source),
    direction: body.direction === undefined ? undefined : assertKnownOption(body.direction, FINANCE_DIRECTIONS, "Other"),
    amount,
    cheslav_share: cheslavShare ?? splitShare,
    ilya_share: ilyaShare ?? splitShare,
    expense_category: body.expense_category === undefined ? undefined : toCleanString(body.expense_category),
    related_event_id: body.related_event_id === undefined ? undefined : toCleanString(body.related_event_id),
    related_lead_id: body.related_lead_id === undefined ? undefined : toCleanString(body.related_lead_id),
    notes: body.notes === undefined ? undefined : toCleanString(body.notes),
  }

  if (isCreate) {
    payload.type = payload.type ?? "Income"
    payload.direction = payload.direction ?? "Other"
    payload.amount = payload.amount ?? 0
    payload.cheslav_share = payload.cheslav_share ?? 0
    payload.ilya_share = payload.ilya_share ?? 0
  }

  return stripUndefined(payload)
}

function weeklyReviewPayload(input: unknown, isCreate: boolean) {
  const body = readInput(input)
  return stripUndefined({
    week_start: isCreate ? toRequiredString(body.week_start, "week_start") : body.week_start === undefined ? undefined : toRequiredString(body.week_start, "week_start"),
    week_end: isCreate ? toRequiredString(body.week_end, "week_end") : body.week_end === undefined ? undefined : toRequiredString(body.week_end, "week_end"),
    events_count: body.events_count === undefined ? undefined : toInteger(body.events_count) ?? 0,
    participants_count: body.participants_count === undefined ? undefined : toInteger(body.participants_count) ?? 0,
    revenue: body.revenue === undefined ? undefined : toNumber(body.revenue, 0),
    cheslav_income: body.cheslav_income === undefined ? undefined : toNumber(body.cheslav_income, 0),
    new_subscribers: body.new_subscribers === undefined ? undefined : toInteger(body.new_subscribers) ?? 0,
    new_leads: body.new_leads === undefined ? undefined : toInteger(body.new_leads) ?? 0,
    proposals_sent: body.proposals_sent === undefined ? undefined : toInteger(body.proposals_sent) ?? 0,
    meetings_count: body.meetings_count === undefined ? undefined : toInteger(body.meetings_count) ?? 0,
    deals_won: body.deals_won === undefined ? undefined : toInteger(body.deals_won) ?? 0,
    what_worked: body.what_worked === undefined ? undefined : toCleanString(body.what_worked),
    what_failed: body.what_failed === undefined ? undefined : toCleanString(body.what_failed),
    next_week_focus: body.next_week_focus === undefined ? undefined : toCleanString(body.next_week_focus),
  })
}

function messageTemplatePayload(input: unknown, isCreate: boolean) {
  const body = readInput(input)
  return stripUndefined({
    title: isCreate ? toRequiredString(body.title, "title") : body.title === undefined ? undefined : toRequiredString(body.title, "title"),
    category: body.category === undefined ? undefined : assertKnownOption(body.category, MESSAGE_CATEGORIES, "Follow-up"),
    body: isCreate ? toRequiredString(body.body, "body") : body.body === undefined ? undefined : toRequiredString(body.body, "body"),
    tags: body.tags === undefined ? undefined : toTags(body.tags),
    is_favorite: body.is_favorite === undefined ? undefined : Boolean(body.is_favorite),
    effectiveness: body.effectiveness === undefined ? undefined : assertKnownOption(body.effectiveness, MESSAGE_EFFECTIVENESS, "unknown"),
  })
}

function buildPayload(resource: RepChessOsResource, input: unknown, isCreate: boolean) {
  switch (resource) {
    case "tasks":
      return taskPayload(input, isCreate)
    case "leads":
      return leadPayload(input, isCreate)
    case "directions":
      return directionPayload(input, isCreate)
    case "plans":
      return planPayload(input, isCreate)
    case "events":
      return eventPayload(input, isCreate)
    case "event_checklist_items":
      return checklistPayload(input, isCreate)
    case "finance_entries":
      return financePayload(input, isCreate)
    case "weekly_reviews":
      return weeklyReviewPayload(input, isCreate)
    case "message_templates":
      return messageTemplatePayload(input, isCreate)
  }
}

function withTimestamp(payload: Record<string, unknown>, isCreate: boolean) {
  const now = new Date().toISOString()
  return {
    ...payload,
    ...(isCreate ? { created_at: now } : {}),
    updated_at: now,
  }
}

function rowsFrom(data: unknown): RepChessOsRow[] {
  return Array.isArray(data) ? data as RepChessOsRow[] : []
}

function rowFrom(data: unknown): RepChessOsRow | null {
  return data && typeof data === "object" ? data as RepChessOsRow : null
}

function isMissingTableError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const { code, message } = error as { code?: string; message?: string }
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    String(message || "").toLowerCase().includes("could not find the table") ||
    String(message || "").toLowerCase().includes("schema cache") ||
    String(message || "").toLowerCase().includes("does not exist")
  )
}

function throwRepChessOsDataError(error: unknown, fallback: string): never {
  if (isMissingTableError(error)) {
    throw new RepChessOsSetupError()
  }

  const message = error && typeof error === "object" && "message" in error
    ? String((error as { message?: string }).message || fallback)
    : fallback
  throw new Error(message)
}

function seedRowsWithTimestamp(rows: RepChessOsRow[]) {
  return rows.map((row) => withTimestamp(row, true))
}

let seedPromise: Promise<void> | null = null

async function resourceHasAnyRows(resource: RepChessOsResource) {
  const { data, error } = await supabaseAdmin
    .from(RESOURCE_TABLES[resource])
    .select("id")
    .limit(1)

  if (error) {
    throwRepChessOsDataError(error, `Failed to inspect ${resource}`)
  }

  return rowsFrom(data).length > 0
}

async function seedResourceIfEmpty(resource: RepChessOsResource, rows: RepChessOsRow[]) {
  if (rows.length === 0 || await resourceHasAnyRows(resource)) return

  const { error } = await supabaseAdmin
    .from(RESOURCE_TABLES[resource])
    .insert(seedRowsWithTimestamp(rows))

  if (error) {
    throwRepChessOsDataError(error, `Failed to seed ${resource}`)
  }
}

async function seedRepChessOsData() {
  const seed = buildRepChessOsSeedData()

  await seedResourceIfEmpty("directions", seed.directions)
  await seedResourceIfEmpty("tasks", seed.tasks)
  await seedResourceIfEmpty("plans", seed.plans)
  await seedResourceIfEmpty("leads", seed.leads)
  await seedResourceIfEmpty("weekly_reviews", seed.weekly_reviews)
  await seedResourceIfEmpty("message_templates", seed.message_templates)
}

export async function ensureRepChessOsSeedData() {
  if (!seedPromise) {
    seedPromise = seedRepChessOsData().catch((error) => {
      seedPromise = null
      throw error
    })
  }

  await seedPromise
}

function applyFilters(resource: RepChessOsResource, rows: RepChessOsRow[], filters: RepChessOsListFilters) {
  const search = String(filters.search || "").trim().toLowerCase()
  const today = todayKey()

  return rows.filter((row) => {
    if (filters.status && filters.status !== "all" && row.status !== filters.status) return false
    if (filters.area && filters.area !== "all" && row.area !== filters.area) return false
    if (filters.segment && filters.segment !== "all" && row.segment !== filters.segment) return false
    if (filters.priority && filters.priority !== "all" && row.priority !== filters.priority) return false
    if (filters.horizon && filters.horizon !== "all" && row.horizon !== filters.horizon) return false
    if (filters.direction && filters.direction !== "all" && row.direction !== filters.direction) return false
    if (filters.type && filters.type !== "all" && row.type !== filters.type) return false
    if (filters.event_type && filters.event_type !== "all" && row.event_type !== filters.event_type) return false
    if (filters.category && filters.category !== "all" && row.category !== filters.category) return false
    if (filters.effectiveness && filters.effectiveness !== "all" && row.effectiveness !== filters.effectiveness) return false
    if (filters.stage && filters.stage !== "all" && row.stage !== filters.stage) return false

    if (filters.due === "overdue") {
      const key = resource === "leads" ? "next_action_date" : "due_date"
      const dueDate = dateValue(row, key)
      if (!dueDate || dueDate >= today) return false
      if (resource === "tasks" && !isIncompleteTask(row)) return false
      if (resource === "leads" && !isActiveLead(row)) return false
    }

    if (filters.due === "today") {
      const key = resource === "leads" ? "next_action_date" : "due_date"
      if (dateValue(row, key) !== today) return false
    }

    if (search) {
      const haystack = Object.values(row).join(" ").toLowerCase()
      if (!haystack.includes(search)) return false
    }

    return true
  })
}

async function createDefaultChecklist(eventId: string | number | undefined) {
  if (eventId === undefined || eventId === null) return
  const rows = DEFAULT_EVENT_CHECKLIST.map((item) => ({
    event_id: eventId,
    stage: item.stage,
    title: item.title,
    status: "Не начато",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabaseAdmin
    .from(RESOURCE_TABLES.event_checklist_items)
    .insert(rows)

  if (error) {
    console.error("Failed to create Rep Chess OS event checklist:", error)
  }
}

export async function listRepChessOsResource(
  resource: RepChessOsResource,
  filters: RepChessOsListFilters = {}
) {
  await ensureRepChessOsSeedData()

  const order = RESOURCE_ORDER[resource]
  const { data, error } = await supabaseAdmin
    .from(RESOURCE_TABLES[resource])
    .select("*")
    .order(order.column, { ascending: order.ascending })

  if (error) {
    throwRepChessOsDataError(error, `Failed to list ${resource}`)
  }

  return applyFilters(resource, rowsFrom(data), filters)
}

export async function createRepChessOsResource(resource: RepChessOsResource, input: unknown) {
  await ensureRepChessOsSeedData()

  const payload = withTimestamp(buildPayload(resource, input, true), true)
  const { data, error } = await supabaseAdmin
    .from(RESOURCE_TABLES[resource])
    .insert(payload)
    .select("*")
    .single()

  if (error) {
    throwRepChessOsDataError(error, `Failed to create ${resource}`)
  }

  const row = rowFrom(data)
  if (resource === "events") {
    await createDefaultChecklist(row?.id)
  }

  return row
}

export async function updateRepChessOsResource(
  resource: RepChessOsResource,
  id: string,
  input: unknown
) {
  await ensureRepChessOsSeedData()

  const payload = withTimestamp(buildPayload(resource, input, false), false)
  if (Object.keys(payload).length <= 1) {
    throw new Error("No fields to update")
  }

  const { data, error } = await supabaseAdmin
    .from(RESOURCE_TABLES[resource])
    .update(payload)
    .eq("id", normalizeId(id))
    .select("*")
    .single()

  if (error) {
    throwRepChessOsDataError(error, `Failed to update ${resource}`)
  }

  return rowFrom(data)
}

export async function deleteRepChessOsResource(resource: RepChessOsResource, id: string) {
  await ensureRepChessOsSeedData()

  const { error } = await supabaseAdmin
    .from(RESOURCE_TABLES[resource])
    .delete()
    .eq("id", normalizeId(id))

  if (error) {
    throwRepChessOsDataError(error, `Failed to delete ${resource}`)
  }

  return true
}

const STRATEGIC_DIRECTIONS = [
  "Corporate",
  "Education",
  "Big Events / ТЦ",
  "Developers / ЖК",
  "Rating",
  "Grants",
  "Media / Telegram",
  "Regular Events",
] as const

function canonicalDirection(value: unknown) {
  const direction = String(value || "").trim()
  if (direction === "Rating Tournaments") return "Rating"
  if (direction === "Media / Telegram Growth") return "Media / Telegram"
  if (direction === "ТЦ") return "Big Events / ТЦ"
  if (["Event Agencies", "Festivals", "Venues"].includes(direction)) return "Big Events / ТЦ"
  return direction
}

function tomorrowKey() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

export async function getRepChessOsDashboard() {
  const [
    tasks,
    leads,
    directions,
    plans,
    events,
    financeEntries,
    weeklyReviews,
  ] = await Promise.all([
    listRepChessOsResource("tasks"),
    listRepChessOsResource("leads"),
    listRepChessOsResource("directions"),
    listRepChessOsResource("plans"),
    listRepChessOsResource("events"),
    listRepChessOsResource("finance_entries"),
    listRepChessOsResource("weekly_reviews"),
  ])

  const today = todayKey()
  const tomorrow = tomorrowKey()
  const currentMonth = monthKey()
  const monthFinance = financeEntries.filter((row) => isSameMonth(row, "date", currentMonth))
  const income = monthFinance.filter((row) => row.type === "Income")
  const expenses = monthFinance.filter((row) => row.type === "Expense")
  const activeLeads = leads.filter(isActiveLead)
  const incompleteTasks = tasks.filter(isIncompleteTask)
  const latestWeeklyReview = sortByDate(weeklyReviews, "week_start", false)[0] || null

  const monthRevenue = income.reduce((sum, row) => sum + rowNumber(row, "amount"), 0)
  const monthExpenses = expenses.reduce((sum, row) => sum + rowNumber(row, "amount"), 0)
  const cheslavShare = income.reduce((sum, row) => sum + rowNumber(row, "cheslav_share"), 0)
  const monthRevenuePlan = directions.reduce((sum, row) => sum + rowNumber(row, "target_revenue"), 0)

  const tasksToday = incompleteTasks.filter((row) => dateValue(row, "due_date") === today)
  const tasksTodayOrTomorrow = incompleteTasks.filter((row) => {
    const dueDate = dateValue(row, "due_date")
    return dueDate === today || dueDate === tomorrow
  })
  const overdueTasks = incompleteTasks.filter((row) => {
    const dueDate = dateValue(row, "due_date")
    return Boolean(dueDate && dueDate < today)
  })
  const highPriorityTasks = incompleteTasks.filter((row) => ["High", "Critical"].includes(String(row.priority || "")))
  const waitingTasks = incompleteTasks.filter((row) => row.status === "Ожидание ответа")
  const eventsThisMonth = events.filter((row) => isSameMonth(row, "date", currentMonth))
  const proposalsSent = leads.filter((row) => row.status === "КП отправлено")
  const meetingsLeads = leads.filter((row) => row.status === "Созвон / встреча")
  const overdueFollowUps = activeLeads.filter((row) => {
    const nextActionDate = dateValue(row, "next_action_date")
    return Boolean(nextActionDate && nextActionDate < today)
  })
  const expectedPipelineValue = activeLeads.reduce((sum, row) => {
    const probability = rowNumber(row, "probability") > 1
      ? rowNumber(row, "probability") / 100
      : rowNumber(row, "probability")
    return sum + rowNumber(row, "potential_value") * probability
  }, 0)
  const strategicProgress = STRATEGIC_DIRECTIONS.map((directionName) => {
    const direction = directions.find((row) => canonicalDirection(row.name) === directionName)
    const relatedTasks = incompleteTasks.filter((row) => canonicalDirection(row.area) === directionName)
    const relatedLeads = activeLeads.filter((row) => canonicalDirection(row.segment) === directionName)
    const relatedPlans = plans.filter((row) => canonicalDirection(row.direction) === directionName)
    const potentialRevenue = relatedLeads.reduce((sum, row) => sum + rowNumber(row, "potential_value"), 0)

    return {
      name: directionName,
      current_status: direction?.current_status || "Не задано",
      goal: direction?.goal || direction?.description || "",
      next_step: direction?.next_step || "",
      active_tasks: relatedTasks.length,
      active_leads: relatedLeads.length,
      active_plans: relatedPlans.filter((row) => !["Выполнено", "Отменено"].includes(String(row.status || ""))).length,
      potential_revenue: potentialRevenue,
    }
  })

  return {
    metrics: {
      monthRevenue,
      monthRevenuePlan,
      expectedPipelineValue,
      cheslavShare,
      monthExpenses,
      estimatedNet: monthRevenue - monthExpenses,
      eventsThisMonth: eventsThisMonth.length,
      activeLeads: activeLeads.length,
      proposalsSent: proposalsSent.length,
      meetings: meetingsLeads.length,
      tasksToday: tasksToday.length,
      overdueTasks: overdueTasks.length,
      overdueFollowUps: overdueFollowUps.length,
      waitingTasks: waitingTasks.length,
      weekFocus: String(latestWeeklyReview?.next_week_focus || "Фокус недели пока не задан"),
    },
    nextActions: {
      tasks: sortByDate(incompleteTasks, "due_date").slice(0, 6),
      followUps: sortByDate(activeLeads.filter((row) => dateValue(row, "next_action_date")), "next_action_date").slice(0, 6),
      events: sortByDate(events.filter((row) => {
        const date = dateValue(row, "date")
        return date && date >= today && !["Проведён", "Отменён"].includes(String(row.status || ""))
      }), "date").slice(0, 6),
      highPriorityTasks: sortByDate(highPriorityTasks, "due_date").slice(0, 6),
      tasksTodayOrTomorrow: sortByDate(tasksTodayOrTomorrow, "due_date").slice(0, 6),
    },
    strategicProgress,
    latestWeeklyReview,
  }
}
