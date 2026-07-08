-- Rep Chess OS: private operational workspace for admin-only internal planning.

create extension if not exists pgcrypto;

create or replace function public.repchess_os_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.repchess_os_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  area text,
  priority text not null default 'Medium',
  status text not null default 'Inbox',
  due_date date,
  owner text,
  related_type text,
  related_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint repchess_os_tasks_priority_check check (priority in ('Low', 'Medium', 'High', 'Critical')),
  constraint repchess_os_tasks_status_check check (status in ('Inbox', 'Сегодня', 'Эта неделя', 'В работе', 'Ожидание ответа', 'Готово', 'Отложено'))
);

create table if not exists public.repchess_os_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  segment text,
  status text not null default 'Новый лид',
  contact_name text,
  contact_role text,
  telegram text,
  phone text,
  email text,
  website text,
  source text,
  potential_value numeric not null default 0,
  probability numeric not null default 0,
  next_action text,
  next_action_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint repchess_os_leads_status_check check (status in ('Новый лид', 'Контакт найден', 'Первое сообщение отправлено', 'Ответили', 'Созвон / встреча', 'КП отправлено', 'Переговоры', 'Сделка выиграна', 'Сделка проиграна', 'Пауза')),
  constraint repchess_os_leads_probability_check check (probability >= 0 and probability <= 100)
);

create table if not exists public.repchess_os_directions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  goal text,
  target_revenue numeric not null default 0,
  current_status text,
  main_metric text,
  risks text,
  next_step text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.repchess_os_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  horizon text not null,
  direction text,
  description text,
  target_result text,
  target_date date,
  status text not null default 'Не начато',
  priority text not null default 'Medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint repchess_os_plans_horizon_check check (horizon in ('Краткосрочный', 'Среднесрочный', 'Долгосрочный')),
  constraint repchess_os_plans_status_check check (status in ('Не начато', 'В работе', 'Есть прогресс', 'Выполнено', 'Пауза', 'Отменено')),
  constraint repchess_os_plans_priority_check check (priority in ('Low', 'Medium', 'High', 'Critical'))
);

create table if not exists public.repchess_os_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text,
  venue text,
  date date,
  time text,
  format text,
  control text,
  rounds integer,
  host text,
  fixed_fee numeric not null default 0,
  expected_participants integer,
  actual_participants integer,
  status text not null default 'Запланирован',
  swiss_link text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint repchess_os_events_type_check check (event_type is null or event_type in ('Regular', 'Special', 'Corporate', 'Education', 'Rating', 'Big Event', 'Festival')),
  constraint repchess_os_events_status_check check (status in ('Запланирован', 'В подготовке', 'Проведён', 'Перенесён', 'Отменён'))
);

create table if not exists public.repchess_os_event_checklist_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.repchess_os_events(id) on delete cascade,
  stage text,
  title text not null,
  status text not null default 'Не начато',
  owner text,
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint repchess_os_event_checklist_stage_check check (stage is null or stage in ('За 7+ дней', 'За 3-5 дней', 'За 1 день', 'В день турнира', 'После турнира')),
  constraint repchess_os_event_checklist_status_check check (status in ('Не начато', 'В работе', 'Готово', 'Не требуется', 'Проблема'))
);

create table if not exists public.repchess_os_finance_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  type text not null,
  source text,
  direction text,
  amount numeric not null default 0,
  cheslav_share numeric not null default 0,
  ilya_share numeric not null default 0,
  expense_category text,
  related_event_id uuid references public.repchess_os_events(id) on delete set null,
  related_lead_id uuid references public.repchess_os_leads(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint repchess_os_finance_type_check check (type in ('Income', 'Expense'))
);

create table if not exists public.repchess_os_weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end date not null,
  events_count integer not null default 0,
  participants_count integer not null default 0,
  revenue numeric not null default 0,
  cheslav_income numeric not null default 0,
  new_subscribers integer not null default 0,
  new_leads integer not null default 0,
  proposals_sent integer not null default 0,
  meetings_count integer not null default 0,
  deals_won integer not null default 0,
  what_worked text,
  what_failed text,
  next_week_focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.repchess_os_message_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  body text not null,
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  effectiveness text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint repchess_os_message_templates_effectiveness_check check (effectiveness in ('unknown', 'good', 'bad'))
);

