-- Business requests, rating moderation, attendance accounting, and admin stats support.

alter table public.users
  alter column rating set default 1500;

update public.users
set rating = 1500
where rating is null or rating = 800;

alter table public.tournament_registrations
  add column if not exists attendance_status text not null default 'registered',
  add column if not exists result_place integer,
  add column if not exists result_points numeric,
  add column if not exists admin_note text,
  add column if not exists attended_at timestamptz;

alter table public.tournament_registrations
  drop constraint if exists tournament_registrations_attendance_status_check;

alter table public.tournament_registrations
  add constraint tournament_registrations_attendance_status_check
  check (attendance_status in ('registered', 'attended', 'no_show'));

create table if not exists public.rating_requests (
  id bigserial primary key,
  user_id bigint references public.users(id) on delete set null,
  user_telegram_id bigint not null,
  user_name text not null,
  platform text not null,
  profile_url text not null,
  status text not null default 'pending',
  requested_rating integer,
  approved_rating integer,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rating_requests_platform_check check (platform in ('lichess', 'chesscom')),
  constraint rating_requests_status_check check (status in ('pending', 'approved', 'rejected')),
  constraint rating_requests_rating_check check (
    approved_rating is null or (approved_rating between 100 and 3000)
  )
);

create index if not exists rating_requests_status_created_at_idx
  on public.rating_requests(status, created_at desc);

create index if not exists rating_requests_user_telegram_id_idx
  on public.rating_requests(user_telegram_id);

create table if not exists public.partnership_requests (
  id bigserial primary key,
  name text not null,
  company text not null,
  contact text not null,
  format text not null,
  people_count integer,
  comment text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partnership_requests_status_check check (status in ('new', 'in_progress', 'done', 'rejected'))
);

create index if not exists partnership_requests_status_created_at_idx
  on public.partnership_requests(status, created_at desc);

create table if not exists public.lesson_requests (
  id bigserial primary key,
  name text,
  contact text,
  format text,
  level text,
  comment text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.merch_orders (
  id bigserial primary key,
  user_name text,
  contact text,
  item_id text,
  item_title text,
  price integer,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.rating_requests enable row level security;
alter table public.partnership_requests enable row level security;
alter table public.lesson_requests enable row level security;
alter table public.merch_orders enable row level security;

-- The app writes and reads these tables through server-side route handlers
-- using the service role. RLS is enabled to prevent accidental browser access.
