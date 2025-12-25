/**
 * Тай-брейкеры для швейцарской системы
 *
 * Используются для определения победителей при равных очках
 */

import { supabaseAdmin } from './supabase'

// ===== ТИПЫ =====

interface PlayerStanding {
  participantId: number
  score: number
  opponents: number[] // participantId оппонентов
  results: ('win' | 'loss' | 'draw' | 'bye')[] // Результаты по порядку раундов
  tiebreakers: {
    buchholz?: number
    buchholzCut1?: number
    headToHead?: number
  }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

/**
 * Получает все матчи турнира с результатами
 */
async function getAllTournamentMatches(tournamentId: number) {
  // Получаем все раунды
  const { data: rounds } = await supabaseAdmin
    .from('rounds')
    .select('id, number')
    .eq('tournament_id', tournamentId)
    .order('number', { ascending: true })

  if (!rounds) return []

  // Получаем все матчи для всех раундов
  const allMatches: Array<Record<string, unknown> & { round_number: number }> = []
  for (const round of rounds) {
    const { data: matches } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('round_id', round.id)

    if (matches) {
      allMatches.push(...matches.map(m => ({ ...m, round_number: round.number })))
    }
  }

  return allMatches
}

/**
 * Строит standings (турнирную таблицу) со всеми данными
 */
async function buildStandings(tournamentId: number): Promise<Map<number, PlayerStanding>> {
  const standings = new Map<number, PlayerStanding>()

  // Получаем участников
  const { data: participants } = await supabaseAdmin
    .from('tournament_participants')
    .select('id')
    .eq('tournament_id', tournamentId)

  if (!participants) return standings

  // Инициализируем standings
  for (const p of participants) {
    standings.set(p.id!, {
      participantId: p.id!,
      score: 0,
      opponents: [],
      results: [],
      tiebreakers: {}
    })
  }

  // Получаем все матчи
  const matches = await getAllTournamentMatches(tournamentId)

  // Обрабатываем матчи
  for (const match of matches) {
    const whiteId = match.white_participant_id
    const blackId = match.black_participant_id

    if (whiteId) {
      const whiteStanding = standings.get(whiteId)
      if (whiteStanding) {
        whiteStanding.score += match.score_white || 0

        if (blackId) {
          whiteStanding.opponents.push(blackId)
          // Определяем результат
          if (match.result === 'white' || match.result === 'forfeit_black') {
            whiteStanding.results.push('win')
          } else if (match.result === 'black' || match.result === 'forfeit_white') {
            whiteStanding.results.push('loss')
          } else if (match.result === 'draw') {
            whiteStanding.results.push('draw')
          }
        } else {
          whiteStanding.results.push('bye')
        }
      }
    }

    if (blackId) {
      const blackStanding = standings.get(blackId)
      if (blackStanding) {
        blackStanding.score += match.score_black || 0

        if (whiteId) {
          blackStanding.opponents.push(whiteId)
          // Определяем результат
          if (match.result === 'black' || match.result === 'forfeit_white') {
            blackStanding.results.push('win')
          } else if (match.result === 'white' || match.result === 'forfeit_black') {
            blackStanding.results.push('loss')
          } else if (match.result === 'draw') {
            blackStanding.results.push('draw')
          }
        }
      }
    }
  }

  return standings
}

// ===== ТАЙ-БРЕЙКЕРЫ =====

/**
 * Head-to-Head (Личная встреча)
 *
 * Если два игрока играли друг с другом, возвращает результат их встречи
 * Возвращает:
 * - 1 если player1 выиграл у player2
 * - 0 если ничья или не играли
 * - -1 если player1 проиграл player2
 */
function calculateHeadToHead(
  player1: PlayerStanding,
  player2: PlayerStanding
): number {
  // Ищем индекс где player1 играл с player2
  const index = player1.opponents.indexOf(player2.participantId)
  if (index === -1) return 0 // Не играли

  const result = player1.results[index]
  if (result === 'win') return 1
  if (result === 'loss') return -1
  return 0 // draw or bye
}

/**
 * Buchholz (Бухгольц)
 *
 * Сумма очков всех оппонентов игрока
 * Bye не учитывается в подсчете
 */
function calculateBuchholz(
  player: PlayerStanding,
  standings: Map<number, PlayerStanding>
): number {
  let sum = 0
  for (const opponentId of player.opponents) {
    const opponent = standings.get(opponentId)
    if (opponent) {
      sum += opponent.score
    }
  }
  return sum
}

/**
 * Buchholz Cut-1 (Усеченный Бухгольц)
 *
 * Сумма очков всех оппонентов, МИНУС самый слабый оппонент
 * Используется для уменьшения влияния случайности
 */
function calculateBuchholzCut1(
  player: PlayerStanding,
  standings: Map<number, PlayerStanding>
): number {
  if (player.opponents.length === 0) return 0
  if (player.opponents.length === 1) {
    // Если только один оппонент, возвращаем его очки (не вычитаем)
    const opponent = standings.get(player.opponents[0])
    return opponent ? opponent.score : 0
  }

  // Собираем очки всех оппонентов
  const opponentScores: number[] = []
  for (const opponentId of player.opponents) {
    const opponent = standings.get(opponentId)
    if (opponent) {
      opponentScores.push(opponent.score)
    }
  }

  if (opponentScores.length === 0) return 0

  // Находим минимум
  const minScore = Math.min(...opponentScores)

  // Сумма всех минус минимум
  const sum = opponentScores.reduce((a, b) => a + b, 0)
  return sum - minScore
}

// ===== ГЛАВНЫЕ ФУНКЦИИ =====

/**
 * Вычисляет все тай-брейкеры для всех участников турнира
 */
export async function calculateAllTiebreakers(tournamentId: number) {
  const standings = await buildStandings(tournamentId)

  // Вычисляем тай-брейкеры для каждого игрока
  for (const [, player] of Array.from(standings.entries())) {
    player.tiebreakers.buchholz = calculateBuchholz(player, standings)
    player.tiebreakers.buchholzCut1 = calculateBuchholzCut1(player, standings)
  }

  return standings
}

/**
 * Сравнивает двух игроков с использованием тай-брейкеров
 *
 * @param player1 Первый игрок
 * @param player2 Второй игрок
 * @param tiebreakers Список тай-брейкеров в порядке приоритета (строка через запятую)
 *                    Например: "head_to_head,buchholz,buchholz_cut1"
 * @param standings Полная таблица standings для расчета тай-брейкеров
 * @returns Положительное число если player1 лучше, отрицательное если player2 лучше, 0 если равны
 */
export function comparePlayersWithTiebreakers(
  player1: PlayerStanding,
  player2: PlayerStanding,
  tiebreakers: string,
  standings: Map<number, PlayerStanding>
): number {
  // Сначала сравниваем по основным очкам
  if (player1.score !== player2.score) {
    return player2.score - player1.score // Больше очков = лучше
  }

  // Парсим строку тай-брейкеров
  const tiebreakerList = tiebreakers
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean)

