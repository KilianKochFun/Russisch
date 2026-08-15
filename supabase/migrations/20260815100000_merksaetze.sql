-- Eigene Merksätze pro Karte.
--
-- Warum eine eigene Tabelle und nicht settings.data: Merksätze wachsen mit
-- jeder Karte, und settings.data ist ein einziger JSON-Klumpen, den jedes
-- Gerät komplett überschreibt. Genau daran sind schon die Lernstände
-- gescheitert (siehe srs_cards). Eine Zeile je Karte, wie dort.
--
-- Der Schlüssel ist der Item-Key OHNE Prüfungssuffix (`character:好`, nicht
-- `character:好#lesung`): Ein Merksatz gehört zum Zeichen, nicht zu einer
-- seiner beiden Abfragen.

create table if not exists public.merksaetze (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  lang       text        not null,   -- 'russian-morph', 'chinese-tw', …
  card_key   text        not null,   -- 'morph:в-', 'character:好'
  text       text        not null check (length(trim(text)) between 1 and 500),
  updated_at timestamptz not null default now(),
  primary key (user_id, lang, card_key)
);

alter table public.merksaetze enable row level security;

-- Merksätze sind privat. Anders als die Bestenliste gibt es hier nichts zu
-- vergleichen — ein Merksatz ist genau dann gut, wenn er für einen selbst
-- funktioniert.
drop policy if exists "eigene merksaetze" on public.merksaetze;
create policy "eigene merksaetze" on public.merksaetze
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists merksaetze_sprache on public.merksaetze (user_id, lang);
