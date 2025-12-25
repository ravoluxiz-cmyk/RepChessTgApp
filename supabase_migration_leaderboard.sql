-- Создание таблицы leaderboard для турнирных рейтингов
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  participant_id BIGINT NOT NULL REFERENCES public.tournament_participants(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  points NUMERIC NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, participant_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_leaderboard_tournament_id ON public.leaderboard(tournament_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(tournament_id, rank);

-- RLS policies - разрешаем читать всем, изменять только с service role
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to leaderboard"
  ON public.leaderboard
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role full access to leaderboard"
  ON public.leaderboard
  TO service_role
  USING (true)
  WITH CHECK (true);
