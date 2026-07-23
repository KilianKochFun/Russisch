# Kilian lernt Sprachen — Vokabeltrainer-Plattform (Projektübersicht)

Statische Web-App (Vanilla JS, ES Modules) — läuft ohne Server direkt von GitHub Pages.
**Reine Vokabeltrainer-Plattform** (WaniKani-Stil): Russisch-SRS + Mandarin (Zhuyin,
Komponenten/Zeichen, Wörter). Der alte Kapitelbaum (Grammatik/Dialoge/Texte/Japanisch)
wurde entfernt — Code/Daten in Git-History (bis Commit 58632d3). Fahrplan: `PLAN.md`.

**Login-Flow:** Beim Start prüft `main.js` die Supabase-Session → Login-Screen (E-Mail+Passwort,
kein Registrieren) oder direkt App. **Login ist Pflicht** — ohne Anmeldung keine Inhalte.
Lerninhalte für Mandarin: Tabelle `vocab_items` (RLS: nur eingeloggt). Fortschritt/Settings:
`settings.data` (SRS-Stände `srs-russian`, `trainer-*`, `pedalKeys`) + localStorage-Spiegel.

## Dateien

| Datei/Ordner | Zweck |
|---|---|
| `index.html` | Markup + CSS aller Screens |
| `js/main.js` | Einstiegspunkt (lädt Inhalte, startet App) |
| `js/state.js` | Zentrales State-Objekt `S` + SRS-Stufen |
| `js/ui.js` | Sprachen-Menü + Russisch-SRS-Trainer |
| `js/trainer.js` + `js/decks.js` | Generischer Trainer für Supabase-Decks (Mandarin) |
| `js/input.js` | Pedal-Handler (Tasten frei belegbar) + Pedal-Setup |
| `js/content.js` | Lädt `content/sprachen.json` |
| `js/tts.js` | Sprachausgabe (Web Speech, lokal `/tts`-Proxy) |
| `js/config.js` | Supabase-URL + Publishable Key (öffentlich OK) |
| `js/supabase.js` | Supabase-Client + Auth (dynamisch importiert, Offline-Fallback) |
| `js/progress.js` | Fortschritt/SRS-Upserts + Settings (Weiter lernen, Fällige Karten) |
| `supabase/schema.sql` | DB-Schema (progress, settings, RLS) — im SQL-Editor ausführen |
| `content/sprachen.json` | **Generiert** aus `data/` — wird committet |
| `srs-levels.js` + `srs-data.json` | SRS-Level-Einteilung + gespeicherter Lernstand (Seed) |
| `SPRACHE-HINZUFUEGEN.md` | **Workflow zum Anlegen neuer Sprachen** (Spanisch, Italienisch …) — Phasen 1–8 immer der Reihe nach durchgehen |
| `data/` | Inhalte als CommonJS-Module — hier wird editiert |
| `scripts/` | Build- und Generator-Skripte |
| `server.js` | Nur lokale Entwicklung (TTS-Proxy, `/api/image`-Bildproxy, SRS-API) |
| `LERNPLAN.md` | A1–B1 Lehrplan mit Vokabeln/Grammatik |

## Starten & Bauen

```bash
# Nach JEDER Änderung in data/: Inhalte neu bauen und content/sprachen.json mitcommitten!
npm run build:content

# Lokal testen — Variante 1: rein statisch (wie GitHub Pages)
python3 -m http.server

# Variante 2: mit besserem TTS (Google-Proxy unter /tts)
node server.js   # → http://localhost:3000
```

Die App lädt Inhalte **nur** aus `content/sprachen.json` (nicht mehr über `/api/sprachen`).

## Deployment

GitHub Pages (Branch-Deploy, root). Die Seite liegt unter `/Russisch/` — deshalb nur
**relative Pfade** verwenden (kein führendes `/` bei fetch/src/href). `.nojekyll` liegt im Root.

---

## Dateistruktur `data/`

Hierarchie: **Sprache → Kapitel → Unterkapitel → Einheiten**, Reihenfolge über `meta.json` pro Ebene.

```
data/
├── russian/
│   ├── meta.json               ← { sprache, icon, ordnung: [{typ:'folder', name, ordner}] }
│   ├── a1/
│   │   ├── meta.json           ← ordnung: Unterkapitel-Ordner
│   │   └── a1.1/
│   │       ├── meta.json       ← ordnung: [{typ:'file', datei, format}]
│   │       ├── vokabeln-01.js  ← { typ:'vokabeln', titel, karten: [{ru, de, m}] }
│   │       ├── grammatik-02.js ← { typ:'grammatik', titel, fragen: [{q, a[3], c, m}] }
│   │       └── ...
│   └── a1-rev/
└── japanese/ (n2, n3)
```

