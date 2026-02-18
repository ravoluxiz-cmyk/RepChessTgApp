/**
 * Тай-брейкеры для швейцарской системы (FIDE-compliant)
 *
 * Реализовано по правилам FIDE C.07 (2024):
 * - Buchholz: сумма очков оппонентов (с виртуальным оппонентом для bye)
 * - Buchholz Cut-1: Buchholz минус самый низкий оппонент
 * - Median Buchholz: Buchholz минус самый высокий и самый низкий
 * - Direct Encounter (Head-to-Head): личные встречи
 *
 * Особенности:
 * - Bye: виртуальный оппонент по формуле Svon = SPR + (1-SfPR) + 0.5*(n-R)
 * - Pairing bye (1pt): считается как 0.5pt для Buchholz оппонентов
 * - Forfeit: считается как 0.5 (ничья) для Buchholz оппонентов
 */

import { supabaseAdmin } from './supabase'

// ===== ТИПЫ =====

interface PlayerStanding {
  participantId: number
  /** Реальные набранные очки */
  score: number
  /** Скорректированные очки для Buchholz расчёта оппонентам (bye 1pt→0.5, forfeit→0.5) */
  adjustedScore: number
  opponents: number[] // participantId оппонентов по раундам
  results: ('win' | 'loss' | 'draw' | 'bye' | 'forfeit_win' | 'forfeit_loss')[]
  /** Фактические очки, полученные в каждом раунде (из БД) */
  matchScores: number[]
  /** Номера раундов для каждого результата */
  roundNumbers: number[]
  /** Виртуальные очки оппонентов для раундов с bye */
  virtualOpponentScores: number[]
  tiebreakers: {
    buchholz?: number
    buchholzCut1?: number
    medianBuchholz?: number
    sonnebornBerger?: number
    numberOfWins?: number
    headToHead?: number
  }
}

