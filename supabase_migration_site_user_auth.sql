-- Site login/password accounts for Rep Chess KRD browser profiles.
-- Run this once in Supabase SQL Editor before using /login in production.

create table if not exists public.site_user_accounts (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  login text not null,
  password_hash text not null,
  password_salt text not null,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_user_accounts_login_unique unique (login),
  constraint site_user_accounts_user_unique unique (user_id),
  constraint site_user_accounts_login_format check (login ~ '^[a-z0-9_.-]{3,32}$')
);

create index if not exists site_user_accounts_user_id_idx
  on public.site_user_accounts(user_id);

create table if not exists public.site_user_sessions (
  id bigserial primary key,
  account_id bigint not null references public.site_user_accounts(id) on delete cascade,
  session_hash text not null,
  user_agent text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint site_user_sessions_hash_unique unique (session_hash)
);

create index if not exists site_user_sessions_account_id_idx
  on public.site_user_sessions(account_id);

create index if not exists site_user_sessions_expires_at_idx
  on public.site_user_sessions(expires_at);

alter table public.site_user_accounts enable row level security;
alter table public.site_user_sessions enable row level security;

-- These tables are intentionally managed only by Next.js server routes with the service role key.
revoke all on table public.site_user_accounts from anon, authenticated;
revoke all on table public.site_user_sessions from anon, authenticated;
