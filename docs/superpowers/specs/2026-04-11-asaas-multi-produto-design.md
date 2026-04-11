# Migração Stripe → Asaas + Multi-Produto

**Data:** 2026-04-11
**Objetivo:** Substituir Stripe pelo Asaas como gateway de pagamento e refatorar o sistema de acesso para suportar múltiplos produtos.

---

## 1. Visão Geral

Trocar o Stripe Checkout por cobranças via API do Asaas (link de pagamento hosted). Simultaneamente, migrar de `profiles.paid = true/false` para um sistema de acessos por produto (`user_access` + `products`), permitindo vender múltiplos infoprodutos no futuro.

### Fluxo de compra

```
Usuário logado clica "Comprar"
    → POST /api/checkout (body: { productSlug })
    → Endpoint busca produto na tabela products
    → Cria cobrança no Asaas via API:
        - customer (email do usuário)
        - value (preço do produto)
        - installmentCount + installmentValue (parcelamento)
        - externalReference (user_id + product_slug)
        - callback/redirect URL
    → Asaas retorna invoiceUrl
    → Redirect para invoiceUrl (página hosted do Asaas)
    → Usuário escolhe forma de pagamento (cartão parcelado, Pix, boleto)
    → Pagamento confirmado → Asaas dispara webhook PAYMENT_RECEIVED
    → Worker recebe → valida token → insere em user_access + payments
    → Usuário redirecionado para /membros/?compra=sucesso
```

---

## 2. Novas Tabelas no Supabase

### products

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  max_installments INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed com o produto atual
INSERT INTO public.products (slug, name, price_cents, max_installments)
VALUES ('maquina-videos', 'Máquina de Produção de Vídeos com IA', 92780, 12);
```

### user_access

```sql
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
```

### payments (ajustada)

```sql
-- Alterar tabela existente
ALTER TABLE public.payments
  DROP COLUMN stripe_session_id,
  ADD COLUMN asaas_payment_id TEXT UNIQUE,
  ADD COLUMN product_slug TEXT NOT NULL DEFAULT 'maquina-videos';
```

---

## 3. Endpoint de Checkout — `/api/checkout.ts`

Recebe `productSlug` no body ou como hidden field do form. Busca o produto na tabela `products`. Cria cobrança no Asaas via API REST.

### API do Asaas — Criar cobrança

```
POST https://api.asaas.com/v3/payments
Headers:
  access_token: $ASAAS_API_KEY
  Content-Type: application/json

