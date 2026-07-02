export type HelpBotTopic =
  | "greeting"
  | "registration"
  | "schedule"
  | "rating"
  | "profile"
  | "beginners"
  | "lessons"
  | "merch"
  | "partners"
  | "rules"
  | "club"
  | "contacts"
  | "technical"
  | "admin"
  | "unknown"

export interface HelpBotAnswer {
  topic: HelpBotTopic
  title: string
  answer: string
  keywords: string[]
  phrases?: string[]
  suggestions?: string[]
  escalate?: boolean
}

export interface HelpBotResult {
  answer: HelpBotAnswer
  confidence: number
  suggestions: string[]
  shouldEscalate: boolean
}

const COMMON_SUGGESTIONS = [
  "Где расписание турниров?",
  "Как записаться на турнир?",
  "Как считается рейтинг?",
  "Позвать администратора",
]

const STOP_WORDS = new Set([
  "а",
  "в",
  "во",
  "да",
  "для",
  "до",
  "же",
  "и",
  "или",
  "как",
  "мне",
  "на",
  "не",
  "ну",
  "о",
  "об",
  "по",
  "под",
  "с",
  "со",
  "то",
  "у",
  "что",
  "это",
  "я",
])

const ENDINGS = [
  "иями",
  "ями",
  "ами",
  "ого",
  "ему",
  "ыми",
  "ими",
  "иях",
  "ах",
  "ях",
  "ость",
  "ение",
  "ать",
  "ять",
  "ить",
  "ешь",
  "ете",
  "ого",
  "ому",
  "ами",
  "ыми",
  "ой",
  "ий",
  "ый",
  "ая",
  "ое",
  "ые",
  "ых",
  "ам",
  "ям",
  "ом",
  "ем",
  "ах",
  "ях",
  "а",
  "я",
  "ы",
  "и",
  "е",
  "у",
  "ю",
]

