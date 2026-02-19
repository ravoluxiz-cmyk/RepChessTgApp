/**
 * Swiss Pairing System - FIDE Dutch System
 *
 * Полноценная реализация швейцарской системы паросочетания
 * согласно правилам FIDE Dutch System (2017)
 */

import { supabaseAdmin } from './supabase'
import type { Match } from './db'

// ===== ТИПЫ =====

interface PlayerData {
  participantId: number
  userId: number
  nickname: string
  rating: number
  score: number
  buchholz: number
  rounds: RoundHistory[]
}

interface RoundHistory {
  opponent: number // participantId оппонента
  color: 'w' | 'b' | null // w=white, b=black, null=bye
  result: 'win' | 'loss' | 'draw' | 'bye'
}

interface Pairing {
  white: number // participantId
  black: number | null // participantId или null для bye
  boardNo: number
}

// ===== КЛАСС ИГРОКА =====

class Player {
  id: number // participantId
  nickname: string
  rating: number
  score: number
  buchholz: number
  rounds: RoundHistory[] = []

  // Статистика цветов
  whiteCount = 0
  blackCount = 0
  lastColor: 'w' | 'b' | null = null

  // Цветовое предпочтение по FIDE
  // +2 = MUST play white (absolute)
  // +1 = PREFERS white (strong)
  //  0 = no preference
  // -1 = PREFERS black (strong)
  // -2 = MUST play black (absolute)
  colorPreference = 0

  // История оппонентов
  opponents = new Set<number>()

  // Bye история
  hadBye = false

  // Флаги для текущего раунда
  paired = false
  floated = false

  constructor(data: PlayerData) {
    this.id = data.participantId
    this.nickname = data.nickname
    this.rating = data.rating
    this.score = data.score
    this.buchholz = data.buchholz
    this.rounds = data.rounds

    // Инициализация статистики
    for (const round of this.rounds) {
      if (round.color === 'w') {
        this.whiteCount++
        this.lastColor = 'w'
      } else if (round.color === 'b') {
        this.blackCount++
        this.lastColor = 'b'
      } else {
        this.hadBye = true
        this.lastColor = null
      }

      if (round.opponent) {
        this.opponents.add(round.opponent)
      }
    }

    this.updateColorPreference()
  }

  /**
   * Обновляет цветовое предпочтение согласно FIDE Dutch System
   */
  updateColorPreference() {
    const diff = this.whiteCount - this.blackCount

    // Проверяем последние 2 раунда на одинаковый цвет
    const lastTwoSameColor = this.rounds.length >= 2 &&
      this.rounds[this.rounds.length - 1].color === this.rounds[this.rounds.length - 2].color &&
      this.rounds[this.rounds.length - 1].color !== null

    const lastTwoColor = lastTwoSameColor ? this.rounds[this.rounds.length - 1].color : null

    // ABSOLUTE COLOR PREFERENCE (±2)
    if (diff > 1 || lastTwoColor === 'w') {
      this.colorPreference = -2 // MUST play black
    } else if (diff < -1 || lastTwoColor === 'b') {
      this.colorPreference = 2 // MUST play white
    }
    // STRONG COLOR PREFERENCE (±1)
    else if (diff === 1) {
      this.colorPreference = -1 // PREFERS black
    } else if (diff === -1) {
      this.colorPreference = 1 // PREFERS white
    }
    // NO PREFERENCE - смотрим на последний цвет
    else if (diff === 0) {
      if (this.lastColor === 'w') {
        this.colorPreference = -1 // Mild preference for black
      } else if (this.lastColor === 'b') {
        this.colorPreference = 1 // Mild preference for white
      } else {
        this.colorPreference = 0
      }
    } else {
      this.colorPreference = 0
    }
  }

  /**
   * Может ли играть с другим игроком (не повторная встреча)
   */
  canPairWith(other: Player): boolean {
    return !this.opponents.has(other.id)
  }

