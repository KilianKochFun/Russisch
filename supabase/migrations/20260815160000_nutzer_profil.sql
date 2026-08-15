-- Das Profil eines einzelnen Nutzers: wie sich sein Lernstand über die Stufen
-- verteilt, je Sprache.
--
-- Dieselbe Linie wie bei bestenliste(): security definer, damit überhaupt über
-- fremde Zeilen gerechnet werden kann, aber es kommen ausschließlich ZAHLEN
-- zurück. Welche Karte jemand auf welcher Stufe hat, sieht weiterhin niemand —
-- nur wie viele auf jeder Stufe stehen.
--
-- Was hier bewusst NICHT herausgeht: die E-Mail-Adresse, das Anmeldedatum, die
-- Kartenschlüssel. Der Name kommt aus profiles, den hat sich jeder selbst
-- gegeben.

create or replace function public.nutzer_profil(ziel uuid)
returns table (
  name   text,
  lang   text,
  srs    int,
  anzahl bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    coalesce(p.name, 'ohne Namen') as name,
    c.lang,
    c.srs,
    count(*) as anzahl
  from public.srs_cards c
  left join public.profiles p on p.user_id = c.user_id
  where auth.uid() is not null
    and c.user_id = ziel
    and not exists (
      select 1 from auth.users u
      where u.id = c.user_id and u.email like 'test-harness%'
    )
  group by p.name, c.lang, c.srs;
$$;

revoke all on function public.nutzer_profil(uuid) from public, anon;
grant execute on function public.nutzer_profil(uuid) to authenticated;
