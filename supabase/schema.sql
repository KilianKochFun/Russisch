-- Schema für die Sprachlern-App (Phase 2).
-- Ausführen im Supabase SQL-Editor ODER via: supabase db push --db-url "$SUPABASE_DB_URL"
-- (identisch mit supabase/migrations/20260723120000_init.sql)

create table public.progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  card_id     text not null,
  known_count int  not null default 0,
  again_count int  not null default 0,
  interval_days int not null default 0,
  due_date    date,
  updated_at  timestamptz not null default now(),
  primary key (user_id, card_id)
);

create table public.settings (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- RLS ist Pflicht: Repo + Anon-Key sind öffentlich!
alter table public.progress enable row level security;
alter table public.settings enable row level security;

create policy "own progress" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own settings" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
