-- ============================================================
-- Migration 003: Índices de performance e publicação Realtime
-- ============================================================

-- Índices para otimizar as queries mais frequentes
CREATE INDEX IF NOT EXISTS idx_exercises_user_id
  ON public.exercises (user_id);

CREATE INDEX IF NOT EXISTS idx_exercises_status
  ON public.exercises (status);

-- Índice composto para a query principal do Board:
-- SELECT * FROM exercises WHERE user_id = $1 AND status = $2
CREATE INDEX IF NOT EXISTS idx_exercises_user_status
  ON public.exercises (user_id, status);

-- Habilitar publicação Realtime para a tabela exercises
ALTER PUBLICATION supabase_realtime ADD TABLE public.exercises;
