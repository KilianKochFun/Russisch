-- Aussprache als MP3 im Storage — privat, nur für eingeloggte Nutzer lesbar.
--
-- Die Browser-Stimmen klingen für Mandarin nach nichts Echtem. Deshalb liegt
-- je Zeichen und Wort eine fertige Aufnahme im Bucket, erzeugt mit
-- scripts/audio_zh.js. Pfad: <sprache>/<Codepoints hex, mit - verbunden>.mp3,
-- z.B. zh-TW/597d.mp3 für 好 — Storage-Schlüssel vertragen keine Hanzi.
--
-- NICHT public, wie die Bücher: Die Aufnahmen stammen aus dem Google-Übersetzer
-- und sollen nicht frei im Netz stehen.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio', 'audio', false, 1048576, array['audio/mpeg'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lesen darf jede angemeldete Person. Schreiben nur das Skript mit dem Secret Key.
drop policy if exists "audio lesen wenn eingeloggt" on storage.objects;
create policy "audio lesen wenn eingeloggt" on storage.objects
  for select
  to authenticated
  using (bucket_id = 'audio');