  /**
   * Вычисляет штраф за назначение цвета
   */
  getColorPenalty(color: 'w' | 'b'): number {
    if (color === 'w') {
      if (this.colorPreference === -2) return 1000 // MUST play black
      if (this.colorPreference === -1) return 100  // PREFERS black
      if (this.colorPreference === 0) return 1     // Neutral
      if (this.colorPreference === 1) return 0     // PREFERS white
      if (this.colorPreference === 2) return 0     // MUST play white
    } else {
      if (this.colorPreference === 2) return 1000  // MUST play white
      if (this.colorPreference === 1) return 100   // PREFERS white
      if (this.colorPreference === 0) return 1     // Neutral
      if (this.colorPreference === -1) return 0    // PREFERS black
      if (this.colorPreference === -2) return 0    // MUST play black
    }
    return 0
  }

  /**
   * Определяет оптимальную расстановку цветов с другим игроком
   */
  getColorArrangement(other: Player): { white: Player; black: Player; penalty: number } {
    const penalty1 = this.getColorPenalty('w') + other.getColorPenalty('b')
    const penalty2 = this.getColorPenalty('b') + other.getColorPenalty('w')

    if (penalty1 < penalty2) {
      return { white: this, black: other, penalty: penalty1 }
    } else if (penalty2 < penalty1) {
      return { white: other, black: this, penalty: penalty2 }
    } else {
      // Равные штрафы - выбираем по рейтингу
      if (this.rating >= other.rating) {
        return { white: this, black: other, penalty: penalty1 }
      } else {
        return { white: other, black: this, penalty: penalty2 }
      }
    }
  }
}

// ===== ФУНКЦИИ ПАРОСОЧЕТАНИЯ =====

/**
 * Группирует игроков по очкам
 */
function groupByScore(players: Player[]): Map<number, Player[]> {
  const groups = new Map<number, Player[]>()

  for (const player of players) {
    if (!groups.has(player.score)) {
      groups.set(player.score, [])
    }
    groups.get(player.score)!.push(player)
  }

  // Сортируем внутри каждой группы по рейтингу (от большего к меньшему)
  for (const group of Array.from(groups.values())) {
    group.sort((a, b) => b.rating - a.rating)
  }

  return groups
}

/**
 * Пытается спарить двух игроков
 */
function tryPair(p1: Player, p2: Player): { white: Player; black: Player; penalty: number } | null {
  if (!p1.canPairWith(p2)) {
    return null
  }
  return p1.getColorArrangement(p2)
}

/**
 * Паросочетание внутри группы с floater optimization
 */
