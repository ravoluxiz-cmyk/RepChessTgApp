alter table public.club_content
  add column if not exists image_urls jsonb not null default '[]'::jsonb,
  add column if not exists image_position text not null default 'center center';

alter table public.club_content
  drop constraint if exists club_content_type_check,
  add constraint club_content_type_check
    check (type in ('honor', 'news', 'lecture', 'rules', 'review', 'gallery'));

update public.club_content
set image_urls = jsonb_build_array(image_url)
where image_url is not null
  and image_url <> ''
  and image_urls = '[]'::jsonb;

alter table public.club_content
  drop constraint if exists club_content_image_urls_array_check,
  add constraint club_content_image_urls_array_check
    check (jsonb_typeof(image_urls) = 'array' and jsonb_array_length(image_urls) <= 8);

alter table public.club_content
  drop constraint if exists club_content_image_position_check,
  add constraint club_content_image_position_check
    check (
      image_position in (
        'left top',
        'center top',
        'right top',
        'left center',
        'center center',
        'right center',
        'left bottom',
        'center bottom',
        'right bottom'
      )
    );

notify pgrst, 'reload schema';
