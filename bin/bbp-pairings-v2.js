#!/usr/bin/env node

/**
 * Полноценная швейцарская система пар v2
 * С поддержкой истории раундов, чередования цветов и избегания повторных встреч
 */

// ===== КЛАСС ИГРОКА =====

class Player {
  constructor(id, name, rating, score = 0) {
    this.id = id; // Позиция в TRF (1-based)
    this.name = name;
    this.rating = rating;
    this.score = score;

    // История раундов
    this.rounds = []; // Массив объектов { opponent: id, color: 'w'/'b', result: 'w'/'d'/'l' }

    // Статистика по цветам
    this.whiteCount = 0;
    this.blackCount = 0;

    // Последний цвет (для строгого чередования)
    this.lastColor = null; // 'w' или 'b'

    // Предпочтение цвета
    this.colorPreference = 0; // +1 = предпочитает белые, -1 = черные, 0 = без предпочтений

    // Множество ID оппонентов
    this.opponents = new Set();

    // Флаги для текущего раунда
    this.paired = false;
    this.floated = false;
  }

  /**
   * Добавляет раунд в историю
   */
  addRound(opponentId, color, result) {
    this.rounds.push({ opponent: opponentId, color, result });
    this.opponents.add(opponentId);

    if (color === 'w') {
      this.whiteCount++;
      this.lastColor = 'w';
    } else if (color === 'b') {
      this.blackCount++;
      this.lastColor = 'b';
    }

    this.updateColorPreference();
  }

  /**
   * Обновляет предпочтение цвета согласно правилам FIDE Dutch System
   *
   * Absolute preference (±2):
   * - color diff > +1 или < -1
   * - ИЛИ последние 2 раунда с одинаковым цветом
   *
   * Strong preference (±1):
   * - color diff = ±1
   */
  updateColorPreference() {
    const diff = this.whiteCount - this.blackCount;

    // Проверяем последние 2 раунда
    const lastTwoSameColor = this.rounds.length >= 2 &&
      this.rounds[this.rounds.length - 1].color === this.rounds[this.rounds.length - 2].color;

    const lastTwoColor = lastTwoSameColor ? this.rounds[this.rounds.length - 1].color : null;

    // ABSOLUTE COLOR PREFERENCE (приоритет 2)
    if (diff > 1 || (lastTwoColor === 'w')) {
      // Должен играть черными
      this.colorPreference = -2;
    } else if (diff < -1 || (lastTwoColor === 'b')) {
      // Должен играть белыми
      this.colorPreference = 2;
    }
    // STRONG COLOR PREFERENCE (приоритет 1)
    else if (diff === 1) {
      // Предпочитает черные
      this.colorPreference = -1;
    } else if (diff === -1) {
      // Предпочитает белые
      this.colorPreference = 1;
    }
    // NO PREFERENCE - смотрим на последний цвет
    else if (diff === 0) {
      if (this.lastColor === 'w') {
        this.colorPreference = -1; // Mild preference for black
      } else if (this.lastColor === 'b') {
        this.colorPreference = 1; // Mild preference for white
      } else {
        this.colorPreference = 0;
      }
    } else {
      this.colorPreference = 0;
    }
  }

  /**
   * Проверяет, можно ли парить с другим игроком
   */
  canPairWith(other) {
    return !this.opponents.has(other.id);
  }

  /**
   * Определяет оптимальную расстановку цветов с другим игроком
   * Возвращает { white: Player, black: Player, penalty: number }
   */
  getColorArrangement(other) {
    // Вариант 1: this=white, other=black
    const penalty1 = this.getColorPenalty('w') + other.getColorPenalty('b');

    // Вариант 2: this=black, other=white
    const penalty2 = this.getColorPenalty('b') + other.getColorPenalty('w');

    if (penalty1 < penalty2) {
      return { white: this, black: other, penalty: penalty1 };
    } else if (penalty2 < penalty1) {
      return { white: other, black: this, penalty: penalty2 };
    } else {
      // Равные штрафы - выбираем по рейтингу
      if (this.rating >= other.rating) {
        return { white: this, black: other, penalty: penalty1 };
      } else {
        return { white: other, black: this, penalty: penalty2 };
      }
    }
  }

