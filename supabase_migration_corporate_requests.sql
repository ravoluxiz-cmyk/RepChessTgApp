create table if not exists public.corporate_requests (
  id bigserial primary key,
  name text not null,
  company text not null,
  contact text not null,
  email text,
  participants_count integer,
  format_interest text not null,
  comment text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint corporate_requests_status_check check (status in ('new', 'in_progress', 'done', 'rejected')),
  constraint corporate_requests_participants_check check (participants_count is null or participants_count > 0)
);

create index if not exists corporate_requests_status_created_at_idx
  on public.corporate_requests(status, created_at desc);

create index if not exists corporate_requests_company_idx
  on public.corporate_requests(company);

alter table public.corporate_requests enable row level security;

revoke all on table public.corporate_requests from anon, authenticated;
grant select, insert, update, delete on table public.corporate_requests to service_role;

drop policy if exists "corporate_requests_service_role_all" on public.corporate_requests;
create policy "corporate_requests_service_role_all"
on public.corporate_requests
for all
to service_role
using (true)
with check (true);