export const HELP_BOT_ANSWERS: HelpBotAnswer[] = [
  {
    topic: "greeting",
    title: "Приветствие",
    answer:
      "Привет! Я помогу с турнирами, записью, рейтингом, мерчом, уроками и вопросами по сайту. Если вопрос нестандартный, позову администратора.",
    keywords: ["привет", "здравств", "хай", "добрый", "начать", "старт"],
    phrases: ["добрый день", "добрый вечер", "что ты умеешь"],
    suggestions: ["Где расписание турниров?", "Я новичок, с чего начать?", "Хочу мерч", "Позвать администратора"],
  },
  {
    topic: "registration",
    title: "Регистрация на турнир",
    answer:
      "Запись идет через карточку турнира: открой «Расписание», выбери событие и нажми «Зарегистрироваться». Если ты уже записан, сайт покажет это вместо повторной отправки. Для отмены регистрации напиши «-» в чат турнира или администратору.",
    keywords: ["регистрация", "зарегистрироваться", "записаться", "запись", "плюс", "+", "отмена", "отменить", "участие", "участвовать"],
    phrases: ["как записаться", "записаться на турнир", "я уже зарегистрирован", "отменить регистрацию"],
    suggestions: ["Где расписание турниров?", "Что делать, если кнопка не работает?", "Куда приходит сообщение о записи?"],
  },
  {
    topic: "schedule",
    title: "Расписание",
    answer:
      "Ближайшие события лежат в разделе «Расписание». Там видны дата, время, площадка, формат и кнопка записи. Если турнира нет, значит он еще не опубликован или временно скрыт администратором.",
    keywords: ["расписание", "календарь", "когда", "турнир", "турниры", "события", "ивент", "ближайший", "дата", "время", "площадка", "бар"],
    phrases: ["где расписание", "когда турнир", "ближайший турнир", "во сколько"],
    suggestions: ["Как записаться на турнир?", "Я новичок, можно прийти?", "Где проходит турнир?"],
  },
  {
    topic: "rating",
    title: "Рейтинг",
    answer:
      "Рейтинг считается внутри клуба. Игрок стартует с 1500, дальше система Glicko-2 меняет рейтинг после партий. В начале доверие к рейтингу низкое, поэтому идет калибровка: чем больше сыгранных партий, тем точнее число.",
    keywords: ["рейтинг", "глико", "glicko", "очки", "калибровка", "rd", "лидерборд", "таблица", "прогноз", "история", "партии"],
    phrases: ["как считается рейтинг", "почему 1500", "что такое rd", "где лидерборд"],
    suggestions: ["Где мой профиль?", "Что такое калибровка?", "Где таблица лидеров?"],
  },
  {
    topic: "profile",
    title: "Профиль",
    answer:
      "Профиль нужен для ника, статуса, рейтинга и истории партий. Если открываешь сайт из Telegram, данные берутся из Telegram WebApp. В браузерной версии профиль доступен в разделе «Мой профиль». Если профиль не открывается или показывает не тот ник, лучше передать вопрос администратору.",
    keywords: ["профиль", "аккаунт", "ник", "никнейм", "username", "логин", "пароль", "статус", "данные", "telegram", "телеграм"],
    phrases: ["мой профиль", "не тот ник", "как поменять ник", "создать профиль"],
    suggestions: ["Как поменять ник?", "Почему не открывается профиль?", "Позвать администратора"],
  },
  {
    topic: "beginners",
    title: "Новичкам",
    answer:
      "Да, можно прийти без опыта турниров. Мы подскажем, куда садиться, как играть с часами, что такое швейцарка и как фиксировать результат. Главное - не бояться первого вечера: формат дружелюбный, а вопросы на месте нормальны.",
    keywords: ["новичок", "новичкам", "первый", "первый раз", "начинающий", "не умею", "швейцарка", "часы", "уровень", "страшно"],
    phrases: ["я новичок", "первый раз", "не знаю правила", "можно ли новичкам"],
    suggestions: ["Какие правила на турнире?", "Где расписание?", "Нужен ли рейтинг?"],
  },
  {
    topic: "rules",
    title: "Правила турниров",
    answer:
      "Играем честно, спокойно и без лишнего давления. Если ситуация спорная, сначала зовем организатора. Жесткого культа «тронул - ходи» нет: если момент не влияет на партию и не ломает уважение к сопернику, решаем по-человечески.",
    keywords: ["правила", "тронул", "ходи", "спор", "часы", "недушные", "нарушение", "судья", "организатор", "результат"],
    phrases: ["тронул ходи", "какие правила", "что делать спор"],
    suggestions: ["Я новичок, можно прийти?", "Как фиксировать результат?", "Позвать администратора"],
  },
  {
    topic: "lessons",
    title: "Уроки и лекции",
    answer:
      "По урокам и лекциям лучше оставить заявку: напиши уровень, цель и удобный контакт. Подойдут запросы вроде «хочу подтянуть дебют», «нужны занятия для ребенка», «хочу лекцию для компании» - администратор подберет формат.",
    keywords: ["урок", "уроки", "занятие", "занятия", "обучение", "тренер", "лекция", "лекции", "разбор", "дебют", "ребенок"],
    phrases: ["записаться на урок", "нужен тренер", "хочу лекцию", "обучение шахматам"],
    suggestions: ["Сколько стоят уроки?", "Хочу корпоративную лекцию", "Позвать администратора"],
  },
  {
    topic: "merch",
    title: "Мерч",
    answer:
      "Мерч находится в разделе «Мерч»: там карточки вещей, цена, размеры и описание. Чтобы заказать, открой нужную карточку и оставь заявку или напиши в Telegram Rep Chess KRD.",
    keywords: ["мерч", "футболка", "лонгслив", "одежда", "купить", "заказать", "размер", "цена", "стоимость", "доставка", "оплата"],
    phrases: ["хочу мерч", "как заказать", "какие размеры", "сколько стоит"],
    suggestions: ["Какие размеры есть?", "Как заказать мерч?", "Позвать администратора"],
  },
  {
    topic: "partners",
    title: "Для компаний и площадок",
    answer:
      "Rep Chess KRD может провести турнир, корпоратив, лекцию, обучение или шахматную активность для площадки. Для заявки напиши компанию, контакт, примерное количество людей и желаемый формат - это попадет администратору.",
    keywords: ["компания", "корпоратив", "партнерство", "партнер", "площадка", "бар", "фестиваль", "мероприятие", "провести", "организовать", "сотрудничество"],
    phrases: ["провести мероприятие", "для компании", "для площадки", "хочу партнерство"],
    suggestions: ["Хочу провести турнир", "Хочу лекцию для компании", "Позвать администратора"],
  },
  {
    topic: "club",
    title: "Клубный контент",
    answer:
      "Новости, лекции, правила, отзывы, доска почета и фотоотчеты живут в разделе «Клуб». Самые быстрые анонсы и обсуждения появляются в Telegram: @RepChessKRD.",
    keywords: ["новости", "фото", "галерея", "фотоотчет", "отзывы", "доска", "почета", "легенды", "контент", "клуб"],
    phrases: ["где фото", "новости клуба", "доска почета", "отзывы участников"],
    suggestions: ["Открыть Telegram", "Где ближайший турнир?", "Позвать администратора"],
  },
  {
    topic: "contacts",
    title: "Контакты",
    answer:
      "Главная точка связи - Telegram-канал @RepChessKRD: там анонсы, записи, переносы, фото и новости. Если нужен личный ответ, напиши контакт в этом чате, и я передам администратору.",
    keywords: ["контакт", "связаться", "телеграм", "telegram", "канал", "чат", "адрес", "куда писать", "ссылка"],
    phrases: ["как связаться", "где телеграм", "дай ссылку", "куда писать"],
    suggestions: ["Позвать администратора", "Где расписание?", "Хочу партнерство"],
  },
  {
    topic: "technical",
    title: "Проблема на сайте",
    answer:
      "Похоже на техническую проблему. Напиши, что именно не работает, на какой странице это происходит и какой телефон/Telegram использовать для ответа. Я передам это администратору.",
    keywords: ["ошибка", "не работает", "сломалось", "баг", "лагает", "зависло", "не открывается", "не грузится", "не нажимается", "проблема", "кнопка"],
    phrases: ["страница не открывается", "кнопка не работает", "ничего не отправляется", "не могу создать", "не могу записаться"],
    suggestions: ["Не открывается профиль", "Не работает регистрация", "Позвать администратора"],
    escalate: true,
  },
  {
    topic: "admin",
    title: "Администратор",
    answer:
      "Окей, передам администратору. Чтобы тебе быстрее помогли, одним сообщением напиши суть вопроса и контакт для ответа, если он не виден из Telegram.",
    keywords: ["админ", "администратор", "оператор", "человек", "менеджер", "поддержка", "помоги", "помощь", "срочно", "заявка"],
    phrases: ["позвать администратора", "нужен человек", "связаться с админом", "помощь оператора"],
    suggestions: ["Проблема с регистрацией", "Проблема с профилем", "Вопрос по турниру"],
    escalate: true,
  },
]