function pairGroup(
  group: Player[],
  floaters: Player[],
  nextGroupPlayers: Player[]
): { pairs: Pairing[]; unpaired: Player[] } {
  const pairs: Pairing[] = []
  const unpaired: Player[] = []

  const allPlayers = [...floaters, ...group].filter(p => !p.paired)

  // Сбрасываем флаг floated
  for (const p of allPlayers) {
    p.floated = false
  }

  // Если нечетное количество и есть следующая группа, выбираем оптимального floater
  if (allPlayers.length % 2 === 1 && nextGroupPlayers.length > 0) {
    const avgNextPref = nextGroupPlayers.reduce((sum, p) => sum + p.colorPreference, 0) / nextGroupPlayers.length

    let bestFloaterIdx = allPlayers.length - 1
    let bestScore = Infinity

    // Выбираем floater из нижней половины группы
    for (let i = allPlayers.length - 1; i >= Math.floor(allPlayers.length / 2); i--) {
      const player = allPlayers[i]

      // Проверяем что floater может играть хотя бы с кем-то из next group
      const canPairWithNext = nextGroupPlayers.some(np => player.canPairWith(np))
      if (!canPairWithNext) continue

      // Минимизируем цветовую несовместимость
      const colorDiff = Math.abs(player.colorPreference + avgNextPref)
      const score = colorDiff * 100 + (allPlayers.length - i)

      if (score < bestScore) {
        bestScore = score
        bestFloaterIdx = i
      }
    }

    // Убираем floater из списка
    const chosenFloater = allPlayers.splice(bestFloaterIdx, 1)[0]
    chosenFloater.floated = true
    unpaired.push(chosenFloater)
  }

  // Top-bottom паросочетание оставшихся
  const S1 = allPlayers.slice(0, Math.ceil(allPlayers.length / 2))
  const S2 = allPlayers.slice(Math.ceil(allPlayers.length / 2))
  const used = new Set<number>()

  // Паруем игроков из S1 с S2
  for (const top of S1) {
    if (used.has(top.id)) continue

    let bestArrangement: ReturnType<typeof tryPair> = null
    let bestBottom: Player | null = null

    // Ищем лучшую пару из S2
    for (const bottom of S2) {
      if (used.has(bottom.id)) continue

      const arrangement = tryPair(top, bottom)
      if (arrangement) {
        if (!bestArrangement || arrangement.penalty < bestArrangement.penalty) {
          bestArrangement = arrangement
          bestBottom = bottom
        }
      }
    }

    if (bestArrangement && bestBottom) {
      pairs.push({
        white: bestArrangement.white.id,
        black: bestArrangement.black.id,
        boardNo: 0 // Будет установлен позже
      })

      bestArrangement.white.paired = true
      bestArrangement.black.paired = true
      used.add(top.id)
      used.add(bestBottom.id)
      continue
    }

    // Если не нашли в S2, пробуем transposition в S1
    for (const other of S1) {
      if (other.id === top.id || used.has(other.id)) continue

      const arrangement = tryPair(top, other)
      if (arrangement) {
        pairs.push({
          white: arrangement.white.id,
          black: arrangement.black.id,
          boardNo: 0
        })

        arrangement.white.paired = true
        arrangement.black.paired = true
        used.add(top.id)
        used.add(other.id)
        break
      }
    }

    if (!used.has(top.id)) {
      top.floated = true
      unpaired.push(top)
    }
  }

  // Проверяем непарованных из S2
  for (const bottom of S2) {
    if (!used.has(bottom.id)) {
      bottom.floated = true
      unpaired.push(bottom)
    }
  }

  return { pairs, unpaired }
}

/**
 * ПЕРВЫЙ РАУНД: Top-bottom паросочетание по рейтингу
 */
function generateRound1Pairings(players: Player[]): Pairing[] {
  const pairs: Pairing[] = []

  const activePlayers = [...players]
  let byePlayer: Player | null = null

  // Если нечётное количество — bye последнему записавшемуся (наибольший participantId)
  if (activePlayers.length % 2 === 1) {
    activePlayers.sort((a, b) => b.id - a.id)
    byePlayer = activePlayers.shift()! // наибольший id = последний записавшийся
  }

  // Сортируем оставшихся по рейтингу для FIDE-паринга
  const sorted = activePlayers.sort((a, b) => b.rating - a.rating)

  const half = sorted.length / 2
  const top = sorted.slice(0, half)
  const bottom = sorted.slice(half)

  for (let i = 0; i < bottom.length; i++) {
    const p1 = top[i]
    const p2 = bottom[i]

    // Случайное назначение цветов
    const whiteFirst = Math.random() < 0.5

    pairs.push({
      white: whiteFirst ? p1.id : p2.id,
      black: whiteFirst ? p2.id : p1.id,
      boardNo: i + 1
    })
  }

  // Добавляем bye
  if (byePlayer) {
    pairs.push({
      white: byePlayer.id,
      black: null,
      boardNo: pairs.length + 1
    })
  }

  return pairs
}

/**
 * ПОСЛЕДУЮЩИЕ РАУНДЫ: Swiss с группировкой по очкам
 */
