# Frontend Structure Documentation

## Архитектура

Проект использует **Feature-Based Architecture** с разделением на логические модули:

```
src/
├── features/          # Функциональные модули
├── layouts/           # Layout компоненты
├── shared/            # Общие утилиты и типы
└── components/        # UI компоненты (переехали из app/)
```

## Features

Каждый feature модуль содержит:
- Компоненты специфичные для этой функциональности
- Hooks и utilities
- Types и interfaces
- API integration
- Pages/роуты

### Структура feature:
```
features/[feature-name]/
├── components/     # React компоненты
├── hooks/         # Custom hooks
├── utils/         # Утилиты
├── types/         # TypeScript типы
├── api/           # API integration
└── index.ts       # Public API модуля
```

## Текущие Features

### Auth
- Аутентификация через Telegram Web App
- Login/logout функциональность
- User session management

### Tournaments
- Список турниров
- Управление турнирами
- Участие в турнирах

### Rating
- Рейтинговая система Glicko2
- История рейтинга
- Предсказания рейтинга
- Leaderboard

### Profile
- Профиль пользователя
- Редактирование профиля
- История игр

### Admin
- Административная панель
- Управление турнирами
- Модерация

### Matches
- Подача результатов матчей
- История матчей
- Валидация результатов

## Layouts

### MainLayout
- Базовый layout для всех страниц
- Общие стили и структура

## Shared

Общие ресурсы:
- Utils функции
- Supabase клиент
- Telegram Web App integration
- Common types

## Миграция существующего кода

### Шаги для миграции компонента:

1. **Определите feature**: К какой функциональности относится компонент?

2. **Создайте структуру**:
```bash
mkdir -p src/features/[feature-name]/components
```

3. **Переместите компонент**:
```bash
mv app/[old-path]/component.tsx src/features/[feature-name]/components/
```

4. **Обновите импорты**:
```typescript
// Старое
import Component from '@/app/[old-path]/component'

// Новое
import { Component } from '@/features/[feature-name]'
```

5. **Создайте index.ts** для feature:
```typescript
export { default as Component } from './components/Component'
export { useCustomHook } from './hooks/useCustomHook'
```

## Best Practices

### 1. Изоляция feature
- Каждая feature должна быть независимой
- Избегайте cross-feature импортов
- Используйте shared для общего функционала

### 2. Public API
- Все экспорты должны быть через index.ts
- Не импортируйте напрямую из внутренних файлов feature

### 3. Структура компонентов
- Один компонент - один файл
- Используйте index.ts для группировки
- Держите компоненты < 300 строк

### 4. Типизация
- Используйте TypeScript для всех компонентов
- Определяйте props интерфейсы
- Экспортируйте типы через index.ts

### 5. Тестирование
- Создавайте тесты рядом с компонентами
- Используйте формат `Component.test.tsx`
- Покрывайте critical paths

## Пример создания новой feature

```bash
# Создайте структуру
mkdir -p src/features/leaderboard/{components,hooks,utils,types}

# Создайте компонент
echo 'export interface LeaderboardProps {
  tournamentId: string
}' > src/features/leaderboard/types/leaderboard.types.ts

# Создайте hook
echo 'export function useLeaderboard(tournamentId: string) {
  // hook logic
}' > src/features/leaderboard/hooks/useLeaderboard.ts

# Создайте index.ts
echo 'export { default as Leaderboard } from "./components/Leaderboard"
export { useLeaderboard } from "./hooks/useLeaderboard"' > src/features/leaderboard/index.ts
```

## API Integration

### Паттерн для API hooks:
```typescript
// features/[feature]/api/feature.api.ts
export async function fetchFeatureData(id: string) {
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('id', id)
  
  if (error) throw error
  return data
}

// features/[feature]/hooks/useFeature.ts
export function useFeature(id: string) {
  return useQuery({
    queryKey: ['feature', id],
    queryFn: () => fetchFeatureData(id),
  })
}
```

## State Management

### Локальный state:
- Используйте useState, useReducer
- Для сложного state - custom hooks

### Глобальный state:
- Используйте Context API для feature-specific state
- Для shared state - глобальные провайдеры

### Кеширование:
- Используйте React Query для server state
- Настройте stale time для оптимизации