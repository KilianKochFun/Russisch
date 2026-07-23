-- Lerninhalte (WaniKani-Struktur) — privat, nur für eingeloggte Nutzer lesbar.
-- item_type: 'zhuyin' | 'component' | 'character' | 'word'
-- data (jsonb) je nach Typ, z.B. Zhuyin: { zhuyin, pinyin, hinweis, beispiel: {zh, zhuyin, pinyin, de} }

create table public.vocab_items (
  id        bigint generated always as identity primary key,
  language  text not null,
  item_type text not null,
  level     int  not null,
  position  int  not null,
  data      jsonb not null,
  created_at timestamptz not null default now(),
  unique (language, item_type, level, position)
);

alter table public.vocab_items enable row level security;

-- Lesen: nur eingeloggt. Schreiben: niemand (Inhalte werden mit dem Secret Key gepflegt).
create policy "read for authenticated" on public.vocab_items
  for select to authenticated using (true);
