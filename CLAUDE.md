# Sprachlern-App (Russisch + Japanisch) — Projektübersicht

Statische Web-App (Vanilla JS, ES Modules) — läuft ohne Server direkt von GitHub Pages.
Umbau-Fahrplan: siehe `PLAN.md` (Phase 1 ✅ statisch/Module · Phase 2 ✅ Supabase-Login/Fortschritt · Phase 3 Eingabemodi · Phase 4 PWA).

**Login-Flow:** Beim Start prüft `main.js` die Supabase-Session → Login-Screen (E-Mail+Passwort,
kein Registrieren) oder direkt App. „Ohne Anmeldung weiter" = kein Sync, nur lokal.
Fortschritt: Tabelle `progress` (card_id = stabile ID, known/again, simples Intervall-SRS),
Einstellungen (`lastEinheitId` u.a.) in `settings.data`. Menü bietet „Weiter lernen",
„Fällige Karten" (due_date ≤ heute) und „Abmelden".

## Dateien

| Datei/Ordner | Zweck |
|---|---|
| `index.html` | Markup + CSS aller Screens |
| `js/main.js` | Einstiegspunkt (lädt Inhalte, startet App) |
| `js/state.js` | Zentrales State-Objekt `S` + SRS-Stufen |
| `js/ui.js` | Alle Screens: Rendering + State-Übergänge |
| `js/input.js` | Eingabe (A/B/C-Pedal-Handler) |
| `js/content.js` | Lädt `content/sprachen.json` |
| `js/tts.js` | Sprachausgabe (Web Speech, lokal `/tts`-Proxy) |
| `js/config.js` | Supabase-URL + Publishable Key (öffentlich OK) |
| `js/supabase.js` | Supabase-Client + Auth (dynamisch importiert, Offline-Fallback) |
| `js/progress.js` | Fortschritt/SRS-Upserts + Settings (Weiter lernen, Fällige Karten) |
| `supabase/schema.sql` | DB-Schema (progress, settings, RLS) — im SQL-Editor ausführen |
| `content/sprachen.json` | **Generiert** aus `data/` — wird committet |
| `data/` | Inhalte als CommonJS-Module — hier wird editiert |
| `scripts/` | Build- und Generator-Skripte |
| `server.js` | Nur für lokale Entwicklung (TTS-Proxy) |
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

## Einheiten-Typen

| typ | Lernmodus |
|---|---|
| `vokabeln` | Karteikarte (Richtung RU→DE / MC / DE→RU wählbar), 5er-Pakete |
| `grammatik` | Multiple Choice (3 Optionen) |
| `dialog` | Zeile für Zeile mit TTS, dann Verständnisfragen + Review |
| `text` | TTS liest Text vor, dann Verständnisfragen + Review |
| `hoeren` | Nur hören (TTS), dann Fragen |
| `theorie` | Erklärkarten mit Tabellen/Beispielen |
| `kapiteltest` | Phasen-Test über alle Einheiten des Unterkapitels |

Außerdem: **SRS-Vokabeltrainer** (WaniKani-artig, Apprentice→Burned) — Fortschritt aktuell
in `localStorage` (`srs-russian`), ab Phase 2 in Supabase. Achtung: `srs-levels.js`
(Level-Einteilung `SRS_LEVELS`) wurde in Commit 42198cf gelöscht — ohne die Datei sind
im SRS keine neuen Karten lernbar, Rest der App läuft normal.

---

## Steuerung (3-Tasten-Pedal — A, B, C)

**KRITISCH:** Jeder Screen muss mit genau diesen 3 Tasten vollständig bedienbar sein.
(Ab Phase 3 frei belegbar + zusätzliche Modi Touch und Tastatur+Maus — siehe `PLAN.md`.)

| Screen | A | B | C |
|---|---|---|---|
| Menüs (Sprachen/Kapitel/Einheiten/Pakete) | hoch | auswählen | runter |
| Karteikarte (vorne) | aufdecken | aufdecken | aufdecken |
| Karteikarte (hinten) | gewusst ✓ | gewusst ✓ | nochmal ↩ |
| Dialog/Text/Theorie lesen | scrollen ↑ | weiter | scrollen ↓ |
| Quiz-Frage | Antwort A | Antwort B | Antwort C |
| Nach Antwort | weiter | weiter | weiter |
| Ergebnis | hoch | auswählen | runter |

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
