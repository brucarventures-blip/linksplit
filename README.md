# LinkSplit — Rotador de Links

Distribui o tráfego das suas campanhas (Facebook Ads etc.) **igualmente** entre
várias páginas de destino, com **filtro de bots** para manter a divisão exata.

- 4 links → 25% cada · 5 links → 20% cada (rotação **round-robin exata**, não é aleatório).
- Filtro de bots: o robô do Facebook (`facebookexternalhit`) e outros crawlers
  **não gastam rotação** — só humanos reais entram na divisão. Isso mantém os
  25%/25%/... corretos e as estatísticas limpas.
- Dashboard: criar campanhas, copiar o link curto, ver cliques e distribuição.

> Escopo: filtra **robôs automáticos**. Não há (nem terá) qualquer mecanismo para
> mostrar página diferente a pessoas reais ou burlar a revisão de anúncios.

## Como funciona

1. Você cria uma campanha com N páginas → o app gera um link `.../r/<slug>`.
2. Você cola esse link no anúncio.
3. A cada clique humano, o motor pega a **próxima** página no ciclo
   (1→2→3→4→1→2...), garantindo distribuição igual. Bots vão para uma página
   neutra sem contar.

## Stack

- **Next.js 14** (App Router) — dashboard + API + motor de redirect.
- **Supabase (Postgres)** — campanhas, links, cliques; rotação atômica via função `pick_link`.
- Deploy recomendado: **Vercel**.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000
```

## Configurar o banco (Supabase)

1. Crie um projeto em supabase.com.
2. SQL Editor → cole e rode `supabase/schema.sql`.
3. Project Settings → API → copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (secreta, só no servidor)

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | URL pública do app (monta o link curto). |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service-role (nunca exponha no browser). |
| `IP_SALT` | (opcional) sal para anonimizar IP nas estatísticas. |

## Deploy na Vercel

1. Suba o projeto num repositório Git e importe na Vercel (ou use a CLI).
2. Configure as 3 variáveis acima em Project Settings → Environment Variables.
3. Deploy. Aponte um domínio e ajuste `NEXT_PUBLIC_BASE_URL` para ele.

## Testes

```bash
npm test
```

Verifica a distribuição exata (4 e 5 links) e o reconhecimento de bots vs. humanos.

## Estrutura

```
app/
  r/[slug]/route.ts        # motor de redirect (rotação + filtro de bots)
  api/campaigns/...        # criar / pausar / excluir campanhas
  dashboard/...            # painel e estatísticas
lib/
  bots.ts                  # detecção de crawlers
  supabaseServer.ts        # cliente Supabase (service-role)
  hash.ts                  # anonimização de IP
supabase/schema.sql        # tabelas + função pick_link (round-robin atômico)
tests/logic.test.js        # provas da lógica
```

## Ideias de evolução (a discutir)

- Pesos personalizados (ex: 40/30/30) além da divisão igual.
- Targeting por país / dispositivo / idioma.
- Cap por página (parar de enviar quando atingir X cliques).
- Detecção de bots por IP de datacenter, não só user-agent.
- Autenticação (login) no dashboard para multiusuário.
