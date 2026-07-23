# PLAN: Umbau zur gehosteten Sprachlern-App (Supabase + GitHub Pages)

> **An die KI:** Dies ist der Umsetzungsplan. Lies zuerst `CLAUDE.md`, dann arbeite die Phasen
> in Reihenfolge ab. Die App muss nach **jeder** Phase weiterhin voll benutzbar sein.
> Hake erledigte Punkte hier in der Datei ab und aktualisiere `CLAUDE.md` am Ende jeder Phase.

## Ziel

Die bestehende Lern-App (Russisch A1 + Japanisch N2/N3) wird zu einer gehosteten
Multi-User-App umgebaut:

- **Hosting:** GitHub Pages (Repo: `KilianKochFun/Russisch`) → nutzbar am Handy unterwegs
- **Backend:** Supabase Free-Tier (Auth + Fortschritts-Datenbank).
  Gleicher Supabase-Account wie bei der ValentinStickerWebsite, aber ein **NEUES, eigenes
  Projekt** — nichts mit dem Sticker-Projekt teilen, komplett andere Tabellen/Keys.
- **Eingabemodi:** drei gleichwertige, in den Einstellungen wählbare Modi:
  **Touch** (Handy), **Tastatur+Maus** (normaler Computer) und **Pedal**
  (3 Tasten, frei belegbar — welche Taste welches Pedal ist, stellt man selbst ein)
- **Auto-Save:** jede Antwort sofort lokal, Hintergrund-Sync zu Supabase, offlinefähig (PWA)
- **Technik:** Vanilla JS, kein Framework — aber die 3300-Zeilen-HTML in Module aufteilen
- **Später:** Mandarin traditionell (Taiwan) mit Zhuyin + Pinyin

## NEUAUSRICHTUNG (23.07.2026 — überschreibt Phase 3/5 unten)

Kilians Entscheidung: Die App wird eine **reine Vokabeltrainer-Plattform** (WaniKani-Stil).

1. **Raus:** Grammatik-, Dialog-, Text-, Hören-, Theorie-Einheiten + Kapitelbaum
   (Daten bleiben in Git-History; `data/` wird nicht mehr im Menü angezeigt).
2. **Herzstück:** SRS-Vokabeltrainer (wie bisher Russisch) — pro Sprache ein Dashboard
   (Lessons, Reviews, Level, Forecast, Browse) als Startscreen nach Sprachwahl.
3. **Neu: Mandarin-Trainer** (traditionell/Taiwan) in WaniKani-Dreistufung:
   **Komponenten → Zeichen → Wörter**, Level-basiert, Lesson→Review.
   Inhalte aus freien Quellen (TOCFL-Listen, CC-CEDICT) — WaniKani-Mnemonics/-Namen
   nicht kopieren (geschützt); das SYSTEM ist frei nachbaubar.
   **Zuerst kommt ein eigener Zhuyin-Trainer** (ㄅㄆㄇㄈ, unabhängig von Vokabeln):
   ✅ Deck fertig in Supabase — 42 Items in 7 Leveln (Anlaute×3, Vokale, Doppelvokale,
   Nasale, 5 Töne an der ma-Reihe), Seed-Skript `scripts/seed_zhuyin.js`.
   ✅ **WaniKani Level 1–10 importiert** (Kilians Entscheidung: Original-Inhalte, privat):
   236 Komponenten + 358 Zeichen, zu traditionellem Chinesisch adaptiert
   (気→氣, 学→學, 円→圓 …), Lesungen aus CC-CEDICT als Pinyin + Zhuyin.
   Pipeline: `scripts/seed_hanzi.js` + Daten in `content-private/` (**gitignored** —
   WK-Listen dürfen nie ins öffentliche Repo, nur nach Supabase hinter RLS!).
   ✅ WK-Wörter Level 1–10: 333 echte Mandarin-Wörter (CC-CEDICT-gefiltert).
   ✅ TOCFL-Erweiterung: 177 fehlende Grundzeichen (我, 是, 個 …) als Zeichen-Level 11–18,
   +167 TOCFL-Wörter (Band 1–4) — jedes Wort im Level seines zuletzt gelernten Zeichens.
   Gesamt: 1312 Items. Pipeline: `seed_hanzi.js` (schreibt zeichen-level.json) → `seed_words.js`.
   ✅ Curriculum umgebaut: L1–2 Grundzeichen (我,是,你…), L3–12 WK (+2), L13–31 TOCFL-Rest;
   869 Wörter je am Level ihres letzten Zeichens. Gesamt 2024 Items.
   ✅ WaniKani-Gating (Komponenten→Zeichen→Wörter), Tonfarben, Übersichts-Screen,
   PWA (Manifest+SW+Offline-Decks), Strichfolge-Animationen (Hanzi Writer, vendored).
