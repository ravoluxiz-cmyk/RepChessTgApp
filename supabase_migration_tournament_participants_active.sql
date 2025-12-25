-- Добавление поля active для исключения игроков из жеребьевки
-- Миграция для tournament_participants

-- Добавляем поле active (по умолчанию true - активен)
ALTER TABLE tournament_participants
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL;

-- Создаем индекс для быстрого поиска активных участников
CREATE INDEX IF NOT EXISTS idx_tournament_participants_active
ON tournament_participants(tournament_id, active);

-- Комментарий к полю
COMMENT ON COLUMN tournament_participants.active IS
'Флаг активности участника. false = исключен из жеребьевки организатором';
