-- Lernstand pro Karte, eine Zeile je Karte statt einem großen JSON-Klumpen.
--
-- Warum: bisher lag alles in settings.data. Jede beantwortete Karte schrieb den
-- kompletten Stand hoch, und zwei Geräte überschrieben sich gegenseitig — wer
-- zuletzt schrieb, gewann, die Reviews des anderen Geräts waren still weg.
-- Mit einer Zeile pro Karte schreibt jedes Gerät nur, was es angefasst hat.
--
-- Die alte Tabelle `progress` bleibt unangetastet (sie ist leer und wurde nie
-- benutzt); settings.data bleibt als Rückfallebene bestehen.

create table if not exists public.srs_cards (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  lang        text        not null,   -- 'chinese-tw', 'russian-morph', …
  deck        text        not null,   -- 'hanzi', 'bausteine', …
  card_key    text        not null,   -- 'character:好#lesung'
  srs         int         not null default 0,
  next_review timestamptz,            -- null = gebrannt oder noch nicht gelernt
  updated_at  timestamptz not null default now(),
  primary key (user_id, lang, deck, card_key)
);

-- Freigeschaltetes Level je Deck — gehört nicht zu einer einzelnen Karte.
create table if not exists public.srs_decks (
  user_id         uuid        not null references auth.users(id) on delete cascade,
  lang            text        not null,
  deck            text        not null,
  unlocked_level  int         not null default 1,
  updated_at      timestamptz not null default now(),
  primary key (user_id, lang, deck)
);

alter table public.srs_cards enable row level security;
alter table public.srs_decks enable row level security;

drop policy if exists "eigene srs_cards" on public.srs_cards;
create policy "eigene srs_cards" on public.srs_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "eigene srs_decks" on public.srs_decks;
create policy "eigene srs_decks" on public.srs_decks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Fälligkeitsabfragen laufen über next_review
create index if not exists srs_cards_due on public.srs_cards (user_id, next_review);