create index if not exists repchess_os_tasks_status_due_idx on public.repchess_os_tasks (status, due_date);
create index if not exists repchess_os_tasks_area_priority_idx on public.repchess_os_tasks (area, priority);
create index if not exists repchess_os_leads_status_next_action_idx on public.repchess_os_leads (status, next_action_date);
create index if not exists repchess_os_leads_segment_idx on public.repchess_os_leads (segment);
create index if not exists repchess_os_plans_horizon_direction_idx on public.repchess_os_plans (horizon, direction);
create index if not exists repchess_os_plans_status_target_idx on public.repchess_os_plans (status, target_date);
create index if not exists repchess_os_events_date_idx on public.repchess_os_events (date, status);
create index if not exists repchess_os_checklist_event_idx on public.repchess_os_event_checklist_items (event_id, stage);
create index if not exists repchess_os_finance_date_idx on public.repchess_os_finance_entries (date, type);
create index if not exists repchess_os_weekly_reviews_start_idx on public.repchess_os_weekly_reviews (week_start desc);
create index if not exists repchess_os_message_templates_category_idx on public.repchess_os_message_templates (category, is_favorite);

drop trigger if exists repchess_os_tasks_touch_updated_at on public.repchess_os_tasks;
create trigger repchess_os_tasks_touch_updated_at
before update on public.repchess_os_tasks
for each row execute function public.repchess_os_touch_updated_at();

drop trigger if exists repchess_os_leads_touch_updated_at on public.repchess_os_leads;
create trigger repchess_os_leads_touch_updated_at
before update on public.repchess_os_leads
for each row execute function public.repchess_os_touch_updated_at();

drop trigger if exists repchess_os_directions_touch_updated_at on public.repchess_os_directions;
create trigger repchess_os_directions_touch_updated_at
before update on public.repchess_os_directions
for each row execute function public.repchess_os_touch_updated_at();

drop trigger if exists repchess_os_plans_touch_updated_at on public.repchess_os_plans;
create trigger repchess_os_plans_touch_updated_at
before update on public.repchess_os_plans
for each row execute function public.repchess_os_touch_updated_at();

drop trigger if exists repchess_os_events_touch_updated_at on public.repchess_os_events;
create trigger repchess_os_events_touch_updated_at
before update on public.repchess_os_events
for each row execute function public.repchess_os_touch_updated_at();

drop trigger if exists repchess_os_event_checklist_touch_updated_at on public.repchess_os_event_checklist_items;
create trigger repchess_os_event_checklist_touch_updated_at
before update on public.repchess_os_event_checklist_items
for each row execute function public.repchess_os_touch_updated_at();

drop trigger if exists repchess_os_finance_touch_updated_at on public.repchess_os_finance_entries;
create trigger repchess_os_finance_touch_updated_at
before update on public.repchess_os_finance_entries
for each row execute function public.repchess_os_touch_updated_at();

drop trigger if exists repchess_os_weekly_reviews_touch_updated_at on public.repchess_os_weekly_reviews;
create trigger repchess_os_weekly_reviews_touch_updated_at
before update on public.repchess_os_weekly_reviews
for each row execute function public.repchess_os_touch_updated_at();

drop trigger if exists repchess_os_message_templates_touch_updated_at on public.repchess_os_message_templates;
create trigger repchess_os_message_templates_touch_updated_at
before update on public.repchess_os_message_templates
for each row execute function public.repchess_os_touch_updated_at();

alter table public.repchess_os_tasks enable row level security;
alter table public.repchess_os_leads enable row level security;
alter table public.repchess_os_directions enable row level security;
alter table public.repchess_os_plans enable row level security;
alter table public.repchess_os_events enable row level security;
alter table public.repchess_os_event_checklist_items enable row level security;
alter table public.repchess_os_finance_entries enable row level security;
alter table public.repchess_os_weekly_reviews enable row level security;
alter table public.repchess_os_message_templates enable row level security;

revoke all on table public.repchess_os_tasks from anon, authenticated;
revoke all on table public.repchess_os_leads from anon, authenticated;
revoke all on table public.repchess_os_directions from anon, authenticated;
revoke all on table public.repchess_os_plans from anon, authenticated;
revoke all on table public.repchess_os_events from anon, authenticated;
revoke all on table public.repchess_os_event_checklist_items from anon, authenticated;
revoke all on table public.repchess_os_finance_entries from anon, authenticated;
revoke all on table public.repchess_os_weekly_reviews from anon, authenticated;
revoke all on table public.repchess_os_message_templates from anon, authenticated;

grant select, insert, update, delete on table public.repchess_os_tasks to service_role;
grant select, insert, update, delete on table public.repchess_os_leads to service_role;
grant select, insert, update, delete on table public.repchess_os_directions to service_role;
grant select, insert, update, delete on table public.repchess_os_plans to service_role;
grant select, insert, update, delete on table public.repchess_os_events to service_role;
grant select, insert, update, delete on table public.repchess_os_event_checklist_items to service_role;
grant select, insert, update, delete on table public.repchess_os_finance_entries to service_role;
grant select, insert, update, delete on table public.repchess_os_weekly_reviews to service_role;
grant select, insert, update, delete on table public.repchess_os_message_templates to service_role;

