-- Defense-in-depth hardening for public Supabase tables.
-- The Next.js app reads and writes through server routes with service_role.
-- Direct anon/authenticated Supabase clients should not be able to query app data.

do $$
declare
  app_table text;
  app_tables text[] := array[
    'users',
    'site_user_accounts',
    'site_user_sessions',
    'tournaments',
    'tournament_registrations',
    'tournament_participants',
    'rounds',
    'matches',
    'leaderboard',
    'player_ratings',
    'player_rating_stats',
    'rating_history',
    'rating_leaderboard',
    'rating_requests',
    'partnership_requests',
    'lesson_requests',
    'merch_orders',
    'club_content',
    'support_requests',
    'security_flags'
  ];
begin
  foreach app_table in array app_tables loop
    if to_regclass(format('public.%I', app_table)) is not null then
      execute format('alter table public.%I enable row level security', app_table);
      execute format('revoke all on table public.%I from anon, authenticated', app_table);
      execute format('grant all on table public.%I to service_role', app_table);
    end if;
  end loop;
end $$;

do $$
declare
  app_sequence record;
begin
  for app_sequence in
    select sequence_schema, sequence_name
    from information_schema.sequences
    where sequence_schema = 'public'
  loop
    execute format(
      'revoke all on sequence %I.%I from anon, authenticated',
      app_sequence.sequence_schema,
      app_sequence.sequence_name
    );
    execute format(
      'grant all on sequence %I.%I to service_role',
      app_sequence.sequence_schema,
      app_sequence.sequence_name
    );
  end loop;
end $$;