interface MatchData {
  white_participant_id?: number | null
  black_participant_id?: number | null
  score_white?: number | null
  score_black?: number | null
  result?: string | null
  round_number: number
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

/**
 * Получает все матчи турнира с результатами (batch-запрос)
 */
async function getAllTournamentMatches(tournamentId: number): Promise<MatchData[]> {
  const { data: rounds } = await supabaseAdmin
    .from('rounds')
    .select('id, number')
    .eq('tournament_id', tournamentId)
    .order('number', { ascending: true })

  if (!rounds || rounds.length === 0) return []

  const roundIds = rounds.map((r: { id: number }) => r.id)
  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select('white_participant_id, black_participant_id, score_white, score_black, result, round_id')
    .in('round_id', roundIds)

  if (!matches) return []

  // Создаём маппинг round_id → round_number
  const roundMap = new Map<number, number>()
  for (const r of rounds) {
    roundMap.set(r.id, r.number)
  }

  return (matches as Array<{
    white_participant_id: number | null
    black_participant_id: number | null
    score_white: number | null
    score_black: number | null
    result: string | null
    round_id: number
  }>).map((m) => ({
    white_participant_id: m.white_participant_id,
    black_participant_id: m.black_participant_id,
    score_white: m.score_white,
    score_black: m.score_black,
    result: m.result,
    round_number: roundMap.get(m.round_id) || 0,
  }))
}

/**
 * Строит standings (турнирную таблицу) со всеми данными для тай-брейков
 */
async function buildStandings(tournamentId: number): Promise<Map<number, PlayerStanding>> {
  const standings = new Map<number, PlayerStanding>()

  const { data: participants } = await supabaseAdmin
    .from('tournament_participants')
    .select('id')
    .eq('tournament_id', tournamentId)

  if (!participants) return standings

  for (const p of participants) {
    standings.set(p.id!, {
      participantId: p.id!,
      score: 0,
      adjustedScore: 0,
      opponents: [],
      results: [],
      matchScores: [],
      roundNumbers: [],
      virtualOpponentScores: [],
      tiebreakers: {}
    })
  }

  const matches = await getAllTournamentMatches(tournamentId)

  // Определяем общее кол-во сыгранных раундов
  const totalRounds = matches.reduce((max, m) => Math.max(max, m.round_number), 0)

  // Первый проход: накапливаем score, opponents, results
  for (const match of matches) {
    const whiteId = match.white_participant_id
    const blackId = match.black_participant_id
    const result = match.result

    if (whiteId) {
      const ws = standings.get(whiteId)
      if (ws) {
        ws.score += match.score_white || 0
        ws.roundNumbers.push(match.round_number)

        if (blackId) {
          ws.opponents.push(blackId)
          if (result === 'white') {
            ws.results.push('win')
            ws.adjustedScore += match.score_white || 0
          } else if (result === 'black') {
            ws.results.push('loss')
            ws.adjustedScore += match.score_white || 0
          } else if (result === 'draw') {
            ws.results.push('draw')
            ws.adjustedScore += match.score_white || 0
          } else if (result === 'forfeit_black') {
            ws.results.push('forfeit_win')
            ws.adjustedScore += 0.5
          } else if (result === 'forfeit_white') {
            ws.results.push('forfeit_loss')
            ws.adjustedScore += 0.5
          } else {
            ws.results.push('draw')
            ws.adjustedScore += match.score_white || 0
          }
          ws.matchScores.push(match.score_white || 0)
        } else {
          // Bye — виртуальный оппонент
          ws.results.push('bye')
          const byePoints = match.score_white || 0
          ws.adjustedScore += byePoints >= 1 ? 0.5 : byePoints
          ws.matchScores.push(byePoints)
        }
      }
    }

    if (blackId) {
      const bs = standings.get(blackId)
      if (bs) {
        bs.score += match.score_black || 0
        bs.roundNumbers.push(match.round_number)

        if (whiteId) {
          bs.opponents.push(whiteId)
          if (result === 'black') {
            bs.results.push('win')
            bs.adjustedScore += match.score_black || 0
          } else if (result === 'white') {
            bs.results.push('loss')
            bs.adjustedScore += match.score_black || 0
          } else if (result === 'draw') {
            bs.results.push('draw')
            bs.adjustedScore += match.score_black || 0
          } else if (result === 'forfeit_white') {
            bs.results.push('forfeit_win')
            bs.adjustedScore += 0.5
          } else if (result === 'forfeit_black') {
            bs.results.push('forfeit_loss')
            bs.adjustedScore += 0.5
          } else {
            bs.results.push('draw')
            bs.adjustedScore += match.score_black || 0
          }
          bs.matchScores.push(match.score_black || 0)
        }
      }
    }
  }

  // Второй проход: вычисляем виртуальных оппонентов для bye
  // Формула FIDE: Svon = SPR + (1 - SfPR) + 0.5 * (n - R)
  // SPR = очки игрока перед раундом R
  // SfPR = очки forfeit-а в раунде R (фактические очки bye)
  // n = всего раундов, R = номер раунда bye
  for (const [, player] of Array.from(standings.entries())) {
    const sortedIndices = player.roundNumbers
      .map((rn, i) => ({ rn, i }))
      .sort((a, b) => a.rn - b.rn)

    let runningScore = 0
    for (const { rn, i } of sortedIndices) {
      const res = player.results[i]
      const sBeforeRound = runningScore

      // Используем фактические очки из матча
      const roundScore = player.matchScores[i] || 0
      runningScore += roundScore

      if (res === 'bye') {
        const SfPR = roundScore // очки за bye-раунд
        const Svon = sBeforeRound + (1 - SfPR) + 0.5 * (totalRounds - rn)
        player.virtualOpponentScores.push(Svon)
      }
    }
  }

  return standings
}

// ===== ТАЙ-БРЕЙКЕРЫ =====

/**
 * Собирает очки оппонентов игрока для Buchholz (с виртуальным оппонентом для bye)
 * Используется adjustedScore для реальных оппонентов (учёт forfeit → 0.5, bye → 0.5)
 */
function getOpponentScoresForBuchholz(
  player: PlayerStanding,
  standings: Map<number, PlayerStanding>
): number[] {
  const scores: number[] = []
  let virtualIdx = 0

  for (let i = 0; i < player.results.length; i++) {
    const res = player.results[i]

    if (res === 'bye') {
      // Используем виртуального оппонента
      if (virtualIdx < player.virtualOpponentScores.length) {
        scores.push(player.virtualOpponentScores[virtualIdx])
        virtualIdx++
      }
    } else {
      // Реальный оппонент — используем его adjustedScore
      const opponentId = player.opponents.shift()
      if (opponentId !== undefined) {
        const opponent = standings.get(opponentId)
        if (opponent) {
          scores.push(opponent.adjustedScore)
        }
      }
    }
  }

  // Если opponents не пуст (не все итерированы), берём остаток
  // Это fallback — в нормальном случае opponents уже пуст
  return scores
}

/**
 * Собирает очки оппонентов (без мутации opponents массива)
 */
function collectOpponentScores(
  player: PlayerStanding,
  standings: Map<number, PlayerStanding>
): number[] {
  const scores: number[] = []
  let opponentIdx = 0
  let virtualIdx = 0

  for (let i = 0; i < player.results.length; i++) {
    const res = player.results[i]

    if (res === 'bye') {
      if (virtualIdx < player.virtualOpponentScores.length) {
        scores.push(player.virtualOpponentScores[virtualIdx])
        virtualIdx++
      }
    } else {
      if (opponentIdx < player.opponents.length) {
        const opponentId = player.opponents[opponentIdx]
        opponentIdx++
        const opponent = standings.get(opponentId)
        if (opponent) {
          scores.push(opponent.adjustedScore)
        }
      }
    }
  }

  return scores
}

/**
 * Head-to-Head / Direct Encounter (Личная встреча)
 * FIDE C.07: Если два игрока играли друг с другом, результат их встречи
 * Для группы: мини-таблица среди всех tied, кто лидирует
 *
 * Возвращает:
 * - положительное число → player1 лучше
 * - 0 → равны / не играли
 * - отрицательное число → player2 лучше
 */
function calculateHeadToHead(
  player1: PlayerStanding,
  player2: PlayerStanding
): number {
  // Ищем все матчи где player1 играл с player2
  let score1 = 0
  let score2 = 0
  let gamesPlayed = 0

  for (let i = 0; i < player1.opponents.length; i++) {
    if (player1.opponents[i] === player2.participantId) {
      gamesPlayed++
      const res = player1.results[i]
      if (res === 'win' || res === 'forfeit_win') score1 += 1
      else if (res === 'draw') { score1 += 0.5; score2 += 0.5 }
      else if (res === 'loss' || res === 'forfeit_loss') score2 += 1
    }
  }

  if (gamesPlayed === 0) return 0
  if (score1 > score2) return 1
  if (score1 < score2) return -1
  return 0
}

/**
 * Buchholz (Бухгольц) — FIDE C.07 §13.4.1
 * Сумма очков всех оппонентов (с виртуальным оппонентом для bye)
 */
function calculateBuchholz(
  player: PlayerStanding,
  standings: Map<number, PlayerStanding>
): number {
  const scores = collectOpponentScores(player, standings)
  return scores.reduce((sum, s) => sum + s, 0)
}

/**
 * Buchholz Cut-1 (Усечённый Бухгольц) — FIDE C.07 §13.4.4
 * Buchholz минус самый слабый оппонент
 */
function calculateBuchholzCut1(
  player: PlayerStanding,
  standings: Map<number, PlayerStanding>
): number {
  const scores = collectOpponentScores(player, standings)
  if (scores.length <= 1) return scores.reduce((sum, s) => sum + s, 0)

  const minScore = Math.min(...scores)
  const sum = scores.reduce((a, b) => a + b, 0)
  return sum - minScore
}

/**
 * Median Buchholz (Медианный Бухгольц) — FIDE C.07 §13.4.2
 * Buchholz минус самый высокий И самый слабый оппонент
 */
function calculateMedianBuchholz(
  player: PlayerStanding,
  standings: Map<number, PlayerStanding>
): number {
  const scores = collectOpponentScores(player, standings)
  if (scores.length <= 2) return scores.reduce((sum, s) => sum + s, 0)

  const sorted = [...scores].sort((a, b) => a - b)
  // Убираем первый (минимум) и последний (максимум)
  const median = sorted.slice(1, -1)
  return median.reduce((sum, s) => sum + s, 0)
}

/**
 * Sonneborn-Berger (SB) — FIDE / Wikipedia
 * Сумма очков побеждённых оппонентов + половина очков оппонентов, с которыми ничья
 * Используется adjustedScore для учёта bye/forfeit корректировок
 */
function calculateSonnebornBerger(
  player: PlayerStanding,
  standings: Map<number, PlayerStanding>
): number {
  let sum = 0
  for (let i = 0; i < player.opponents.length; i++) {
    const opponentId = player.opponents[i]
    const opponent = standings.get(opponentId)
    if (!opponent) continue

    const res = player.results[i]
    if (res === 'win' || res === 'forfeit_win') {
      sum += opponent.adjustedScore
    } else if (res === 'draw') {
      sum += opponent.adjustedScore * 0.5
    }
    // loss / forfeit_loss = 0
  }
  return sum
}

/**
 * Number of Wins (Количество побед) — Wikipedia / FIDE
 * Простой подсчёт побед (включая forfeit wins, исключая byes)
 * Поощряет агрессивную игру
 */
function calculateNumberOfWins(player: PlayerStanding): number {
  let wins = 0
  for (const res of player.results) {
    if (res === 'win' || res === 'forfeit_win') wins++
  }
  return wins
}

// ===== ГЛАВНЫЕ ФУНКЦИИ =====

/**
 * Вычисляет все тай-брейкеры для всех участников турнира
 */
export async function calculateAllTiebreakers(tournamentId: number) {
  const standings = await buildStandings(tournamentId)

  for (const [, player] of Array.from(standings.entries())) {
    player.tiebreakers.buchholz = calculateBuchholz(player, standings)
    player.tiebreakers.buchholzCut1 = calculateBuchholzCut1(player, standings)
    player.tiebreakers.medianBuchholz = calculateMedianBuchholz(player, standings)
    player.tiebreakers.sonnebornBerger = calculateSonnebornBerger(player, standings)
    player.tiebreakers.numberOfWins = calculateNumberOfWins(player)
  }

  return standings
}

/**
 * Сравнивает двух игроков с использованием тай-брейкеров
 *
 * @param player1 Первый игрок
 * @param player2 Второй игрок
 * @param tiebreakers Список тай-брейкеров через запятую
 *                    Варианты: head_to_head, buchholz, buchholz_cut1, median_buchholz,
 *                             sonneborn_berger, number_of_wins
 * @param standings Полная таблица standings
 * @returns Положительное число если player2 лучше, отрицательное если player1 лучше
 *          (для sort: a - b → ascending)
 */
export function comparePlayersWithTiebreakers(
  player1: PlayerStanding,
  player2: PlayerStanding,
  tiebreakers: string,
  standings: Map<number, PlayerStanding>
): number {
  // Сначала сравниваем по основным очкам
  if (player1.score !== player2.score) {
    return player2.score - player1.score // Больше очков = лучше → player2.score - player1.score > 0 → player1 после player2
  }

  const tiebreakerList = tiebreakers
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean)

