-- ============================================================
-- Migration 002: Habilitar RLS e criar políticas de acesso
-- ============================================================

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Usuário lê apenas seus próprios exercícios
CREATE POLICY "exercises_select_own"
  ON public.exercises
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuário só insere exercícios com seu próprio user_id
CREATE POLICY "exercises_insert_own"
  ON public.exercises
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuário só atualiza seus próprios exercícios
CREATE POLICY "exercises_update_own"
  ON public.exercises
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuário só deleta seus próprios exercícios
CREATE POLICY "exercises_delete_own"
  ON public.exercises
  FOR DELETE
  USING (auth.uid() = user_id);
