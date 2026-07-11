-- ============================================================
-- LinkSplit — schema do banco (Postgres / Supabase)
-- Cole no SQL Editor do Supabase e execute.
-- ============================================================

create extension if not exists "pgcrypto";

-- Projetos: metadados reutilizáveis p/ gerar UTMs (abrev/idioma/país).
create table if not exists projects (
  id         uuid primary key default gen_random_uuid(),
  code       text,
  name       text not null,
  domain     text not null,
  abbr       text not null,        -- utm_source
  language   text not null,        -- idioma (ex: el)
  country    text not null,        -- país   (ex: gr)
  created_at timestamptz not null default now()
);

-- Pixels do Facebook (biblioteca reutilizável).
create table if not exists pixels (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  pixel_id    text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- Campanhas (cada uma gera um link curto /<slug>).
create table if not exists campaigns (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  rotation_counter  bigint not null default 0,
  filter_bots       boolean not null default true,
  bot_fallback_url  text,
  facebook_pixel_id text,                          -- split "CP" quando preenchido
  project_id        uuid references projects(id) on delete set null,
  split_number      int,                            -- Nº do split (p/ UTM)
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

-- Páginas de destino de cada campanha.
create table if not exists links (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  url         text not null,        -- URL final (com UTM quando há projeto)
  base_url    text,                  -- URL base informada (quando há projeto)
  post_id     text,                  -- Post ID do WordPress (buscado automático)
  position    int  not null,
  weight      int  not null default 1,  -- iguais => divisão igual; 4/3/3 => 40/30/30
  created_at  timestamptz not null default now()
);
create index if not exists links_campaign_idx on links(campaign_id, position);

-- Registro de cada acesso (para as estatísticas).
create table if not exists clicks (
  id          bigserial primary key,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  link_id     uuid references links(id) on delete set null,
  is_bot      boolean not null default false,
  user_agent  text,
  referrer    text,
  ip_hash     text,
  country     text,
  created_at  timestamptz not null default now()
);
create index if not exists clicks_campaign_idx on clicks(campaign_id, created_at);

-- Observação: a rotação é feita na aplicação (contagem de cliques humanos %
-- schedule de pesos), usando apenas SELECT/INSERT. Não há dependência de RPC.