  for (const tiebreaker of tiebreakerList) {
    switch (tiebreaker) {
      case 'head_to_head':
      case 'head-to-head':
      case 'h2h':
      case 'direct_encounter': {
        const h2h = calculateHeadToHead(player1, player2)
        if (h2h !== 0) return -h2h // h2h >0 → player1 лучше → return negative
        break
      }

      case 'buchholz': {
        const bh1 = player1.tiebreakers.buchholz ?? calculateBuchholz(player1, standings)
        const bh2 = player2.tiebreakers.buchholz ?? calculateBuchholz(player2, standings)
        if (Math.abs(bh1 - bh2) > 0.001) return bh2 - bh1 // Больше = лучше
        break
      }

      case 'buchholz_cut1':
      case 'buchholz-cut1':
      case 'cut1': {
        const bhc1 = player1.tiebreakers.buchholzCut1 ?? calculateBuchholzCut1(player1, standings)
        const bhc2 = player2.tiebreakers.buchholzCut1 ?? calculateBuchholzCut1(player2, standings)
        if (Math.abs(bhc1 - bhc2) > 0.001) return bhc2 - bhc1
        break
      }

      case 'median_buchholz':
      case 'median-buchholz':
      case 'median': {
        const mb1 = player1.tiebreakers.medianBuchholz ?? calculateMedianBuchholz(player1, standings)
        const mb2 = player2.tiebreakers.medianBuchholz ?? calculateMedianBuchholz(player2, standings)
        if (Math.abs(mb1 - mb2) > 0.001) return mb2 - mb1
        break
      }

      case 'sonneborn_berger':
      case 'sonneborn-berger':
      case 'sb': {
        const sb1 = player1.tiebreakers.sonnebornBerger ?? calculateSonnebornBerger(player1, standings)
        const sb2 = player2.tiebreakers.sonnebornBerger ?? calculateSonnebornBerger(player2, standings)
        if (Math.abs(sb1 - sb2) > 0.001) return sb2 - sb1
        break
      }

      case 'number_of_wins':
      case 'wins': {
        const w1 = player1.tiebreakers.numberOfWins ?? calculateNumberOfWins(player1)
        const w2 = player2.tiebreakers.numberOfWins ?? calculateNumberOfWins(player2)
        if (w1 !== w2) return w2 - w1 // Больше побед = лучше
        break
      }
    }
  }

  return 0
}

/**
 * Сортирует участников турнира с учетом тай-брейкеров
 */
export async function getSortedStandings(tournamentId: number): Promise<PlayerStanding[]> {
  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('tiebreakers')
    .eq('id', tournamentId)
    .single()

  const tiebreakerString = tournament?.tiebreakers || 'buchholz,buchholz_cut1'

  const standings = await calculateAllTiebreakers(tournamentId)
  const standingsArray = Array.from(standings.values())

  standingsArray.sort((a, b) => comparePlayersWithTiebreakers(a, b, tiebreakerString, standings))

  return standingsArray
}

/**
 * Получает место игрока в турнире
 */
export async function getPlayerRank(tournamentId: number, participantId: number): Promise<number> {
  const sorted = await getSortedStandings(tournamentId)
  const index = sorted.findIndex(s => s.participantId === participantId)
  return index === -1 ? sorted.length + 1 : index + 1
}
