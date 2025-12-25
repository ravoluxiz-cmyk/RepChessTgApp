#!/usr/bin/env node

/**
 * BBP Mock для Vercel serverless окружения
 * Простая реализация швейцарской системы пар
 */

const stdin = process.stdin;
const chunks = [];

stdin.on('data', (chunk) => {
  chunks.push(chunk);
});

stdin.on('end', () => {
  const input = Buffer.concat(chunks).toString('utf-8');

  try {
    // Парсим входные данные
    const lines = input.trim().split('\n');
    const participants = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      // Формат: ID Имя Очки БухгольцКат1 БухгольцКат2 Буххольц ...
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        participants.push({
          id: parseInt(parts[0]),
          name: parts[1],
          points: parseFloat(parts[2] || 0),
          tiebreakers: parts.slice(3).map(parseFloat)
        });
      }
    }

    // Простая логика пар: сортируем по очкам и паруем сверху вниз
    participants.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      // Дополнительная сортировка по тай-брейкерам
      for (let i = 0; i < Math.min(a.tiebreakers.length, b.tiebreakers.length); i++) {
        if (a.tiebreakers[i] !== b.tiebreakers[i]) {
          return b.tiebreakers[i] - a.tiebreakers[i];
        }
      }
      return 0;
    });

    // Создаём пары
    const pairs = [];
    const used = new Set();

    for (let i = 0; i < participants.length; i++) {
      if (used.has(i)) continue;

      // Ищем пару для текущего участника
      let paired = false;
      for (let j = i + 1; j < participants.length; j++) {
        if (used.has(j)) continue;

        // Паруем i и j
        pairs.push([participants[i].id, participants[j].id]);
        used.add(i);
        used.add(j);
        paired = true;
        break;
      }

      // Если не нашли пару, участник получает bye
      if (!paired && !used.has(i)) {
        pairs.push([participants[i].id, 0]); // 0 означает bye
        used.add(i);
      }
    }

    // Выводим результат в формате BBP
    for (const pair of pairs) {
      console.log(`${pair[0]} ${pair[1]}`);
    }

  } catch (err) {
    console.error('Error parsing BBP input:', err.message);
    process.exit(1);
  }
});

stdin.resume();
