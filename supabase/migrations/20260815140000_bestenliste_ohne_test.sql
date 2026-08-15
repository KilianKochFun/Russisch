-- Testkonten aus der Bestenliste nehmen.
--
-- Das Testgerüst (tests/harness.mjs) legt einen eigenen Nutzer an, damit kein
-- echter Lernstand angefasst wird, und räumt seine Zeilen nach jedem Lauf weg.
-- Bricht ein Lauf aber ab, bleiben sie liegen — und dann steht ein Testkonto
-- in der Bestenliste. Besser gar nicht erst hineinlassen, statt sich auf das
-- Aufräumen zu verlassen.

create or replace function public.bestenliste()
returns table (
  user_id  uuid,
  name     text,
  lang     text,
  karten   bigint,
  gelernt  bigint,
  guru     bigint,
  gebrannt bigint
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
  where auth.uid() is not null
    and not exists (
      select 1 from auth.users u
      where u.id = c.user_id and u.email like 'test-harness%'
    )
  group by c.user_id, p.name, c.lang
  having count(*) filter (where c.srs >= 1) > 0;
$$;

revoke all on function public.bestenliste() from public, anon;
grant execute on function public.bestenliste() to authenticated;
