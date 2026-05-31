-- ============================================================
-- Migration 001: Criar tabela exercises
-- ============================================================

CREATE TABLE IF NOT EXISTS public.exercises (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  sets        INTEGER     NOT NULL CHECK (sets > 0),
  reps        INTEGER     NOT NULL CHECK (reps > 0),
  weight      NUMERIC(8,2) NOT NULL CHECK (weight >= 0),
  status      TEXT        NOT NULL DEFAULT 'backlog'
                CHECK (status IN ('backlog', 'hoje', 'fazendo', 'feito')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