drop policy if exists "repchess_os_tasks_service_role_all" on public.repchess_os_tasks;
create policy "repchess_os_tasks_service_role_all" on public.repchess_os_tasks
for all to service_role using (true) with check (true);

drop policy if exists "repchess_os_leads_service_role_all" on public.repchess_os_leads;
create policy "repchess_os_leads_service_role_all" on public.repchess_os_leads
for all to service_role using (true) with check (true);

drop policy if exists "repchess_os_directions_service_role_all" on public.repchess_os_directions;
create policy "repchess_os_directions_service_role_all" on public.repchess_os_directions
for all to service_role using (true) with check (true);

drop policy if exists "repchess_os_plans_service_role_all" on public.repchess_os_plans;
create policy "repchess_os_plans_service_role_all" on public.repchess_os_plans
for all to service_role using (true) with check (true);

drop policy if exists "repchess_os_events_service_role_all" on public.repchess_os_events;
create policy "repchess_os_events_service_role_all" on public.repchess_os_events
for all to service_role using (true) with check (true);

drop policy if exists "repchess_os_checklist_service_role_all" on public.repchess_os_event_checklist_items;
create policy "repchess_os_checklist_service_role_all" on public.repchess_os_event_checklist_items
for all to service_role using (true) with check (true);

drop policy if exists "repchess_os_finance_service_role_all" on public.repchess_os_finance_entries;
create policy "repchess_os_finance_service_role_all" on public.repchess_os_finance_entries
for all to service_role using (true) with check (true);

drop policy if exists "repchess_os_weekly_reviews_service_role_all" on public.repchess_os_weekly_reviews;
create policy "repchess_os_weekly_reviews_service_role_all" on public.repchess_os_weekly_reviews
for all to service_role using (true) with check (true);

drop policy if exists "repchess_os_message_templates_service_role_all" on public.repchess_os_message_templates;
create policy "repchess_os_message_templates_service_role_all" on public.repchess_os_message_templates
for all to service_role using (true) with check (true);

insert into public.repchess_os_directions (name, description, goal, target_revenue, current_status, main_metric, risks, next_step)
values
  ('Regular Events', 'Регулярные турниры и площадки', 'Стабильная сетка турниров без операционного перегрева', 0, 'Работает, но требует новой экономики', 'events/month', 'Фиксированные платежи могут не покрывать время команды', 'Пересобрать модель регулярных турниров'),
  ('Corporate', 'Корпоративные турниры и тимбилдинги', 'Сделать corporate основным платным направлением', 0, 'Нужно упаковать КП и список лидов', 'pipeline value', 'Длинный цикл продаж и нет системного follow-up', 'Собрать КП для корпоративов'),
  ('Education', 'Школы, кружки, уроки и образовательные партнёрства', 'Запустить понятный образовательный продукт', 0, 'Идея есть, упаковка требует сборки', 'qualified leads', 'Сложная логистика преподавателей и расписания', 'Собрать КП для школ'),
  ('Big Events / ТЦ', 'ТЦ, городские и крупные публичные события', 'Продавать шахматы как городской интерактив', 0, 'Нужно собрать контакты и сценарии', 'meetings/month', 'Высокие ожидания к продакшену', 'Собрать список ТЦ и event-контактов'),
  ('Developers / ЖК', 'Девелоперы, ЖК и соседские комьюнити', 'Продавать шахматы как инструмент комьюнити в ЖК', 0, 'Направление в разведке', 'warm contacts', 'Нужен понятный кейс и чек-лист запуска', 'Собрать первые контакты девелоперов'),
  ('Rating Tournaments', 'Рейтинговые турниры и федерационная связка', 'Сделать рейтинг понятной платной ценностью', 0, 'Нужно согласование порядка', 'rating events/month', 'Регламент и коммуникация с федерацией', 'Согласовать порядок рейтингового турнира с федерацией'),
  ('Grants', 'Гранты и институциональные заявки', 'Находить финансирование для городских шахматных проектов', 0, 'Нет регулярного пайплайна', 'submitted grants', 'Высокая бумажная нагрузка', 'Собрать календарь грантов'),
  ('Media / Telegram Growth', 'Медиа, Telegram и рост аудитории', 'Растить аудиторию и конвертировать её в продукты', 0, 'Канал работает, нужна система рубрик', 'new subscribers/week', 'Контент может съедать операционное время', 'Собрать недельную сетку контента')
