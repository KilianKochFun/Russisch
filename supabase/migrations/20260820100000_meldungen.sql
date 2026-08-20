-- Meldungen zu einzelnen Karten: „hier stimmt was nicht“.
--
-- Der Zweck ist eine Rückmeldeschleife, die vorher fehlte. Wenn eine Vokabel
-- falsch übersetzt ist oder eine Lesung nicht stimmt, fällt das beim Lernen
-- auf — und dann ist der Moment vorbei, weil man gerade lernt und nicht
-- Fehler melden will. Ein Knopf auf der Karte fängt es auf; ich lese die
-- Meldungen später über scripts/meldungen.js und ändere die Daten oder
-- schreibe zurück, warum es so bleibt.
--
-- `antwort` ist genau dieser Rückweg: Was ich schreibe, steht danach in der
-- App unter der Karte. Eine Meldung, auf die nie jemand reagiert, meldet man
-- kein zweites Mal.

create table if not exists public.meldungen (
  id         bigserial   primary key,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  lang       text        not null,
  card_key   text        not null,           -- ohne Prüfungssuffix
  anzeige    text,                           -- was auf der Karte stand, für den Kontext
  text       text        not null check (length(trim(text)) between 1 and 1000),
  status     text        not null default 'offen'
             check (status in ('offen', 'geaendert', 'bleibt', 'erledigt')),
  antwort    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.meldungen enable row level security;

-- Eigene Meldungen sehen und schreiben. Die Antwort kommt über den
-- Secret Key von außen und geht an der RLS vorbei — deshalb darf der Nutzer
-- selbst `antwort` und `status` zwar sehen, aber das Ändern bringt ihm nichts.
drop policy if exists "eigene meldungen" on public.meldungen;
create policy "eigene meldungen" on public.meldungen
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists meldungen_offen on public.meldungen (status, created_at);
create index if not exists meldungen_karte on public.meldungen (user_id, lang, card_key);