  /**
   * Вычисляет штраф за назначение определенного цвета
   * Использует colorPreference для определения приоритета
   *
   * Штрафы:
   * - Нарушение absolute preference (±2): 1000
   * - Нарушение strong preference (±1): 100
   * - Neutral (0): 1
   * - Совпадение с предпочтением: 0
   */
  getColorPenalty(color) {
    if (color === 'w') {
      // Даем белые
      if (this.colorPreference === -2) return 1000; // MUST play black - критическое нарушение
      if (this.colorPreference === -1) return 100;  // PREFERS black - нарушение
      if (this.colorPreference === 0) return 1;     // Neutral
      if (this.colorPreference === 1) return 0;     // PREFERS white - отлично!
      if (this.colorPreference === 2) return 0;     // MUST play white - отлично!
    } else if (color === 'b') {
      // Даем черные
      if (this.colorPreference === 2) return 1000;  // MUST play white - критическое нарушение
      if (this.colorPreference === 1) return 100;   // PREFERS white - нарушение
      if (this.colorPreference === 0) return 1;     // Neutral
      if (this.colorPreference === -1) return 0;    // PREFERS black - отлично!
      if (this.colorPreference === -2) return 0;    // MUST play black - отлично!
    }
    return 0;
  }
}

// ===== ПАРСИНГ TRF =====

/**
 * Парсит историю раундов из строки TRF
 * Формат: w2 b3 d4 (white vs 2 won, black vs 3 lost, draw vs 4)
 */
function parseRoundHistory(historyStr) {
  const rounds = [];
  const tokens = historyStr.trim().split(/\s+/);

  for (const token of tokens) {
    if (!token || token.length < 2) continue;

    const firstChar = token[0].toLowerCase();
    const rest = token.slice(1);

    // Определяем цвет и результат
    let color = null;
    let result = null;
    let opponentId = null;

    // Формат может быть: w2+, b3-, d4=, или просто w2, b3
    if (firstChar === 'w' || firstChar === 'b') {
      color = firstChar;

      // Парсим ID оппонента и результат
      const match = rest.match(/^(\d+)([+\-=]?)$/);
      if (match) {
        opponentId = parseInt(match[1]);
        const resultChar = match[2];

        if (resultChar === '+') result = 'w'; // win
        else if (resultChar === '-') result = 'l'; // loss
        else if (resultChar === '=') result = 'd'; // draw
        else {
          // Результат не указан явно - определяем по контексту
          // В TRF обычно: w = win for white, b = win for black
          // Но в истории это означает цвет игрока
          result = 'w'; // Предполагаем победу
        }
      }
    } else if (firstChar === 'd') {
      // Ничья - цвет может быть не указан, берем из следующего символа
      const match = rest.match(/^(\d+)$/);
      if (match) {
        opponentId = parseInt(match[1]);
        result = 'd';
        // Цвет определим позже из контекста или установим 'w'
        color = 'w';
      }
    }

    if (opponentId && color && result) {
      rounds.push({ opponent: opponentId, color, result });
    }
  }

  return rounds;
}

/**
 * Парсит входной TRF
 */
function parseTrfInput(input) {
  const lines = input.trim().split('\n');
  const players = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Пропускаем заголовки
    if (line.startsWith('012') || line.startsWith('XXR') || line.startsWith('XXC')) {
      continue;
    }

    // Парсим строку игрока
    if (line.startsWith('001')) {
      // Убираем "001" и парсим остальное
      const content = line.slice(3).trim();

      // Формат: ID NAME(30 chars) RATING ... SCORE RANK [ROUNDS]
      // Пытаемся найти числа в конце
      const parts = content.split(/\s+/);

      if (parts.length < 3) continue;

      const id = parseInt(parts[0]);

      // Ищем score (последнее число перед историей раундов)
      // Обычно score - это предпоследнее или третье с конца число
      let scoreIdx = -1;
      let ratingIdx = -1;

      // Ищем числа справа налево
      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        // Проверяем, не история ли это (содержит буквы)
        if (/[a-zA-Z]/.test(part)) continue;

        const num = parseFloat(part);
        if (!isNaN(num)) {
          if (scoreIdx === -1) {
            scoreIdx = i; // Последнее число - это rank, предпоследнее - score
          } else if (ratingIdx === -1) {
            ratingIdx = i;
            break;
          }
        }
      }

      // Извлекаем имя (все между ID и рейтингом)
      const name = parts.slice(1, ratingIdx).join(' ').slice(0, 30).trim() || `Player${id}`;
      const rating = ratingIdx >= 0 ? parseInt(parts[ratingIdx]) : 1500;
      const score = scoreIdx >= 0 ? parseFloat(parts[scoreIdx - 1] || parts[scoreIdx]) : 0;

      const player = new Player(id, name, rating, score);

      // Парсим историю раундов (все после score/rank)
      const historyStart = scoreIdx + 1;
      if (historyStart < parts.length) {
        const historyStr = parts.slice(historyStart).join(' ');
        const rounds = parseRoundHistory(historyStr);

        for (const round of rounds) {
          player.addRound(round.opponent, round.color, round.result);
        }
      }

      players.push(player);
    }
  }

  return players;
}