Body:
{
  "customer": "<asaas_customer_id>",  // criar customer antes se não existir
  "billingType": "UNDEFINED",         // permite cliente escolher (cartão, pix, boleto)
  "value": 927.80,
  "dueDate": "2026-04-18",           // 7 dias de vencimento
  "description": "Máquina de Produção de Vídeos com IA",
  "externalReference": "<user_id>|<product_slug>",
  "installmentCount": 12,
  "installmentValue": 92.98,
  "callback": {
    "successUrl": "https://ricardotocha.com.br/membros/?compra=sucesso",
    "autoRedirect": true
  }
}
```

### Gestão de Customer no Asaas

O Asaas exige um `customer` para criar cobrança. Fluxo:
1. Buscar customer por email: `GET /v3/customers?email=<email>`
2. Se não existe, criar: `POST /v3/customers` com `{ name, email, cpfCnpj (opcional) }`
3. Usar o `customer.id` retornado na cobrança

Salvar o `asaas_customer_id` na tabela `profiles` para não buscar toda vez.

---

## 4. Webhook Worker (`workers/payment-webhook/`)

Renomear de `stripe-webhook` para `payment-webhook`. Adaptar para Asaas.

### Validação do Asaas

O Asaas envia um token fixo no header `asaas-access-token` que você configura no painel (Configurações → Integrações → Webhooks). O worker compara com a env var `ASAAS_WEBHOOK_TOKEN`.

### Eventos relevantes

- `PAYMENT_CONFIRMED` — cartão de crédito aprovado
- `PAYMENT_RECEIVED` — Pix/boleto compensado

Ambos significam "dinheiro na conta" → liberar acesso.

### Payload do webhook

```json
{
  "event": "PAYMENT_RECEIVED",
  "payment": {
    "id": "pay_abc123",
    "customer": "cus_xyz",
    "value": 927.80,
    "status": "RECEIVED",
    "externalReference": "<user_id>|<product_slug>",
    "paymentDate": "2026-04-11"
  }
}
```

### Lógica do worker

1. Valida `asaas-access-token` header
2. Verifica se `event` é `PAYMENT_CONFIRMED` ou `PAYMENT_RECEIVED`
3. Extrai `user_id` e `product_slug` do `externalReference`
4. Insere em `payments` (asaas_payment_id, user_id, product_slug, amount, status)
5. Insere em `user_access` (user_id, product_slug, payment_id)
6. Retorna 200

---

## 5. Middleware — Controle de Acesso por Produto

### Mapeamento de rotas para produtos

```typescript
const ROUTE_PRODUCT_MAP: Record<string, string> = {
  '/membros/maquina': 'maquina-videos',
  // Futuros produtos adicionados aqui
};
```

### Lógica atualizada

```
Rota começa com /membros/maquina/* ?
  → Busca user_access WHERE user_id = session.user.id AND product_slug = 'maquina-videos'
  → Se não tem acesso → redirect /membros/?acesso=bloqueado
  → Se tem → passa
```

---

## 6. Mudanças em `src/lib/auth.ts`

### Nova função: `getUserAccess`

```typescript
export async function getUserAccess(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('user_access')
    .select('product_slug')
    .eq('user_id', userId);
  return data?.map(r => r.product_slug) || [];
}

export function hasAccess(accessList: string[], productSlug: string): boolean {
  return accessList.includes(productSlug);
}
```

### Manter compatibilidade temporária

O campo `profiles.paid` continua existindo mas não é mais a fonte de verdade. O middleware usa `user_access`. Após migrar usuários existentes (se houver pagantes), remover o campo.

---

## 7. Mudanças no Dashboard

O `Dashboard.tsx` recebe `accessSlugs: string[]` em vez de `paid: boolean`.

```typescript
// Antes
const isPaid = paid;

// Depois
const hasProductAccess = accessSlugs.includes('maquina-videos');
```

O CTA de checkout envia o `productSlug`:
```html
<form method="POST" action="/api/checkout">
  <input type="hidden" name="productSlug" value="maquina-videos" />
  <button>[ Desbloquear — 12x R$ 92,98 ]</button>
</form>
```

---

## 8. Mudanças na Página de Oferta

O form na `/video-ia/oferta/` também envia `productSlug`:
```html
<form method="POST" action="/api/checkout">
  <input type="hidden" name="productSlug" value="maquina-videos" />
  <button>[ Quero a Máquina ]</button>
</form>
```

---

## 9. Variáveis de Ambiente

### Cloudflare Pages (tocha-site)

| Remover | Adicionar |
|---------|-----------|
| `STRIPE_SECRET_KEY` | `ASAAS_API_KEY` |
| `STRIPE_PUBLISHABLE_KEY` | — |
| `STRIPE_PRICE_ID` | — |

### Worker (payment-webhook)

| Remover | Adicionar |
|---------|-----------|
| `STRIPE_WEBHOOK_SECRET` | `ASAAS_WEBHOOK_TOKEN` |

Manter: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## 10. Migração de Dados

Se já houver usuários com `paid=true`:
```sql
INSERT INTO user_access (user_id, product_slug)
SELECT id, 'maquina-videos' FROM profiles WHERE paid = true
ON CONFLICT DO NOTHING;
```

---

## 11. Ambiente Asaas

- **Sandbox:** `https://sandbox.asaas.com/api/v3/`
- **Produção:** `https://api.asaas.com/v3/`

Usar sandbox para testes. A API key de sandbox tem prefixo `$aact_` diferente da produção.

---

## 12. Remoções

Após a migração:
- Remover pacote `stripe` do `package.json`
- Remover `STRIPE_*` do `src/env.d.ts`
- Remover referências ao Stripe nos docs
- Eventualmente remover `profiles.paid` (após confirmar migração de dados)

---

## 13. Fora do escopo

- UI de "meus pedidos" ou histórico de pagamentos para o aluno
- Reembolso automático via API
- Notificações por email de pagamento (Asaas já faz isso nativamente)
- Cupons de desconto (pode ser adicionado depois via API do Asaas)
