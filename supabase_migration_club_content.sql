create table if not exists public.club_content (
  id bigserial primary key,
  type text not null check (type in ('honor', 'news', 'lecture', 'rules', 'review')),
  title text not null,
  subtitle text,
  body text,
  image_url text,
  external_url text,
  author_name text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 100,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists club_content_type_idx on public.club_content (type);
create index if not exists club_content_public_idx on public.club_content (is_published, sort_order, created_at desc);

alter table public.club_content enable row level security;

drop policy if exists "club_content_service_role_all" on public.club_content;
create policy "club_content_service_role_all"
on public.club_content
for all
to service_role
using (true)
with check (true);

insert into public.club_content (
  type,
  title,
  subtitle,
  body,
  is_published,
  is_featured,
  sort_order,
  published_at
)
select *
from (
  values
    (
      'rules',
      'Недушные шахматы',
      'Главные ценности: кайф, комьюнити и шахматы.',
      'Играем честно, уважительно и без лишнего давления. У нас нет культа правила «тронул - ходи»: если ситуация не влияет на партию и не ломает вайб, сначала разговариваем по-человечески. Спорные моменты решает организатор.',
      true,
      true,
      10,
      now()
    ),
    (
      'honor',
      'Легенды клубного вечера',
      'Здесь будут лучшие участники, победители и самые активные игроки.',
      'Доска почета может отмечать не только рейтинг, но и посещаемость, спортивный прогресс, честную игру, помощь комьюнити и яркие партии.',
      true,
      true,
      20,
      now()
    ),
    (
      'lecture',
      'Лекции Rep Chess KRD',
      'Место для материалов в стиле лекции Алексея.',
      'Можно публиковать анонсы лекций, тезисы, ссылки на записи, подборки позиций и короткие заметки после встречи.',
      true,
      false,
      30,
      now()
    ),
    (
      'review',
      'Отзывы участников',
      'Живые впечатления о турнирах, людях и атмосфере.',
      'После турниров сюда можно добавлять лучшие отзывы и закреплять те, которые точнее всего передают настроение клуба.',
      true,
      false,
      40,
      now()
    )
) as seed(type, title, subtitle, body, is_published, is_featured, sort_order, published_at)
where not exists (
  select 1
  from public.club_content existing
  where existing.type = seed.type
    and existing.title = seed.title
);
