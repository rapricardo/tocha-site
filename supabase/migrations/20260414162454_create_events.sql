-- =============================================
-- Eventos ao vivo (lives)
-- =============================================

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  meet_url TEXT,
  recording_youtube_id TEXT,
  category TEXT DEFAULT 'geral',
  visibility TEXT NOT NULL DEFAULT 'members',
  -- 'members' = qualquer usuário cadastrado
  -- 'public' = qualquer visitante
  -- 'mentoring_only' = só quem tem acesso a produto type='mentoring'
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_starts_at ON public.events(starts_at);
CREATE INDEX idx_events_visibility_starts ON public.events(visibility, starts_at);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Eventos públicos: qualquer um lê
CREATE POLICY "Eventos públicos são legíveis"
  ON public.events FOR SELECT
  USING (visibility = 'public');

-- Eventos de membros: só usuários autenticados
CREATE POLICY "Eventos de membros para autenticados"
  ON public.events FOR SELECT
  USING (visibility = 'members' AND auth.uid() IS NOT NULL);

-- Eventos de mentoria: só quem tem acesso a algum produto mentoring
CREATE POLICY "Eventos de mentoria para quem tem acesso"
  ON public.events FOR SELECT
  USING (
    visibility = 'mentoring_only'
    AND EXISTS (
      SELECT 1 FROM public.user_access ua
      JOIN public.products p ON p.slug = ua.product_slug
      WHERE ua.user_id = auth.uid()
        AND p.type = 'mentoring'
    )
  );