function generateSubsequentRoundPairings(players: Player[]): Pairing[] {
  const allPairs: Pairing[] = []

  // Сбрасываем флаги
  for (const p of players) {
    p.paired = false
    p.floated = false
  }

  // Если нечётное число — сначала выбираем bye-кандидата
  let byePlayer: Player | null = null
  let activePlayers = players

  if (players.length % 2 === 1) {
    // Сортируем кандидатов: приоритет — не имел bye, меньше очков, ниже Бухгольц
    const candidates = [...players].sort((a, b) => {
      // Сначала те, кто НЕ имел bye
      if (a.hadBye !== b.hadBye) return a.hadBye ? 1 : -1
      // Потом по очкам (меньше — приоритетнее для bye)
      if (a.score !== b.score) return a.score - b.score
      // Потом по Бухгольцу (меньше — приоритетнее для bye)
      return a.buchholz - b.buchholz
    })
    byePlayer = candidates[0]
    byePlayer.paired = true
    activePlayers = players.filter(p => p !== byePlayer)
  }

  const groups = groupByScore(activePlayers)
  const sortedScores = Array.from(groups.keys()).sort((a, b) => b - a)

  let floaters: Player[] = []

  // Обрабатываем группы от большего количества очков к меньшему
  for (let i = 0; i < sortedScores.length; i++) {
    const score = sortedScores[i]
    const group = groups.get(score)!

    const nextGroupPlayers = i < sortedScores.length - 1
      ? groups.get(sortedScores[i + 1])!
      : []

    const result = pairGroup(group, floaters, nextGroupPlayers)
    allPairs.push(...result.pairs)
    floaters = result.unpaired
  }

  // Обрабатываем оставшихся floaters
  while (floaters.length >= 2) {
    const p1 = floaters.shift()!
    let paired = false

    for (let i = 0; i < floaters.length; i++) {
      const p2 = floaters[i]
      const arrangement = tryPair(p1, p2)

      if (arrangement) {
        allPairs.push({
          white: arrangement.white.id,
          black: arrangement.black.id,
          boardNo: 0
        })

        arrangement.white.paired = true
        arrangement.black.paired = true
        floaters.splice(i, 1)
        paired = true
        break
      }
    }

    if (!paired) {
      floaters.push(p1)
      break
    }
  }

  // Fallback: если остался непарованный (не должно быть при нечётном — мы уже выбрали bye)
  if (floaters.length === 1) {
    byePlayer = floaters[0]
  }

  // Добавляем bye-пару, если есть
  if (byePlayer) {
    allPairs.push({
      white: byePlayer.id,
      black: null,
      boardNo: 0
    })
  }

  // Устанавливаем номера досок
  for (let i = 0; i < allPairs.length; i++) {
    allPairs[i].boardNo = i + 1
  }

  return allPairs
}

// Удалена неиспользуемая функция selectByePlayer
// Логика bye обрабатывается автоматически в generateRound1Pairings
// и generateSubsequentRoundPairings

/**
 * ГЛАВНАЯ ФУНКЦИЯ: Генерация пар для раунда
 */
