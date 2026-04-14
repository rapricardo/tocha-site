-- =============================================
-- Turmas (cohorts) + blindagem do campo role
-- =============================================

-- 1. Tabela de turmas
CREATE TABLE public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug TEXT NOT NULL REFERENCES public.products(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  max_students INT DEFAULT 20,
  meet_url TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cohorts_product_active_starts
  ON public.cohorts(product_slug, active, starts_at);

-- 2. Associar turma ao acesso do usuário
ALTER TABLE public.user_access
  ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL;

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

-- Alunos leem turmas em que estão matriculados
CREATE POLICY "Aluno lê própria turma"
  ON public.cohorts FOR SELECT
  USING (
    id IN (
      SELECT cohort_id FROM public.user_access
      WHERE user_id = auth.uid() AND cohort_id IS NOT NULL
    )
  );

-- 3. Blindar o campo role em profiles
-- A policy de UPDATE existente ("Usuário atualiza próprio perfil") permite que o
-- usuário edite qualquer coluna. Precisamos impedir que altere o próprio role.
-- Solução: trigger BEFORE UPDATE que reverte alterações em role por clientes não-admin.

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- service_role tem auth.uid() NULL, então esse bloqueio só afeta clientes autenticados
  IF auth.uid() IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_role_self_escalation ON public.profiles;
CREATE TRIGGER prevent_role_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();