// ===== ТЕСТИРОВАНИЕ ПАРСИНГА =====

// Для тестирования добавим функцию вывода
function testParsing(input) {
  console.error('=== Testing TRF Parsing ===');
  const players = parseTrfInput(input);

  for (const p of players) {
    console.error(`Player ${p.id}: ${p.name} (${p.rating}) - ${p.score} pts`);
    console.error(`  White: ${p.whiteCount}, Black: ${p.blackCount}, Last: ${p.lastColor}`);
    console.error(`  Opponents: ${Array.from(p.opponents).join(', ')}`);
    console.error(`  Color preference: ${p.colorPreference}`);
  }
  console.error('=== End Test ===\n');
}

// ===== ГРУППИРОВКА И ПАРОСОЧЕТАНИЕ =====

function groupByScore(players) {
  const groups = new Map();

  for (const player of players) {
    const score = player.score;
    if (!groups.has(score)) {
      groups.set(score, []);
    }
    groups.get(score).push(player);
  }

  // Сортируем группы по очкам (от большего к меньшему)
  const sortedScores = Array.from(groups.keys()).sort((a, b) => b - a);

  // Внутри каждой группы сортируем по рейтингу (от большего к меньшему)
  for (const score of sortedScores) {
    const group = groups.get(score);
    group.sort((a, b) => b.rating - a.rating);
  }

  return { groups, sortedScores };
}

/**
 * Пытается спарить двух игроков, возвращая оптимальную расстановку цветов
 */
function tryPair(p1, p2) {
  if (!p1.canPairWith(p2)) {
    return null; // Уже играли друг с другом
  }

  return p1.getColorArrangement(p2);
}

/**
 * Паросочетание внутри группы с учетом floaters
 * Улучшенная версия с оптимизацией выбора floater
 */
function pairGroup(group, floaters = [], nextGroupPlayers = []) {
  const pairs = [];
  const unpaired = [];

  // Объединяем floaters с текущей группой
  const allPlayers = [...floaters, ...group].filter(p => !p.paired);

  // Сбрасываем флаг floated для всех
  for (const p of allPlayers) {
    p.floated = false;
  }

  // Если нечетное количество, выбираем оптимального floater
  if (allPlayers.length % 2 === 1 && nextGroupPlayers.length > 0) {
    // Вычисляем средний colorPreference следующей группы
    const avgNextPref = nextGroupPlayers.reduce((sum, p) => sum + p.colorPreference, 0) / nextGroupPlayers.length;

    if (process.env.DEBUG) {
      console.error(`\n[FLOATER SELECTION] Group has ${allPlayers.length} players (odd)`);
      console.error(`Next group avg pref: ${avgNextPref.toFixed(2)}`);
    }

    // Выбираем floater с противоположным цветовым предпочтением
    let bestFloaterIdx = allPlayers.length - 1; // По умолчанию последний (самый низкий рейтинг)
    let bestScore = Infinity;

    for (let i = allPlayers.length - 1; i >= Math.floor(allPlayers.length / 2); i--) {
      const player = allPlayers[i];

      // ВАЖНО: Проверяем, может ли floater играть хотя бы с кем-то из следующей группы
      const canPairWithNext = nextGroupPlayers.some(nextPlayer => player.canPairWith(nextPlayer));

      if (!canPairWithNext) {
        if (process.env.DEBUG) {
          console.error(`  Player ${player.id} (pref=${player.colorPreference}): SKIP - already played with all in next group`);
        }
        continue;
      }

      // Штраф = разница цветовых предпочтений
      const colorDiff = Math.abs(player.colorPreference + avgNextPref);
      const score = colorDiff * 100 + (allPlayers.length - i); // Приоритет нижним по рейтингу

      if (process.env.DEBUG) {
        console.error(`  Player ${player.id} (pref=${player.colorPreference}): colorDiff=${colorDiff.toFixed(2)}, score=${score}`);
      }

      if (score < bestScore) {
        bestScore = score;
        bestFloaterIdx = i;
      }
    }

    // Убираем выбранного floater из списка для паросочетания
    const chosenFloater = allPlayers.splice(bestFloaterIdx, 1)[0];
    chosenFloater.floated = true;
    unpaired.push(chosenFloater);

    if (process.env.DEBUG) {
      console.error(`  => Chosen floater: Player ${chosenFloater.id}\n`);
    }
  }

  // Top-bottom паросочетание оставшихся игроков
  const S1 = allPlayers.slice(0, Math.ceil(allPlayers.length / 2));
  const S2 = allPlayers.slice(Math.ceil(allPlayers.length / 2));

  const used = new Set();

  // Паруем игроков из верхней половины с нижней
  for (const top of S1) {
    if (used.has(top.id)) continue;

    let paired = false;
    let bestArrangement = null;
    let bestBottom = null;

    // Ищем лучшую пару из нижней половины
    for (const bottom of S2) {
      if (used.has(bottom.id)) continue;

      const arrangement = tryPair(top, bottom);
      if (arrangement) {
        if (!bestArrangement || arrangement.penalty < bestArrangement.penalty) {
          bestArrangement = arrangement;
          bestBottom = bottom;
        }
      }
    }

    if (bestArrangement) {
      pairs.push({
        white: bestArrangement.white.id,
        black: bestArrangement.black.id,
        whitePlayer: bestArrangement.white,
        blackPlayer: bestArrangement.black
      });

      bestArrangement.white.paired = true;
      bestArrangement.black.paired = true;
      used.add(top.id);
      used.add(bestBottom.id);
      paired = true;
    }

    if (!paired) {
      // Пытаемся найти пару в верхней половине (transposition)
      for (const other of S1) {
        if (other.id === top.id || used.has(other.id)) continue;

        const arrangement = tryPair(top, other);
        if (arrangement) {
          pairs.push({
            white: arrangement.white.id,
            black: arrangement.black.id,
            whitePlayer: arrangement.white,
            blackPlayer: arrangement.black
          });

          arrangement.white.paired = true;
          arrangement.black.paired = true;
          used.add(top.id);
          used.add(other.id);
          paired = true;
          break;
        }
      }
    }

    if (!paired) {
      // Игрок становится floater
      top.floated = true;
      unpaired.push(top);
    }
  }

  // Проверяем непарованных из S2
  for (const bottom of S2) {
    if (!used.has(bottom.id)) {
      bottom.floated = true;
      unpaired.push(bottom);
    }
  }

  return { pairs, unpaired };
}

