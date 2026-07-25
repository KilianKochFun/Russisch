-- Lehrbücher als PDF im Storage — privat, nur für eingeloggte Nutzer lesbar.
--
-- Der Bucket ist NICHT public: ohne gültige Session gibt es keine URL, die
-- funktioniert. Die App holt sich nach dem Login eine signierte URL mit kurzer
-- Laufzeit und zeigt das PDF direkt im Browser an — kein Download nötig.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('buecher', 'buecher', false, 52428800, array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lesen darf jede angemeldete Person. Schreiben darf niemand über die App —
-- neue Bücher lädt Kilian mit dem Secret Key hoch, der den RLS-Check umgeht.
drop policy if exists "buecher lesen wenn eingeloggt" on storage.objects;
create policy "buecher lesen wenn eingeloggt" on storage.objects
  for select
  to authenticated
  using (bucket_id = 'buecher');
