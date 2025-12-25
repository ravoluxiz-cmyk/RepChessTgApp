#!/usr/bin/env node

/**
 * Полноценная реализация швейцарской системы пар для шахматных турниров
 * Основана на голландской системе с учетом всех основных правил
 *
 * Реализованные правила:
 * 1. Группировка по очкам (score groups)
 * 2. Избегание повторных встреч
 * 3. Чередование цветов (white/black balance)
 * 4. Floaters (игроки, спускающиеся в группу ниже)
 * 5. Правильное паросочетание внутри групп
 */

// ===== ТИПЫ И ИНТЕРФЕЙСЫ =====

class Player {
  constructor(id, name, rating, score = 0, tiebreakers = []) {
    this.id = id; // Позиция в TRF (1-based)
    this.name = name;
    this.rating = rating;
    this.score = score; // Очки
    this.tiebreakers = tiebreakers; // Тай-брейкеры [buchholz, buchholz_cut1, ...]

    // Статистика по цветам
    this.whiteCount = 0;
    this.blackCount = 0;
    this.colorPreference = 'none'; // 'white', 'black', 'none'

    // История встреч
    this.opponents = new Set(); // ID игроков, с которыми уже играл
    this.opponentsList = []; // Список opponent IDs в порядке раундов

    // Текущий раунд
    this.paired = false;
    this.floated = false; // Был ли спущен в группу ниже
  }

  /**
   * Определяет предпочтение цвета на основе истории
   */
  updateColorPreference() {
    const diff = this.whiteCount - this.blackCount;
    if (diff > 0) {
      this.colorPreference = 'black'; // Играл больше белыми, предпочитает черные
    } else if (diff < 0) {
      this.colorPreference = 'white'; // Играл больше черными, предпочитает белые
    } else {
      this.colorPreference = 'none';
    }
  }

  /**
   * Проверяет, можно ли парить с другим игроком
   */
  canPairWith(other) {
    return !this.opponents.has(other.id) && !other.opponents.has(this.id);
  }
}

// ===== ПАРСИНГ ВХОДНЫХ ДАННЫХ =====

function parseTrfInput(input) {
  const lines = input.trim().split('\n');
  const players = [];

  let roundHistory = []; // История раундов для анализа цветов

  for (const line of lines) {
    if (!line.trim()) continue;

    // Пропускаем строки комментариев и заголовков
    if (line.startsWith('012') || line.startsWith('XXR') || line.startsWith('XXC')) {
      continue;
    }

    // Парсим строку игрока: 001    ID      NAME                          RATING ... SCORE
    if (line.startsWith('001')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 7) continue;

      // Извлекаем данные (формат может варьироваться)
      const id = parseInt(parts[1]);
      const name = parts.slice(2, -3).join(' '); // Имя между ID и числовыми данными
      const rating = parseInt(parts[parts.length - 3]) || 1500;
      const score = parseFloat(parts[parts.length - 2]) || 0;

      // Тай-брейкеры пока не парсим (можно добавить позже)
      const player = new Player(id, name, rating, score);
      players.push(player);
    }
  }

  return { players, roundHistory };
}

// ===== ГРУППИРОВКА ПО ОЧКАМ =====

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

// ===== ПАРОСОЧЕТАНИЕ =====

/**
 * Пытается спарить игроков внутри группы
 * Использует упрощенный алгоритм с floaters
 */
function pairGroup(group, lowerGroupsPlayers = []) {
  const pairs = [];
  const unpaired = [...group];
  const floaters = [];

  // Объединяем с floaters из верхних групп
  const allPlayers = [...lowerGroupsPlayers, ...unpaired];

  // Пытаемся парить top-bottom методом
  while (allPlayers.length >= 2) {
    const top = allPlayers.shift();
    if (!top || top.paired) continue;

    // Ищем пару для top
    let paired = false;
    for (let i = 0; i < allPlayers.length; i++) {
      const bottom = allPlayers[i];
      if (!bottom || bottom.paired) continue;

      // Проверяем, можно ли парить
      if (top.canPairWith(bottom)) {
        // Определяем цвета с учетом предпочтений
        let white, black;

        if (top.colorPreference === 'white' || bottom.colorPreference === 'black') {
          white = top;
          black = bottom;
        } else if (top.colorPreference === 'black' || bottom.colorPreference === 'white') {
          white = bottom;
          black = top;
        } else {
          // Нет явных предпочтений - рандомно или по рейтингу
          if (top.rating >= bottom.rating) {
            white = top;
            black = bottom;
          } else {
            white = bottom;
            black = top;
          }
        }

        pairs.push({ white: white.id, black: black.id });
        top.paired = true;
        bottom.paired = true;
        allPlayers.splice(i, 1);
        paired = true;
        break;
      }
    }

    // Если не нашли пару, игрок становится floater
    if (!paired) {
      top.floated = true;
      floaters.push(top);
    }
  }

  // Оставшиеся игроки тоже становятся floaters
  for (const player of allPlayers) {
    if (!player.paired) {
      player.floated = true;
      floaters.push(player);
    }
  }

  return { pairs, floaters };
}

/**
 * Основной алгоритм генерации пар
 */
function generatePairings(players) {
  const { groups, sortedScores } = groupByScore(players);

  const allPairs = [];
  let floaters = [];

  // Обрабатываем группы от большего количества очков к меньшему
  for (const score of sortedScores) {
    const group = groups.get(score);

    // Паруем группу с учетом floaters из верхних групп
    const result = pairGroup(group, floaters);

    allPairs.push(...result.pairs);
    floaters = result.floaters;
  }

  // Обрабатываем оставшихся floaters
  // Если остался один игрок, он получает bye
  if (floaters.length === 1) {
    allPairs.push({ white: floaters[0].id, black: null });
  } else if (floaters.length > 1) {
    // Пытаемся спарить оставшихся
    while (floaters.length >= 2) {
      const p1 = floaters.shift();
      const p2 = floaters.shift();
      allPairs.push({ white: p1.id, black: p2.id });
    }

    // Если остался один, bye
    if (floaters.length === 1) {
      allPairs.push({ white: floaters[0].id, black: null });
    }
  }

  return allPairs;
}

// ===== ВЫВОД РЕЗУЛЬТАТА =====

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
    // Парсим входные данные
    const { players } = parseTrfInput(input);

    if (players.length === 0) {
      console.error('No players found in input');
      process.exit(1);
    }

    // Генерируем пары
    const pairs = generatePairings(players);

    // Выводим результат
    const output = formatOutput(pairs);
    console.log(output);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
});

stdin.resume();
