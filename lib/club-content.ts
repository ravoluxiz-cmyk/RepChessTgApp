export const CLUB_CONTENT_TYPES = ["honor", "news", "lecture", "rules", "review", "gallery"] as const

export type ClubContentType = typeof CLUB_CONTENT_TYPES[number]

export const CLUB_CONTENT_TYPE_LABELS: Record<ClubContentType, string> = {
  honor: "Доска почета",
  news: "Новости клуба",
  lecture: "Лекции",
  rules: "Правила",
  review: "Отзывы",
  gallery: "Галерея",
}

export const CLUB_CONTENT_TYPE_DESCRIPTIONS: Record<ClubContentType, string> = {
  honor: "Лучшие участники, победители и герои клубных вечеров.",
  news: "Анонсы, фотоотчеты и жизнь Rep Chess KRD.",
  lecture: "Материалы, конспекты и записи клубных лекций.",
  rules: "Как мы играем в недушные шахматы.",
  review: "Что участники говорят о турнирах и комьюнити.",
  gallery: "Фото с турниров, лекций и клубных вечеров.",
}

export interface ClubContent {
  id?: number
  type: ClubContentType
  title: string
  subtitle?: string | null
  body?: string | null
  image_url?: string | null
  external_url?: string | null
  author_name?: string | null
  is_published?: boolean
  is_featured?: boolean
  sort_order?: number
  published_at?: string | null
  created_at?: string
  updated_at?: string
}

export function normalizeClubContentType(value: unknown): ClubContentType {
  const raw = String(value || "").trim()
  return CLUB_CONTENT_TYPES.includes(raw as ClubContentType) ? raw as ClubContentType : "news"
}

export const DEFAULT_CLUB_CONTENT: ClubContent[] = [
  {
    id: -1,
    type: "rules",
    title: "Недушные шахматы",
    subtitle: "Главные ценности: кайф, комьюнити и шахматы.",
    body: "Играем честно, уважительно и без лишнего давления. У нас нет культа правила «тронул - ходи»: если ситуация не влияет на партию и не ломает вайб, сначала разговариваем по-человечески. Спорные моменты решает организатор.",
    is_published: true,
    is_featured: true,
    sort_order: 10,
  },
  {
    id: -2,
    type: "honor",
    title: "Легенды клубного вечера",
    subtitle: "Здесь будут лучшие участники, победители и самые активные игроки.",
    body: "Доска почета может отмечать не только рейтинг, но и посещаемость, спортивный прогресс, честную игру, помощь комьюнити и яркие партии.",
    is_published: true,
    is_featured: true,
    sort_order: 20,
  },
  {
    id: -3,
    type: "lecture",
    title: "Лекции Rep Chess KRD",
    subtitle: "Место для материалов в стиле лекции Алексея.",
    body: "Можно публиковать анонсы лекций, тезисы, ссылки на записи, подборки позиций и короткие заметки после встречи.",
    is_published: true,
    is_featured: false,
    sort_order: 30,
  },
  {
    id: -4,
    type: "review",
    title: "Отзывы участников",
    subtitle: "Живые впечатления о турнирах, людях и атмосфере.",
    body: "После турниров сюда можно добавлять лучшие отзывы и закреплять те, которые точнее всего передают настроение клуба.",
    is_published: true,
    is_featured: false,
    sort_order: 40,
  },
  {
    id: -5,
    type: "gallery",
    title: "Атмосфера Rep Chess KRD",
    subtitle: "Фото с турниров, где шахматы не выглядят как экзамен.",
    body: "Добавляйте сюда фотографии через админку: лучшие кадры будут попадать на главную страницу.",
    image_url: "/merch/repchess-merch-01.jpg",
    is_published: true,
    is_featured: true,
    sort_order: 50,
  },
]
