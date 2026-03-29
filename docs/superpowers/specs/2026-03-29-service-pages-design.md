# Páginas de Serviço — ricardotocha.com.br

## Contexto

O site ricardotocha.com.br posiciona Ricardo como consultor que constrói infraestrutura de IA para empresas B2B (5M+/ano). O site atual tem 3 páginas e apresenta 4 ferramentas como cards na seção "A Infraestrutura" da homepage, linkando para sites externos (athena.app.br, apolo.api.br, apexmkt.ia.br, /video-ia/).

**Problema:** O site tem apenas 3 URLs indexáveis. As ferramentas linkam para sites externos que as posicionam como SaaS standalone, sem conexão com a consultoria de Ricardo.

**Objetivo:** Criar 3 páginas internas de serviço que posicionam cada ferramenta como parte da intervenção estratégica de Ricardo, aumentam o volume de páginas para SEO, e constroem a narrativa de ecossistema integrado.

## Decisões de Design

- **Persona:** Empresário B2B (faturamento +5M/ano), tom industrial/direto da brand guide
- **Conversão:** Todas as páginas direcionam para `/#auditoria` (formulário da home)
- **Escopo:** 3 páginas (Athena, Apolo, ApexMKT). Máquina de Vídeo já tem /video-ia/

## URLs

| Página | Slug | Ferramenta | SEO Target |
|--------|------|------------|------------|
| Auditoria Comercial | `/auditoria-comercial-ia/` | Athena | auditoria comercial ia, monitorar conversas whatsapp vendas |
| Prospecção WhatsApp | `/prospeccao-whatsapp-ia/` | Apolo | prospecção whatsapp automatizada, captura leads grupos whatsapp |
| Operações Marketing | `/operacoes-marketing-ia/` | ApexMKT | assistente ia agencia marketing, automação operações agência |

Slugs baseados em intenção/benefício, não no nome da ferramenta. Diferencia dos sites externos que são brand-first.

## Estrutura de Página (compartilhada)

Cada página segue a mesma estrutura de 7 seções:

### 1. Nav
Mesmo pattern da homepage: logo + botão "Iniciar Diagnóstico" → `/#auditoria`. Inclui link "← Voltar para Home" como na /reduzir-churn-agencias/.

### 2. Hero
- **Badge:** Nome da ferramenta + domínio em font-mono amarelo (ex: `ATHENA • athena.app.br`)
- **Headline (h1):** Resultado de negócio, não nome do produto. Ex: "100% das conversas de vendas auditadas por IA."
- **Subhead:** 2-3 linhas explicando como isso se conecta ao trabalho de Ricardo
- **CTA:** "Aplicar para Intervenção Estratégica" → `/#auditoria`
- **Nota:** "Também disponível como SaaS standalone em [domínio]" — link externo secundário

### 3. O Problema (3 cards)
Grid de 3 cards no pattern da homepage (ícone SVG + título + texto). Cada card descreve uma dor específica que essa ferramenta resolve.

**Athena:**
1. Operação no escuro — diretoria não audita conversas de vendas
2. CRM mentiroso — vendedores preenchem dados incorretos
3. SLAs quebrados — leads esfriando sem resposta adequada

**Apolo:**
1. Prospecção manual — equipe perde horas em grupos sem resultado
2. Timing errado — lead posta no grupo, concorrente responde primeiro
3. Custo por lead alto — dependência total de tráfego pago

**ApexMKT:**
1. Gargalo operacional — cada campanha exige 5 pessoas e 3 dias
2. Retrabalho constante — briefings perdidos, tarefas duplicadas
3. Margem comprimida — custo operacional cresce mais rápido que receita

### 4. A Intervenção
Como Ricardo instala e opera essa ferramenta. Não é "como o SaaS funciona" — é "como o arquiteto implanta isso na sua operação."

Formato: 3-4 steps verticais (parecido com "como funciona" das landing pages externas, mas em linguagem de consultoria).

**Athena:**
1. Diagnóstico de SLAs — mapeamento dos gargalos atuais
2. Instalação do Athena — interceptação de 100% das conversas
3. Cruzamento com CRM — dados reais vs. dados reportados
4. Dashboard para diretoria — raio-x semanal de aderência ao playbook

**Apolo:**
1. Mapeamento de grupos — identificar os grupos com maior concentração de leads
2. Definição de gatilhos — configurar palavras-chave de intenção de compra
3. Ativação do monitoramento 24/7 — IA analisa e aborda automaticamente
4. Otimização contínua — refinar gatilhos com base nos resultados