**Stabile IDs:** `build_content.js` vergibt IDs wie `russian/a1/a1.1/vokabeln-01#солнце`
(Vokabeln: Pfad+RU-Wort; Fragen: Pfad+Index). Daran hängt der gespeicherte Fortschritt —
Karten/Fragen deshalb **nur anhängen, nie mittendrin einfügen oder umsortieren**.

## Trainer

- **Russisch-SRS** (`js/ui.js`): Karten aus `content/sprachen.json` (nur noch `vokabeln`-
  Einheiten relevant), Level aus `srs-levels.js`, beide Richtungen RU↔DE pro Karte.
  Erststand aus `srs-data.json` (Mai 2026), danach localStorage + Cloud (`settings.data`).
- **Mandarin** (`js/trainer.js`): Decks aus `vocab_items` — `zhuyin` (42, eigene Levels),
  `component`+`character` (L1–2 TOCFL-Basics, L3–12 WK, L13+ TOCFL), `word` (869).
  Gating: Komponenten vor Zeichen; Wörter erst, wenn alle ihre Zeichen gelernt sind.
  Tonfarben (1 orange/2 grün/3 blau/4 violett/neutral grau) auf Rückseiten + Lessons.
  Strichfolge via `vendor/hanzi-writer.min.js` (Zeichendaten vom CDN, offline still).
  PWA: `manifest.json` + `sw.js` (stale-while-revalidate; bei Shell-Änderungen VERSION
  in sw.js NICHT nötig zu bumpen — Updates greifen beim nächsten Start).
  Item-Keys: `typ:zeichen` — Zeichen/Zhuyin nie ändern, sonst reißt der Fortschritt ab.
  Inhalte pflegen: `scripts/seed_zhuyin.js` / `seed_hanzi.js` / `seed_words.js`
  (WK-Daten in `content-private/`, gitignored — NIE committen!).

---

## Steuerung

**KRITISCH:** Jeder Screen muss mit genau 3 Pedal-Tasten vollständig bedienbar sein.
Standard A/B/C, frei umbelegbar („⚙ Pedal-Tasten belegen" im Sprachen-Menü,
gespeichert als `pedalKeys` in settings). Zusätzlich ist alles klick-/antippbar (Maus/Touch).

| Screen | A | B | C |
|---|---|---|---|
| Menüs/Dashboards | hoch | auswählen | runter |
| Karte (vorne) | aufdecken | aufdecken | aufdecken |
| Karte (hinten, Review) | gewusst ✓ | gewusst ✓ | nochmal ↩ |
| Ergebnis | — | weiter | — |

**Design:** Markenfarbe Indigo (`--accent`), Rot nur semantisch (falsch/nochmal).
Light-/Dark-Mode automatisch via `prefers-color-scheme`.

## Text-to-Speech

- Überall: **Web Speech API** (`speechSynthesis`), Sprache pro Inhalt (`ru-RU`, `ja-JP`, `de-DE`).
  Fehlt eine Stimme → Konsolen-Hinweis, kein Fehler.
- Nur lokal mit `node server.js`: `/tts`-Proxy (Google Translate) wird automatisch bevorzugt.

## Neue Inhalte

```bash
python3 scripts/add_kapitel.py ...        # neues Kapitel-Gerüst
python3 scripts/generate_vocab.py         # Vokabeln aus SMARTool/OpenRussian
python3 scripts/export_anki.py            # Anki-Export
npm run build:content                     # danach IMMER neu bauen!
```

Neue Frage in bestehende Einheit: Datei in `data/.../grammatik-XX.js` öffnen und an
`fragen: [...]` **anhängen**: `{ q, a: [3 Optionen], c: Index-richtig, m: Merksatz }`

## Grammatik-Lehrplan (Referenz)

**Alle Grammatik-Einheiten orientieren sich am offiziellen RKI A1-Lehrplan** —
Referenzdatei im Projekt-Root: `A1-Lehrplan RKI.html`

| Kapitel | Grammatik I | Grammatik II |
|---|---|---|
| **a1.1** | Nullkopula, Pronomen, Genus, Possessivpronomen | Verneinung/Haben · Adjektive · Fragewörter/Präpositiv · Verbkonjugation · Zeitangaben |
| **a1.2** | Akkusativ (Objekt) | Bewegungsverben + Wohin (в/на+Akk.) |
| **a1.3** | Genitiv (Besitz, нет, у, Mengen, Zahlen) | Dativ (Adressat, Alter, нравиться) + Demonstrativpronomen |
| **a1.4** | Instrumental (заниматься, быть+Beruf, с+Instr.) | Präteritum + Aspektpaar + Futur + Imperativ + можно/нельзя/должен |

## Sicherheit

- `.env` ist gitignored — **Werte niemals lesen oder ausgeben**, nur Variablennamen.
- Supabase: Publishable Key in `js/config.js` ist öffentlich OK; **RLS auf jeder Tabelle ist Pflicht** (Repo ist public).