/**
 * Основной алгоритм генерации пар
 */
function generatePairings(players) {
  const { groups, sortedScores } = groupByScore(players);

  const allPairs = [];
  let floaters = [];

  // Сбрасываем флаги
  for (const p of players) {
    p.paired = false;
    p.floated = false;
  }

  // Обрабатываем группы от большего количества очков к меньшему
  for (let i = 0; i < sortedScores.length; i++) {
    const score = sortedScores[i];
    const group = groups.get(score);

    // Получаем следующую группу для оптимизации floater
    const nextGroupPlayers = i < sortedScores.length - 1
      ? groups.get(sortedScores[i + 1])
      : [];

    const result = pairGroup(group, floaters, nextGroupPlayers);

    allPairs.push(...result.pairs);
    floaters = result.unpaired;
  }

  // Обрабатываем оставшихся floaters
  if (floaters.length > 0) {
    // Пытаемся спарить floaters между собой
    while (floaters.length >= 2) {
      const p1 = floaters.shift();
      let paired = false;

      for (let i = 0; i < floaters.length; i++) {
        const p2 = floaters[i];
        const arrangement = tryPair(p1, p2);

        if (arrangement) {
          allPairs.push({
            white: arrangement.white.id,
            black: arrangement.black.id,
            whitePlayer: arrangement.white,
            blackPlayer: arrangement.black
          });

          arrangement.white.paired = true;
          arrangement.black.paired = true;
          floaters.splice(i, 1);
          paired = true;
          break;
        }
      }

      if (!paired) {
        // Возвращаем в список, попробуем позже
        floaters.push(p1);
        break;
      }
    }

    // Последний игрок получает bye
    if (floaters.length === 1) {
      allPairs.push({
        white: floaters[0].id,
        black: null,
        whitePlayer: floaters[0],
        blackPlayer: null
      });
    }
  }

  return allPairs;
}

// ===== ВЫВОД =====

function formatOutput(pairs) {
  const lines = [];

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    if (pair.black === null) {
      lines.push(`Board ${i + 1}: ${pair.white} - BYE`);
    } else {
      lines.push(`Board ${i + 1}: ${pair.white} - ${pair.black}`);
    }
  }

  return lines.join('\n');
}

// ===== ОСНОВНОЙ КОД =====

const stdin = process.stdin;
const chunks = [];

stdin.on('data', (chunk) => {
  chunks.push(chunk);
});

stdin.on('end', () => {
  const input = Buffer.concat(chunks).toString('utf-8');

  try {
    const players = parseTrfInput(input);

    if (players.length === 0) {
      console.error('No players found in input');
      process.exit(1);
    }

    // Отладочная информация в stderr
    if (process.env.DEBUG === '1') {
      testParsing(input);
    }

    // Генерируем пары
    const pairs = generatePairings(players);

    // Выводим результат
    const output = formatOutput(pairs);
    console.log(output);

  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
});

stdin.resume();
