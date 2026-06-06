-- Reset Rep Chess KRD rating baseline and add public player statuses.
-- Everyone starts from the internal club rating: 1500 with high Glicko-2 RD.

alter table public.users
  add column if not exists player_status text not null default 'Player';

alter table public.users
  drop constraint if exists users_player_status_check;

alter table public.users
  alter column rating set default 1500;

update public.users
set
  rating = 1500,
  player_status = case
    when player_status in (
      'Player',
      'Admin',
      'Boss',
      'Chief',
      'Legend',
      'Goat',
      'CM',
      'FM',
      'IM',
      'GM',
      'WCM',
      'WFM',
      'WIM',
      'WGM'
    )
    then player_status
    else 'Player'
  end,
  updated_at = now();

alter table public.users
  add constraint users_player_status_check
  check (
    player_status in (
      'Player',
      'Admin',
      'Boss',
      'Chief',
      'Legend',
      'Goat',
      'CM',
      'FM',
      'IM',
      'GM',
      'WCM',
      'WFM',
      'WIM',
      'WGM'
    )
  );

do $$
begin
  if to_regclass('public.player_ratings') is not null then
    update public.player_ratings
    set
      rating = 1500,
      rd = 350,
      volatility = 0.06,
      games_count = 0,
      wins_count = 0,
      losses_count = 0,
      draws_count = 0,
      last_game_at = null,
      rating_period_start = now(),
      last_updated = now();

    insert into public.player_ratings (
      user_id,
      rating,
      rd,
      volatility,
      games_count,
      wins_count,
      losses_count,
      draws_count,
      last_game_at,
      rating_period_start,
      last_updated
    )
    select
      users.id,
      1500,
      350,
      0.06,
      0,
      0,
      0,
      0,
      null,
      now(),
      now()
    from public.users
    left join public.player_ratings
      on player_ratings.user_id = users.id
    where player_ratings.user_id is null;
  end if;
end $$;