on conflict (name) do nothing;

insert into public.repchess_os_tasks (title, area, priority, status, due_date, owner)
select title, area, priority, status, due_date, owner
from (
  values
    ('Собрать КП для корпоративов', 'Corporate', 'High', 'Сегодня', current_date, 'Чеслав'),
    ('Собрать КП для школ', 'Education', 'High', 'Эта неделя', current_date + 3, 'Чеслав'),
    ('Собрать таблицу 50 corporate-лидов', 'Corporate', 'High', 'В работе', current_date + 7, 'Чеслав'),
    ('Собрать таблицу 30 education-лидов', 'Education', 'High', 'Эта неделя', current_date + 7, 'Чеслав'),
    ('Собрать список 10 ТЦ и event-контактов', 'Big Events / ТЦ', 'High', 'Эта неделя', current_date + 6, 'Чеслав'),
    ('Вернуться к TOP IT SCHOOL', 'Education', 'Medium', 'Ожидание ответа', current_date + 1, 'Чеслав'),
    ('Вернуться к IT-компании через Кристину', 'Corporate', 'Medium', 'Ожидание ответа', current_date + 2, 'Чеслав'),
    ('Подготовить страницу "Для компаний"', 'Corporate', 'High', 'Эта неделя', current_date + 5, 'Чеслав'),
    ('Подготовить страницу "Education"', 'Education', 'Medium', 'Inbox', current_date + 10, 'Чеслав'),
    ('Согласовать порядок рейтингового турнира с федерацией', 'Rating', 'Critical', 'Inbox', current_date + 7, 'Чеслав'),
    ('Собрать ТЦ-пакет', 'Big Events / ТЦ', 'High', 'Inbox', current_date + 21, 'Чеслав'),
    ('Подготовить one-page offer Rep Chess KRD', 'Corporate', 'High', 'Эта неделя', current_date + 5, 'Чеслав'),
    ('Делегировать часть обычных турниров', 'Regular Events', 'Medium', 'Inbox', current_date + 30, 'Чеслав'),
    ('Создать weekly review за текущую неделю', 'Personal System', 'Medium', 'Сегодня', current_date, 'Чеслав')
) as seed(title, area, priority, status, due_date, owner)
where not exists (
  select 1
  from public.repchess_os_tasks existing
  where existing.title = seed.title
);

