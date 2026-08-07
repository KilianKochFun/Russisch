-- Vergleich mit anderen Nutzern: eine Bestenliste über alle Sprachen und je Sprache.
--
-- Das Problem dabei ist die Zeilensicherheit. Auf `srs_cards` gilt „nur eigene
-- Zeilen“, und das soll auch so bleiben: Niemand hat etwas damit zu tun, welche
-- einzelne Karte ein anderer auf welcher Stufe hat. Für einen Vergleich braucht
-- man aber Zahlen über fremde Zeilen.
--
-- Gelöst über eine Funktion mit `security definer`: Sie läuft mit den Rechten
-- ihres Besitzers, sieht also an der RLS vorbei — gibt aber ausschließlich
-- Summen zurück, nie eine einzelne Karte. Die Tabellenpolitik bleibt unberührt.
-- `set search_path` ist dabei Pflicht, sonst könnte man der Funktion über einen
-- untergeschobenen Schemapfad fremde Tabellen unterjubeln.

-- ── Anzeigename ────────────────────────────────────────────────────────────
-- Ohne Namen wäre die Liste eine Reihe von UUIDs. Die E-Mail-Adresse darf es
-- nicht sein — die gehört niemandem außer dem Besitzer. Also ein eigener,
-- selbstgewählter Name, und bis der gesetzt ist, gar keiner.

create table if not exists public.profiles (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  name       text        not null check (length(trim(name)) between 1 and 24),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Namen sind für alle Angemeldeten lesbar — das ist der Sinn der Bestenliste.
drop policy if exists "namen sind lesbar" on public.profiles;
create policy "namen sind lesbar" on public.profiles
  for select to authenticated using (true);

-- Ändern darf jeder nur den eigenen.
drop policy if exists "eigenen namen setzen" on public.profiles;
create policy "eigenen namen setzen" on public.profiles
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Die Bestenliste ────────────────────────────────────────────────────────
-- Eine Zeile je Nutzer und Sprache. Die Stufen folgen SRS_STAGES aus state.js:
-- 0 neu · 1–4 Apprentice · 5–6 Guru · 7 Master · 8 Enlightened · 9 Burned.

create or replace function public.bestenliste()
returns table (
  user_id  uuid,
  name     text,
  lang     text,
  karten   bigint,
  gelernt  bigint,   -- alles ab Apprentice 1
  guru     bigint,   -- ab Guru 1 — das ist die Schwelle, ab der WaniKani „sitzt“ sagt
  gebrannt bigint    -- Stufe 9, fertig
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.user_id,
    coalesce(p.name, 'ohne Namen') as name,
    c.lang,
    count(*)                            as karten,
    count(*) filter (where c.srs >= 1)  as gelernt,
    count(*) filter (where c.srs >= 5)  as guru,
    count(*) filter (where c.srs >= 9)  as gebrannt
  from public.srs_cards c
  left join public.profiles p on p.user_id = c.user_id
  where auth.uid() is not null      -- nur für Angemeldete, nie anonym
  group by c.user_id, p.name, c.lang
  having count(*) filter (where c.srs >= 1) > 0;   -- wer nichts gelernt hat, steht nicht drin
$$;

revoke all on function public.bestenliste() from public, anon;
grant execute on function public.bestenliste() to authenticated;