  // Применяем тай-брейкеры по порядку
  for (const tiebreaker of tiebreakerList) {
    let result = 0

    switch (tiebreaker) {
      case 'head_to_head':
      case 'head-to-head':
      case 'h2h':
        result = calculateHeadToHead(player1, player2)
        if (result !== 0) return result
        break

      case 'buchholz':
        const bh1 = player1.tiebreakers.buchholz ?? calculateBuchholz(player1, standings)
        const bh2 = player2.tiebreakers.buchholz ?? calculateBuchholz(player2, standings)
        result = bh1 - bh2 // Больше = лучше
        if (Math.abs(result) > 0.001) return result
        break

      case 'buchholz_cut1':
      case 'buchholz-cut1':
      case 'cut1':
        const bhc1 = player1.tiebreakers.buchholzCut1 ?? calculateBuchholzCut1(player1, standings)
        const bhc2 = player2.tiebreakers.buchholzCut1 ?? calculateBuchholzCut1(player2, standings)
        result = bhc1 - bhc2 // Больше = лучше
        if (Math.abs(result) > 0.001) return result
        break
    }
  }

  // Если все тай-брейкеры равны, возвращаем 0
  return 0
}

/**
 * Сортирует участников турнира с учетом тай-брейкеров
 *
 * @param tournamentId ID турнира
 * @returns Отсортированный массив standings (от лучшего к худшему)
 */
export async function getSortedStandings(tournamentId: number): Promise<PlayerStanding[]> {
  // Получаем турнир для определения тай-брейкеров
  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('tiebreakers')
    .eq('id', tournamentId)
    .single()

  const tiebreakerString = tournament?.tiebreakers || 'buchholz,buchholz_cut1'

  // Вычисляем standings с тай-брейкерами
  const standings = await calculateAllTiebreakers(tournamentId)

  // Преобразуем Map в массив
  const standingsArray = Array.from(standings.values())

  // Сортируем
  standingsArray.sort((a, b) => comparePlayersWithTiebreakers(a, b, tiebreakerString, standings))

  return standingsArray
}

/**
 * Получает место игрока в турнире
 *
 * @param tournamentId ID турнира
 * @param participantId ID участника
 * @returns Место (1 = первое место)
 */
export async function getPlayerRank(tournamentId: number, participantId: number): Promise<number> {
  const sorted = await getSortedStandings(tournamentId)
  const index = sorted.findIndex(s => s.participantId === participantId)
  return index === -1 ? sorted.length + 1 : index + 1
}
