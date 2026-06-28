alter table public.club_content
drop constraint if exists club_content_type_check;

alter table public.club_content
add constraint club_content_type_check
check (type in ('honor', 'news', 'lecture', 'rules', 'review', 'gallery'));

insert into public.club_content (
  type,
  title,
  subtitle,
  body,
  image_url,
  is_published,
  is_featured,
  sort_order,
  published_at
)
select
  'gallery',
  'Атмосфера Rep Chess KRD',
  'Фото с турниров, где шахматы не выглядят как экзамен.',
  'Добавляйте сюда фотографии через админку: лучшие кадры будут попадать на главную страницу.',
  '/merch/repchess-merch-01.jpg',
  true,
  true,
  50,
  now()
where not exists (
  select 1
  from public.club_content
  where type = 'gallery'
    and title = 'Атмосфера Rep Chess KRD'
);
