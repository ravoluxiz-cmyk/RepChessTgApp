create table if not exists public.support_requests (
  id bigserial primary key,
  user_name text not null default 'Гость',
  user_contact text,
  telegram_id bigint,
  username text,
  question text not null,
  bot_answer text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'done')),
  source text not null default 'chat_bot',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_requests_status_idx on public.support_requests (status, created_at desc);
create index if not exists support_requests_telegram_idx on public.support_requests (telegram_id);

alter table public.support_requests enable row level security;

drop policy if exists "support_requests_service_role_all" on public.support_requests;
create policy "support_requests_service_role_all"
on public.support_requests
for all
to service_role
using (true)
with check (true);
