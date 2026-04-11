-- 1. Tabela de produtos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  max_installments INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa lê produtos ativos"
  ON public.products FOR SELECT
  USING (active = true);

-- Seed: produto atual
INSERT INTO public.products (slug, name, price_cents, max_installments)
VALUES ('maquina-videos', 'Máquina de Produção de Vídeos com IA', 92780, 12);

-- 2. Tabela de acessos por produto
CREATE TABLE public.user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  payment_id UUID REFERENCES public.payments(id),
  UNIQUE(user_id, product_slug)
);

ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê próprios acessos"
  ON public.user_access FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Alterar tabela payments para Asaas
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS product_slug TEXT NOT NULL DEFAULT 'maquina-videos';

-- Remover NOT NULL do stripe_session_id (se existir a coluna)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'stripe_session_id') THEN
    ALTER TABLE public.payments ALTER COLUMN stripe_session_id DROP NOT NULL;
  END IF;
END $$;

-- 4. Adicionar asaas_customer_id ao profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;

-- 5. Migrar usuários com paid=true para user_access
INSERT INTO public.user_access (user_id, product_slug)
SELECT id, 'maquina-videos' FROM public.profiles WHERE paid = true
ON CONFLICT DO NOTHING;
