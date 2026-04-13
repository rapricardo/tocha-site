-- =============================================
-- Download de produtos via Supabase Storage
-- =============================================

-- 1. Adicionar coluna para caminho do arquivo no bucket
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS download_path TEXT;

-- 2. Preencher o produto atual com o caminho padrão
UPDATE public.products
SET download_path = 'maquina-videos.zip'
WHERE slug = 'maquina-videos';

-- 3. Criar bucket privado 'produtos' (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', false)
ON CONFLICT (id) DO NOTHING;

-- Nota: não criamos policies de SELECT no bucket.
-- O acesso é via signed URL gerado pelo backend com service_role (que bypassa RLS).
-- Isso garante que apenas usuários com user_access liberado conseguem baixar.