**ApexMKT:**
1. Auditoria de processos — mapear fluxos operacionais existentes
2. Design de assistentes — criar agentes IA por função (briefing, copy, relatórios)
3. Implantação gradual — cada operador ganha seu assistente
4. Medição de impacto — horas economizadas, entregas por ciclo

### 5. Prova (Case Study)
Reutiliza o conteúdo dos cases da homepage, com o mesmo formato (O Sangramento, A Intervenção, O Lucro Protegido).

| Página | Case | Razão |
|--------|------|-------|
| Athena | IBREP | Auditoria de corretores, cruzamento com CRM |
| Apolo | Rezultz | War Room de vendas, prospecção |
| ApexMKT | Plana Ambiental | Orquestração agêntica, fusão de departamentos |

### 6. Ecossistema (componente ServiceEcosystem.astro)
Seção que conecta as páginas entre si:
- Título: "Uma peça da infraestrutura."
- Subtítulo: "Cada ferramenta resolve uma camada. Juntas, elas descolam a receita da folha de pagamento."
- 2 cards das outras ferramentas (mesmo formato dos cards do arsenal da homepage, mas linkando para páginas internas)

**Props do componente:**
- `currentTool`: string — nome da ferramenta atual (para excluir do grid)

### 7. CTA (componente ServiceCTA.astro)
Seção final compartilhada, sem props:
- Headline: "Sua operação suporta uma auditoria?"
- Texto: mesmo da homepage
- Botão: "Aplicar para Intervenção Estratégica" → `/#auditoria`

## Mudanças em Arquivos Existentes

### Homepage (src/pages/index.astro)
**Seção Arsenal (linhas ~120-204):** Mudar links dos 3 primeiros cards (Athena, Apolo, ApexMKT) de externos para internos:
- Athena: `href="https://athena.app.br/"` → `href="/auditoria-comercial-ia/"`
- Apolo: `href="https://apolo.api.br/"` → `href="/prospeccao-whatsapp-ia/"`
- ApexMKT: `href="https://apexmkt.ia.br/"` → `href="/operacoes-marketing-ia/"`

Adicionar link secundário externo abaixo: "Acesse o SaaS →" com ícone de external link.

O card do Máquina de Vídeo mantém `/video-ia/` (já é interno).

### Footer (src/layouts/Layout.astro, linhas ~90-108)
- Athena: `href="https://athena.app.br/"` → `href="/auditoria-comercial-ia/"`
- Apolo: `href="https://apolo.api.br/"` → `href="/prospeccao-whatsapp-ia/"`
- ApexMKT "em breve" → link ativo para `/operacoes-marketing-ia/`

## Arquivos Novos

```
docs/copy/auditoria-comercial-ia.md       ← Source of truth do copy (Athena)
docs/copy/prospeccao-whatsapp-ia.md       ← Source of truth do copy (Apolo)
docs/copy/operacoes-marketing-ia.md       ← Source of truth do copy (ApexMKT)
src/components/service/ServiceEcosystem.astro  ← Cross-linking entre ferramentas
src/components/service/ServiceCTA.astro        ← CTA compartilhado
src/pages/auditoria-comercial-ia/index.astro   ← Página Athena
src/pages/prospeccao-whatsapp-ia/index.astro   ← Página Apolo
src/pages/operacoes-marketing-ia/index.astro   ← Página ApexMKT
```

## Convenções (por CLAUDE.md do projeto)

- Copy source of truth em `docs/copy/[slug].md`
- Páginas em kebab-case com `index.astro`
- Componentes em PascalCase
- Tailwind utility classes only, sem CSS custom
- Em `<style>` scoped, usar `@reference "../styles/global.css"` antes de `@apply`
- Brand: preto #0A0A0A, amarelo #EAB308, Space Grotesk headings, Inter body
- Imagens em `src/assets/` com `<Image />` do Astro

## Verificação

1. `npm run build` — deve gerar 6 páginas (home, reduzir-churn, video-ia + 3 novas)
2. Verificar que cada nova página tem title, description e canonical corretos
3. Confirmar que links da homepage apontam para páginas internas
4. Confirmar que links do footer estão atualizados
5. Verificar cross-links do ServiceEcosystem em cada página
6. `npx tsc --noEmit` — zero erros
7. Testar responsividade mobile das novas páginas