export async function generateSwissPairings(
  tournamentId: number,
  roundId: number
): Promise<Match[]> {
  // Получаем номер текущего раунда
  const { data: roundRow } = await supabaseAdmin
    .from('rounds')
    .select('number')
    .eq('id', roundId)
    .single()

  const currentRoundNum = roundRow?.number || 1

  // Получаем настройки турнира
  const { data: tournament, error: tournamentError } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single()

  if (tournamentError || !tournament) {
    console.error('Error getting tournament by id:', tournamentError)
    throw new Error(`Tournament not found (ID: ${tournamentId})`)
  }

  const byePoints = tournament.bye_points || 1

  // Получаем участников турнира (только активных)
  const { data: participants } = await supabaseAdmin
    .from('tournament_participants')
    .select(`
      id,
      user_id,
      nickname,
      active,
      users!inner(rating)
    `)
    .eq('tournament_id', tournamentId)
    .neq('active', false) // Фильтруем неактивных (withdrawn)

  if (!participants || participants.length === 0) {
    throw new Error('No active participants found')
  }

  // Получаем историю матчей для каждого участника
  const playerDataMap = new Map<number, PlayerData>()

  for (const p of participants) {
    const user = (p as { users?: { rating?: number } }).users
    playerDataMap.set(p.id!, {
      participantId: p.id!,
      userId: p.user_id,
      nickname: p.nickname,
      rating: user?.rating || 0,
      score: 0,
      buchholz: 0,
      rounds: []
    })
  }

  // Загружаем историю всех предыдущих раундов одним батч-запросом
  if (currentRoundNum > 1) {
    const { data: prevRounds } = await supabaseAdmin
      .from('rounds')
      .select('id, number')
      .eq('tournament_id', tournamentId)
      .lt('number', currentRoundNum)
      .order('number', { ascending: true })

    if (prevRounds && prevRounds.length > 0) {
      const roundIds = prevRounds.map((r: { id: number }) => r.id)

      // Один запрос вместо N (async-parallel)
      const { data: allMatches } = await supabaseAdmin
        .from('matches')
        .select('*')
        .in('round_id', roundIds)

      if (allMatches) {
        for (const match of allMatches) {
          // Обрабатываем white player
          if (match.white_participant_id) {
            const playerData = playerDataMap.get(match.white_participant_id)
            if (playerData) {
              playerData.score += match.score_white

              playerData.rounds.push({
                opponent: match.black_participant_id || 0,
                color: match.black_participant_id ? 'w' : null,
                result: match.result === 'white' || match.result === 'forfeit_black' ? 'win' :
                  match.result === 'black' || match.result === 'forfeit_white' ? 'loss' :
                    match.result === 'draw' ? 'draw' : 'bye'
              })
            }
          }

          // Обрабатываем black player
          if (match.black_participant_id) {
            const playerData = playerDataMap.get(match.black_participant_id)
            if (playerData) {
              playerData.score += match.score_black

              playerData.rounds.push({
                opponent: match.white_participant_id || 0,
                color: 'b',
                result: match.result === 'black' || match.result === 'forfeit_white' ? 'win' :
                  match.result === 'white' || match.result === 'forfeit_black' ? 'loss' :
                    match.result === 'draw' ? 'draw' : 'bye'
              })
            }
          }
        }
      }
    }
  }

  // Вычисляем Бухгольц для каждого игрока (сумма очков оппонентов)
  for (const [, pd] of playerDataMap) {
    let buch = 0
    for (const round of pd.rounds) {
      if (round.opponent && round.opponent !== 0) {
        const opp = playerDataMap.get(round.opponent)
        if (opp) buch += opp.score
      }
    }
    pd.buchholz = buch
  }

  // Создаем объекты Player
  const players = Array.from(playerDataMap.values()).map(data => new Player(data))

  // Генерируем пары
  let pairings: Pairing[]

  if (currentRoundNum === 1) {
    pairings = generateRound1Pairings(players)
  } else {
    pairings = generateSubsequentRoundPairings(players)
  }

  // Сохраняем пары в БД одним батч-запросом
  const insertPayload = pairings.map(pairing => {
    const isBye = pairing.black === null
    return {
      round_id: roundId,
      white_participant_id: pairing.white,
      black_participant_id: pairing.black,
      board_no: pairing.boardNo,
      result: isBye ? 'bye' : 'not_played',
      score_white: isBye ? byePoints : 0,
      score_black: 0,
      source: 'swiss_system'
    }
  })

  const { data: insertedMatches } = await supabaseAdmin
    .from('matches')
    .insert(insertPayload)
    .select()

  const matches: Match[] = (insertedMatches || []) as Match[]

  // Обновляем статус раунда
  await supabaseAdmin
    .from('rounds')
    .update({ status: 'paired', paired_at: new Date().toISOString() })
    .eq('id', roundId)

  return matches
}