4. **Inhalte in Supabase-Tabelle `vocab_items`** ✅ (language, item_type, level,
   position, data jsonb; RLS: SELECT nur für Eingeloggte, Schreiben nur via Secret Key
   → Inhalte sind nicht öffentlich, Repo bleibt sauber).
5. **Login ist Pflicht** („Ohne Anmeldung weiter" wurde entfernt). ✅
   ✅ Alter Kapitelbaum-Code komplett entfernt (ui.js 2400→1035 Zeilen, 14 Screens raus)
   ✅ Light-Mode (automatisch), ✅ Pedal-Tasten frei belegbar (Sprachen-Menü → ⚙)
6. **Neues Design** — Rot fliegt raus; ruhige, helle Basis mit Dark-Mode,
   Akzentfarbe pro Sprache, Tonfarben für Mandarin, Genusfarben für Russisch bleiben.
7. **Eingabemodi** Touch / Tastatur+Maus / Pedal wie Phase 3 unten beschrieben.
8. SRS-Fortschritt wandert von localStorage nach Supabase (Merge wie Phase 4).

## Kritische Regeln (IMMER einhalten)

1. **Pedal-Modus:** braucht mit genau **3 Tasten** vollständig bedienbar zu sein — kein
   Screen darf eine vierte Taste erfordern. Standard-Belegung ist A/B/C (wie bisher,
   Tabelle in `CLAUDE.md`), aber die Tasten sind in den Einstellungen **frei umbelegbar**.
2. **`.env`-Dateien:** Werte NIEMALS lesen oder ausgeben — höchstens Variablennamen.
   Gilt überall, insbesondere für andere Projekte wie ValentinStickerWebsite.
3. **RLS ist Pflicht:** Das Repo ist öffentlich, der Supabase-Anon-Key liegt im Code
   (das ist bei Supabase so vorgesehen). Ohne Row Level Security auf JEDER Tabelle
   sind die Daten offen. Kein Table ohne RLS-Policy.
4. Nach jeder Phase: kurz manuell testen (lokal `node server.js` bzw. `python3 -m http.server`),
   dann committen. Kleine, nachvollziehbare Commits.

## Was Kilian selbst machen muss (Checkliste)

- [x] Supabase: im bestehenden Account (der von der ValentinStickerWebsite) ein **neues
      Projekt** anlegen (Name z.B. `sprachen`), Region EU
- [x] Projekt-URL + Anon-Key (Public Key) der KI geben bzw. in `js/config.js` eintragen
- [ ] Supabase Dashboard → Authentication → Sign-ups **deaktivieren**
- [x] Account keko0100@outlook.de angelegt (via Admin-API; weitere jederzeit möglich) (Dashboard → Authentication → Add user, E-Mail + Passwort)
- [ ] GitHub: Settings → Pages → Deploy from branch `master`, Ordner `/ (root)` aktivieren

---

## Phase 1 — Statisch machen & Module aufteilen

Ziel: Die App läuft ohne Node-Server als rein statische Seite (Voraussetzung für GitHub Pages).

- [x] `scripts/build_content.js` schreiben: repliziert die Ladelogik aus `server.js`
      (`loadSprachen()`, Hierarchie Sprache → Kapitel → Unterkapitel → Einheiten über
      `meta.json`) und schreibt das Ergebnis als `content/sprachen.json`.
      Als npm-Script `npm run build:content` einrichten (package.json anlegen falls nötig).
- [x] **Stabile Karten-IDs:** Im Build-Skript jeder Vokabelkarte/Frage eine deterministische
      ID geben, z.B. `russian/a1/a1.1/vokabeln-01#солнце` (Pfad + RU-Wort bzw. Fragen-Index).
      Wichtig: IDs müssen stabil bleiben, wenn Inhalte ergänzt werden — daran hängt später
      der gespeicherte Fortschritt.
- [x] `content/sprachen.json` wird committet (kein Build-Server nötig); bei Datenänderungen
      Skript neu laufen lassen. Hinweis dazu in `CLAUDE.md`.
- [x] `russisch_quiz.html` aufteilen in `index.html` + `js/`-Module (ES Modules):
      - `js/state.js` — State-Machine (Zustände wie `karte-front`, `hoeren-frage`, …)
      - `js/ui.js` — Rendering/Screens
      - `js/input.js` — Eingabe (vorerst nur der bestehende A/B/C-keydown-Handler)
      - `js/content.js` — lädt `content/sprachen.json` per fetch
      - `js/tts.js` — Sprachausgabe
      Verhalten dabei NICHT ändern — reines Umsortieren. `russisch_quiz.html` danach löschen.
- [x] TTS umstellen auf **Web Speech API** (`speechSynthesis`): Sprache pro Inhalt
      (`ru-RU`, `ja-JP`, später `zh-TW`), Stimme automatisch wählen, sauber degradieren
      wenn keine Stimme vorhanden (Hinweis statt Fehler). Wenn die Seite über
      `localhost` läuft und der alte `/tts`-Proxy erreichbar ist, diesen bevorzugen
      (bessere Qualität am Desktop); sonst Web Speech. `server.js` bleibt als Dev-Server.
- [x] `.nojekyll` anlegen (GitHub Pages), prüfen dass alles mit relativen Pfaden läuft
      (Seite liegt unter `/Russisch/` auf Pages!)
- [x] Test: `python3 -m http.server` (ohne Node-Server!) → alles funktioniert wie vorher

## Phase 2 — Supabase: Login + Fortschritt

- [x] `js/config.js` anlegen: `export const SUPABASE_URL = '...'; export const SUPABASE_ANON_KEY = '...';`
      (Werte von Kilian; dürfen ins öffentliche Repo). Supabase-JS v2 als ES-Modul-Import
      von esm.sh o.ä. — kein Bundler nötig.
- [x] SQL ausführen (via `supabase db push` erledigt, 23.07.2026 — RLS end-to-end getestet):

```sql
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

alter table public.progress enable row level security;
alter table public.settings enable row level security;

create policy "own progress" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own settings" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [x] Login-Screen (E-Mail + Passwort, "eingeloggt bleiben" = Standard-Session-Persistenz
      von Supabase). Kein Registrieren-Button. Logout im Menü.
- [x] `js/progress.js`: nach jeder Karteikarten-Antwort (`gewusst`/`nochmal`) und jeder
      Quiz-Antwort Fortschritt per Upsert schreiben (`known_count`/`again_count`,
      simples SRS: gewusst → `interval_days` verdoppeln (min. 1), `due_date` setzen;
      nochmal → Intervall zurück auf 0/heute).
- [x] In `settings.data`: zuletzt geöffnete Sprache/Kapitel/Einheit + bevorzugter
      Eingabemodus → beim Login dort weitermachen ("Weiter lernen"-Eintrag im Menü).
- [x] Neuer Menüpunkt "Fällige Karten" (SRS-Wiederholung): alle Karten mit
      `due_date <= heute` über alle Kapitel einer Sprache.

## Phase 3 — Eingabemodi: Touch / Tastatur+Maus / Pedal (umschaltbar)

- [ ] Aktions-Schicht in `js/input.js`: zentrale Aktionen
      (`hoch`, `runter`, `auswaehlen`, `aufdecken`, `gewusst`, `nochmal`,
      `antwort(0|1|2)`, `weiter`, `zurueck`) — die State-Machine reagiert nur noch
      auf Aktionen, nicht auf Tasten.
- [ ] **Einstellungs-Screen** mit Eingabemodus-Wahl: `Touch` / `Tastatur + Maus` / `Pedal`.
      Auswahl wird in `settings` gespeichert (pro Gerät zusätzlich in localStorage,
      damit z.B. Handy auf Touch und PC auf Pedal stehen kann). Sinnvoller
      Standard beim ersten Start: Touch-Gerät erkannt → Touch, sonst Tastatur+Maus.
- [ ] **Modus „Pedal":** 3 Tasten steuern alles (Standard A/B/C, Verhalten wie bisher).
      **Tasten-Belegung konfigurierbar:** im Einstellungs-Screen „Pedal 1/2/3 belegen" →
      nächster Tastendruck wird als diese Pedal-Taste gespeichert (beliebige Taste/KeyCode).
      Jeder Screen muss mit nur diesen 3 Tasten vollständig bedienbar sein.
- [ ] **Modus „Tastatur + Maus":** alles klickbar (Menüeinträge, Antwort-Optionen,
      Karteikarte klicken = aufdecken, Buttons „✓ Gewusst" / „↩ Nochmal", „Weiter",
      sichtbarer Zurück-Button) **plus** komfortable Tastatur-Belegung: Pfeiltasten =
      hoch/runter, Enter/Leertaste = auswählen/aufdecken/weiter, 1/2/3 = Antworten,
      Esc/Backspace = zurück.
- [ ] **Modus „Touch":** alles antippbar (gleiche klickbaren Elemente wie oben) **plus**
      Gesten: Tippen = aufdecken/weiter, Swipe rechts = gewusst, Swipe links = nochmal;
      feste Button-Leiste unten (Daumenreichweite, min. 48px Touch-Targets).
- [ ] Die Modi steuern nur, welche Listener aktiv sind und welche Hilfen/Hinweise angezeigt
      werden (z.B. Pedal-Legende nur im Pedal-Modus, Button-Leiste nur bei Touch) —
      Klick auf sichtbare Elemente funktioniert sicherheitshalber in jedem Modus.
- [ ] Responsive: mobile Layout-Prüfung aller Screens (Menü, Karte, Quiz, Dialog, Theorie,
      Hören, Ergebnis), `100dvh` statt `100vh`, kein Zoom auf Doppeltipp
      (`touch-action: manipulation`).

## Phase 4 — Auto-Save offline & PWA

- [ ] Offline-First-Sync in `js/sync.js`: jede Fortschritts-Änderung sofort nach
      `localStorage`, dazu eine Sync-Queue; bei `navigator.onLine` + Intervall/`online`-Event
      Queue zu Supabase flushen (Upserts, letzte Änderung gewinnt via `updated_at`).
- [ ] Beim Login/Start: Fortschritt aus Supabase laden und mit lokalem Stand mergen
      (neueres `updated_at` gewinnt pro Karte).
- [ ] PWA: `manifest.json` (Name, Icons, `display: standalone`) + Service Worker
      (Cache-First für App-Shell + `content/sprachen.json`, Update-Strategie:
      neue Version beim nächsten Start).
- [ ] Test: Flugmodus an → lernen → Flugmodus aus → Fortschritt landet in Supabase.

## Phase 5 — Mandarin traditionell (Taiwan) [erst wenn 1–4 stehen]

- [ ] `data/chinese-tw/` mit `meta.json` (`sprache: "中文（繁體）"`, Icon 🇹🇼),
      Level-Struktur an TOCFL orientiert (Band A = Level 1–2 als Start)
- [ ] Kartenschema erweitern: `{ zh, zhuyin, pinyin, de, m }` — Anzeige Zhuyin ㄅㄆㄇ
      und Pinyin per Setting umschaltbar; Tonfarben (1–4 + neutral) für die Silben
- [ ] TTS mit `zh-TW`-Stimme
- [ ] Erste Inhalte: TOCFL-Band-A-Vokabelliste als Quelle für `scripts/`-Generator

---

## Aktueller Stand der Codebasis (Referenz für die KI)

- `russisch_quiz.html` (~3330 Zeilen): komplette App als State-Machine; einziger Input
  ist der `keydown`-Handler für A/B/C am Dateiende. **Keinerlei Persistenz vorhanden**
  (kein localStorage) — Fortschritt geht bei Reload verloren.
- `server.js`: statische Dateien + `/api/sprachen` (lädt `data/`-Hierarchie) +
  `/tts`-Proxy (Google Translate). Fällt beim statischen Hosting weg; bleibt für lokale Dev.
- `data/<sprache>/<kapitel>/<unterkapitel>/*.js`: Inhalte als CommonJS-Module,
  Reihenfolge/Struktur über `meta.json` pro Ebene. Bereits zweisprachig
  (russian: a1, a1-rev; japanese: n2, n3).
- Einheiten-Typen: `vokabeln`, `grammatik`, `dialog`, `text`, `hoeren`, `theorie`
  (Details in `CLAUDE.md`).