insert into public.repchess_os_plans (title, horizon, direction, description, target_result, target_date, status, priority)
select title, horizon, direction, description, target_result, target_date, status, priority
from (
  values
    ('Собрать корпоративное КП', 'Краткосрочный', 'Corporate', 'Подготовить короткое коммерческое предложение для компаний: корпоративные турниры, командные форматы, обучение сотрудников, шахматная лига.', 'Готовое КП на 5-7 слайдов + one-page offer для отправки HR и event-отделам.', current_date + 14, 'Не начато', 'High'),
    ('Собрать Education КП', 'Краткосрочный', 'Education', 'Подготовить предложение для частных школ, детских центров и садов: шахматные занятия, вводные дни, кружки, турниры между классами.', 'Готовое КП для школ и детских центров.', current_date + 14, 'Не начато', 'High'),
    ('Создать таблицу 160 лидов', 'Краткосрочный', 'Operations', 'Собрать базу потенциальных клиентов: corporate, education, ТЦ, event-агентства, девелоперы, фестивали.', '160 лидов в CRM Rep Chess OS.', current_date + 30, 'Не начато', 'High'),
    ('Запустить первые 40 касаний', 'Краткосрочный', 'Corporate', 'Написать первым потенциальным клиентам и проверить спрос на корпоративные и образовательные продукты.', '40 отправленных сообщений, минимум 5 ответов, минимум 2 созвона.', current_date + 30, 'Не начато', 'High'),
    ('Вернуться к TOP IT SCHOOL', 'Краткосрочный', 'Education', 'Дожать тёплый education-лид по шахматным занятиям. Уточнить формат, расписание, преподавателя и экономику.', 'Понятный следующий шаг по запуску пилота.', current_date + 10, 'Не начато', 'Medium'),
    ('Вернуться к IT-компании через Кристину', 'Краткосрочный', 'Corporate', 'Проработать корпоративный лид на IT-компанию примерно на 50 сотрудников.', 'Созвон или встреча с ответственным лицом.', current_date + 10, 'Не начато', 'Medium'),
    ('Добавить страницу "Для компаний"', 'Краткосрочный', 'Corporate', 'Создать на сайте страницу для корпоративных услуг Rep Chess KRD.', 'Страница /corporate с оффером, форматами, пакетами и формой заявки.', current_date + 30, 'Не начато', 'High'),
    ('Закрыть первый корпоративный клиент', 'Среднесрочный', 'Corporate', 'Продать первый корпоративный шахматный формат: турнир, командный вечер, лига или обучение сотрудников.', 'Сделка на 45 000-100 000 ₽.', current_date + 75, 'Не начато', 'Critical'),
    ('Запустить первый education-пилот', 'Среднесрочный', 'Education', 'Запустить пилот шахматных занятий в школе, детском центре или TOP IT SCHOOL.', 'Одна регулярная education-точка с понятной экономикой.', current_date + 75, 'Не начато', 'High'),
    ('Собрать ТЦ-пакет', 'Среднесрочный', 'Big Events / ТЦ', 'Упаковать предложение для ТЦ: турнир 40-50 участников, свободная игра, споты, квиз, обучение, фото/видео.', 'Готовое КП для ТЦ с пакетами 30 000 / 60 000 / 100 000 ₽.', current_date + 60, 'Не начато', 'High'),
    ('Провести один крупный ивент', 'Среднесрочный', 'Big Events / ТЦ', 'Закрыть и провести один крупный платный ивент в ТЦ, гастромаркете, у девелопера или на городской площадке.', 'Ивент с оплатой от 30 000 ₽.', current_date + 90, 'Не начато', 'High'),
    ('Согласовать порядок рейтинговых турниров', 'Среднесрочный', 'Rating', 'Получить от федерации / рейтингового администратора порядок проведения турниров с обсчётом российского рейтинга.', 'Понятный чек-лист документов, требований и сроков.', current_date + 60, 'Не начато', 'High'),
    ('Запустить Rep Chess KRD Rating Rapid', 'Среднесрочный', 'Rating', 'Подготовить и провести первый рейтинговый турнир Rep Chess KRD.', 'Первый пилотный рейтинговый турнир: 7 туров, 10+5 или 15+0, участники с ФШР ID / НИ.', current_date + 90, 'Не начато', 'High'),
    ('Делегировать часть обычных турниров', 'Среднесрочный', 'Operations', 'Передать часть регулярных турниров ведущим, чтобы Чеслав мог заниматься продажами, партнёрами и стратегией.', '30-40% обычной операционки не на Чеславе.', current_date + 90, 'Не начато', 'Medium'),
    ('Выйти на личный доход Чеслава 100 000 ₽+', 'Долгосрочный', 'Finance', 'Перестроить модель так, чтобы личный доход Чеслава был не 20-40 тыс. ₽, а минимум 100 тыс. ₽ в месяц.', 'Стабильный личный доход 100 000 ₽+ за счёт corporate, education, big events и регулярки.', current_date + 180, 'Не начато', 'Critical'),
    ('Сформировать регулярную corporate-воронку', 'Долгосрочный', 'Corporate', 'Сделать корпоративные услуги постоянным направлением Rep Chess KRD.', '2-3 корпоративных клиента или события в месяц.', current_date + 180, 'Не начато', 'High'),
    ('Развернуть Rep Chess Education в Краснодаре', 'Долгосрочный', 'Education', 'Запустить несколько регулярных точек обучения: школы, детские центры, сады, IT-школы.', '3-5 education-точек с понятной маржинальностью.', current_date + 240, 'Не начато', 'High'),
    ('Закрепиться в ТЦ и у девелоперов', 'Долгосрочный', 'Big Events / ТЦ', 'Сделать крупные городские шахматные события отдельным направлением выручки и статуса.', '1 крупный ивент в месяц или квартал с оплатой от 50 000 ₽.', current_date + 240, 'Не начато', 'High'),
    ('Запустить грантовое направление', 'Долгосрочный', 'Grants', 'Подготовить грантовые заявки на городские, молодёжные, культурные и образовательные шахматные проекты.', 'Минимум 1-2 поданные грантовые заявки.', current_date + 270, 'Не начато', 'Medium'),
    ('Подготовить базу для собственного шахматного заведения', 'Долгосрочный', 'Strategic', 'Начать собирать финансовую, партнёрскую и продуктовую базу для будущего шахматного заведения Rep Chess KRD.', 'Понятная предварительная модель заведения: формат, экономика, аудитория, партнёры, стартовый капитал.', current_date + 365, 'Не начато', 'Medium')
) as seed(title, horizon, direction, description, target_result, target_date, status, priority)
where not exists (
  select 1
  from public.repchess_os_plans existing
  where existing.title = seed.title
);