const UNKNOWN_ANSWER: HelpBotAnswer = {
  topic: "unknown",
  title: "Уточнение",
  answer:
    "Я не до конца понял вопрос. Могу подсказать по турнирам, записи, рейтингу, мерчу, урокам, правилам, профилю или передать сообщение администратору.",
  keywords: [],
  suggestions: COMMON_SUGGESTIONS,
}

function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/chess\.com/g, "chesscom")
    .replace(/[^\p{L}\p{N}+@._\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function stem(token: string) {
  if (token.length < 5 || token.includes("@") || /^[0-9+]+$/.test(token)) return token

  for (const ending of ENDINGS) {
    if (token.length - ending.length >= 4 && token.endsWith(ending)) {
      return token.slice(0, -ending.length)
    }
  }

  return token
}

function tokenize(input: string) {
  const normalized = normalize(input)
  const tokens = normalized
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token && !STOP_WORDS.has(token))

  const expanded = new Set<string>()
  for (const token of tokens) {
    expanded.add(token)
    expanded.add(stem(token))
  }

  return { normalized, tokens: Array.from(expanded) }
}

function keywordMatches(keyword: string, normalizedMessage: string, tokenSet: Set<string>) {
  const normalizedKeyword = normalize(keyword)
  if (!normalizedKeyword) return 0
  if (normalizedKeyword.includes(" ") && normalizedMessage.includes(normalizedKeyword)) return 2.4
  if (normalizedMessage.includes(normalizedKeyword) && normalizedKeyword.length >= 4) return 1.6

  const keywordTokens = tokenize(normalizedKeyword).tokens
  let score = 0
  for (const token of keywordTokens) {
    if (tokenSet.has(token)) score += 1.1
  }

  return score
}

function scoreAnswer(answer: HelpBotAnswer, message: string) {
  const { normalized, tokens } = tokenize(message)
  const tokenSet = new Set(tokens)
  let score = 0

  for (const phrase of answer.phrases || []) {
    const normalizedPhrase = normalize(phrase)
    if (normalizedPhrase && normalized.includes(normalizedPhrase)) score += 3.2
  }

  for (const keyword of answer.keywords) {
    score += keywordMatches(keyword, normalized, tokenSet)
  }

  return score
}

function hasQuestionShape(message: string) {
  const normalized = normalize(message)
  return /(\?|как|где|куда|когда|почему|зачем|сколько|можно|надо|нужно|что делать)/.test(normalized)
}

export function getHelpBotReply(message: string): HelpBotResult {
  const normalized = normalize(message)
  const words = tokenize(message).tokens.length

  const scored = HELP_BOT_ANSWERS
    .map((answer) => ({ answer, score: scoreAnswer(answer, normalized) }))
    .sort((a, b) => b.score - a.score)

  const best = scored[0]
  const second = scored[1]
  const scoreGap = best && second ? best.score - second.score : 0
  const rawConfidence = best ? Math.min(1, best.score / Math.max(3.8, words * 0.82)) : 0
  const confidence = best && best.score > 0 ? Number(rawConfidence.toFixed(2)) : 0

  if (!best || best.score < 1.1) {
    const shouldEscalate = words > 4 && hasQuestionShape(message)
    return {
      answer: UNKNOWN_ANSWER,
      confidence: 0,
      suggestions: UNKNOWN_ANSWER.suggestions || COMMON_SUGGESTIONS,
      shouldEscalate,
    }
  }

  const ambiguous = confidence < 0.46 || (scoreGap < 0.8 && best.score < 3.4)
  const shouldEscalate = !!best.answer.escalate || (ambiguous && words > 5 && hasQuestionShape(message))

  return {
    answer: best.answer,
    confidence,
    suggestions: best.answer.suggestions || COMMON_SUGGESTIONS,
    shouldEscalate,
  }
}
