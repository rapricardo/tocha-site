# Sitemap — Ricardo Tocha

## Páginas

### / (Home) — Hub institucional e diagnóstico
Página principal com seções:

1. **Hero** — tese principal e CTA de diagnóstico
2. **Diagnóstico** — problemas de visibilidade, talento e margem
3. **Infraestrutura** — arsenal de produtos/soluções conectadas
4. **Cases** — provas de conceito e unit economics
5. **Autoridade** — sobre Ricardo Tocha
6. **Formulário** — aplicação para auditoria/intervenção
7. **Footer** — links para soluções e copyright

### /sobre/ — Bio e prova de trabalho
Authority Statement como headline, bio (fatos publicados), lista de sistemas em produção, newsletter e CTA duplo (manifesto + contato). Copy em `docs/copy/sobre.md`.

### /blog/ — Diário de construção
Listagem dos posts (Content Collections em `src/content/blog/`, schema em `src/content.config.ts`). Posts em `/blog/[slug]/` com JSON-LD BlogPosting e newsletter no fim. Posts com `draft: true` ficam fora da listagem e do build de produção.

## Componentes

| Componente | Tipo | Interatividade |
|-----------|------|---------------|
| Layout.astro | layout | Não |
| TrackingHiddenFields.astro | form helper | Não |
| ContactForm.tsx | form | Sim — `client:load` |
| FAQ.tsx | section | Sim — `client:visible` |
| NewsletterForm.astro | form | Sim — script vanilla (source `tocha_newsletter`) |

## Areas

- **Public site:** home, `/sobre/`, `/blog/*` e paginas de servico.
- **Funnels:** `/video-ia/*`.
- **Members:** `/membros/*`.
- **Admin:** `/admin/*`.
- **Platform:** Supabase, Asaas, Workers, tracking e emails.
