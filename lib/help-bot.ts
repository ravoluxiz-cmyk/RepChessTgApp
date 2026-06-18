export type HelpBotTopic = "registration" | "schedule" | "rating" | "lessons" | "merch" | "partners" | "rules" | "admin"

export interface HelpBotAnswer {
  topic: HelpBotTopic
  title: string
  answer: string
  keywords: string[]
}

export const HELP_BOT_ANSWERS: HelpBotAnswer[] = [
  {
    topic: "registration",
    title: "Регистрация на турнир",
    answer: "Откройте «Расписание турниров», выберите карточку турнира и нажмите «Зарегистрироваться». Если вы уже записаны, кнопка покажет статус регистрации.",
    keywords: ["регистрац", "запис", "турнир", "участ", "плюс", "+"],
  },
  {
    topic: "schedule",
    title: "Расписание",
    answer: "Актуальные турниры находятся в разделе «Расписание турниров». Если карточки нет, организатор мог временно скрыть событие или еще не опубликовать его.",
    keywords: ["распис", "календар", "когда", "где", "мероприят", "ивент"],
  },
  {
    topic: "rating",
    title: "Рейтинг",
    answer: "Все игроки стартуют с рейтинга 1500 и проходят калибровку Glicko-2. Чем больше партий сыграно, тем точнее рейтинг.",
    keywords: ["рейтинг", "glicko", "глико", "очки", "калибр"],
  },
  {
    topic: "lessons",
    title: "Уроки",
    answer: "Для записи на занятия откройте «Запись на урок», оставьте контакт и комментарий. Администратор увидит заявку и свяжется с вами.",
    keywords: ["урок", "занят", "обуч", "тренер", "лекц"],
  },
  {
    topic: "merch",
    title: "Мерч",
    answer: "Мерч доступен в разделе «Купить мерч». Выберите карточку товара и оставьте заявку/свяжитесь с клубом по указанному каналу.",
    keywords: ["мерч", "футбол", "купить", "стоим", "цена", "заказ"],
  },
  {
    topic: "partners",
    title: "Партнерство",
    answer: "Для компаний и площадок есть раздел «Для компаний». Там можно оставить заявку на турнир, корпоратив, лекцию, обучение или фестивальный формат.",
    keywords: ["компан", "партнер", "площад", "корпоратив", "сотруднич"],
  },
  {
    topic: "rules",
    title: "Правила клуба",
    answer: "Правила и ценности клуба лежат в разделе «Клуб». Коротко: играем честно, уважительно и в недушные шахматы.",
    keywords: ["правил", "тронул", "ходи", "спор", "ценност", "комьюнити"],
  },
  {
    topic: "admin",
    title: "Связь с администратором",
    answer: "Если вопрос нестандартный, нажмите «Позвать администратора» в чате. Заявка попадет в админ-панель.",
    keywords: ["админ", "оператор", "человек", "помощ", "поддерж"],
  },
]

export function getHelpBotReply(message: string): { answer: HelpBotAnswer | null; confidence: number } {
  const text = message.toLowerCase()
  const scored = HELP_BOT_ANSWERS.map((answer) => ({
    answer,
    score: answer.keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score)

  const best = scored[0]
  if (!best || best.score === 0) {
    return { answer: null, confidence: 0 }
  }

  return { answer: best.answer, confidence: Math.min(1, best.score / 2) }
}
