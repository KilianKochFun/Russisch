# Kilian lernt Sprachen — Vokabeltrainer-Plattform (Projektübersicht)

Statische Web-App (Vanilla JS, ES Modules) — läuft ohne Server direkt von GitHub Pages.
**Reine Vokabeltrainer-Plattform** (WaniKani-Stil): Russisch-SRS + Mandarin (Zhuyin,
Komponenten/Zeichen, Wörter). Der alte Kapitelbaum (Grammatik/Dialoge/Texte/Japanisch)
wurde entfernt — Code/Daten in Git-History (bis Commit 58632d3). Fahrplan: `PLAN.md`.

Der **alte Russisch-SRS** (482 Einzelvokabeln, eigene SRS-Rechnung in `ui.js`)
ist entfernt — Kilian lernt Russisch jetzt über die Wortbausteine. Damit fällt
auch die zweite, parallele SRS-Implementierung weg; es gibt nur noch die in
`trainer.js`. Code und Daten stehen in der Git-History (bis Commit 90e0542).

**Login-Flow:** Beim Start prüft `main.js` die Supabase-Session → Login-Screen (E-Mail+Passwort,
kein Registrieren) oder direkt App. **Login ist Pflicht** — ohne Anmeldung keine Inhalte.
Lerninhalte für Mandarin: Tabelle `vocab_items` (RLS: nur eingeloggt). Fortschritt/Settings:
`settings.data` (SRS-Stände `srs-russian`, `trainer-*`, `pedalKeys`) + localStorage-Spiegel.

## Dateien

| Datei/Ordner | Zweck |
|---|---|
| `index.html` | Markup + CSS aller Screens |
| `icon.svg` + `icons/` | App-Icon: Ring aus Я 中 あ 한 ñ (Text als Pfade, nicht als Schrift!) |
| `js/main.js` | Einstiegspunkt (lädt Inhalte, startet App) |
| `js/state.js` | Zentrales State-Objekt `S` + SRS-Stufen |
| `js/ui.js` | Sprachen-Menü + Russisch-SRS-Trainer |
| `js/trainer.js` + `js/decks.js` | Generischer Trainer für Supabase-Decks (Mandarin) |
| `js/buecher.js` | Bücherregal: eigene Lehrbücher als PDF, im Browser lesen |
| `js/forecast.js` | Review-Vorschau — gemeinsam für Russisch-SRS und Mandarin |
| `js/sync.js` | Lernstand speichern: gebündelt, offlinefest, mit Statusanzeige |
| `js/input.js` | Pedal-Handler (Tasten frei belegbar) + Pedal-Setup |
| `js/content.js` | Lädt `content/sprachen.json` |
| `js/tts.js` | Sprachausgabe (Web Speech, lokal `/tts`-Proxy) |
| `js/config.js` | Supabase-URL + Publishable Key (öffentlich OK) |
| `js/screen.js` | Bildschirmwechsel — **eine** Fassung; stand vorher siebenmal im Projekt |
| `js/html.js` | `escapeHtml` für alles, was ein Mensch eingetippt hat |
| `js/merksatz.js` | Eigene Merksätze je Karte (Tabelle `merksaetze`, privat) |
| `js/vergleich.js` | Bestenliste über `bestenliste()` |
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

## Prüfen und Testen

```bash
node scripts/check_js.js       # jede Datei in js/ als ES-Modul parsen
node scripts/check_sw.js       # sw.js führt jedes Modul (sonst offline kaputt)
node scripts/check_trainer.js  # Sprachen vollständig verdrahtet, Schlüssel eindeutig
npm test                       # echte Browsertests (tests/, Chromium headless)
npm test faellig               # nur tests/faellig.test.mjs
npm test -- --sichtbar         # mit Fenster, zum Zusehen
```

**`tests/` fährt die echte App**: eigener statischer Server, Chromium über
`playwright-core`, Anmeldung über die echte Login-Maske. Ein **eigener
Testnutzer** (`test-harness@example.invalid`) bekommt pro Lauf ein frisches
Zufallspasswort über die Admin-Schnittstelle — kein Passwort steht in einer
Datei, und echter Lernstand wird nie angefasst. Nach jedem Lauf werden seine
Zeilen gelöscht, sonst stünde er in der Bestenliste.

`tests/harness.mjs` bietet `pedal('A')`, `klick`, `text`, `screen()`,
`oeffneSprache`, `bild()` (Screenshot) und `setzeKarten()`, um einen Zustand
herzustellen statt ihn zusammenzuklicken. `fehlerInKonsole()` meldet auch
fehlgeschlagene HTTP-Anfragen **mit Adresse** — die Konsole sagt sonst nur
„404“ ohne zu verraten, wofür.

Neuen Test schreiben: eine Datei `tests/<name>.test.mjs` mit `export const name`
und `export default async (app, soll) => { … }`. Wirft sie nichts, ist sie grün.

Alle drei sind aus konkreten Fehlern entstanden, nicht aus Prinzip. `check_sw.js`
zum Beispiel, weil vier neue Module in der Offline-Liste fehlten — online fällt
das nie auf, erst im Funkloch steht die App.

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
- **Mandarin** (`js/trainer.js`): 4 Decks aus `vocab_items` — `zhuyin` (42), `radikale`,
  `hanzi`, `word`. Curriculum V2: strukturell einfach→schwer aus TOCFL-Vorrat,
  deutsche Radikal-Namen, Zerlegungs-Hinweise; bewusst erst Level 1–3 gebaut
  (MAX_LEVEL in seed_hanzi.js erhöhen zum Erweitern). Leere Level werden übersprungen.
  Gating: Komponenten vor Zeichen; Wörter erst, wenn alle ihre Zeichen gelernt sind.
  Tonfarben (1 orange/2 grün/3 blau/4 violett/neutral grau) auf Rückseiten + Lessons.
  Strichfolge via `vendor/hanzi-writer.min.js` (Zeichendaten vom CDN, offline still).
  PWA: `manifest.json` + `sw.js` (stale-while-revalidate; bei Shell-Änderungen VERSION
  in sw.js NICHT nötig zu bumpen — Updates greifen beim nächsten Start).
  **Aber:** „beim nächsten Start" heißt einen Start *später*, weil stale-while-revalidate
  erst die alte Datei ausliefert. Bei einem Fehler, der aus dem alten Stand kommt
  (z.B. eine neue Sprache trifft auf ein `js/` von gestern), VERSION hochziehen —
  sonst sucht man den Fehler im Code, der längst richtig ist. **Ausnahme:
  geänderte Icons** — die hängen sonst im alten Cache, dann VERSION hochziehen.
  **iOS ignoriert `icon.svg` und die Manifest-Icons komplett**: ohne
  `<link rel="apple-touch-icon">` auf ein PNG landet beim „Zum Home-Bildschirm“ ein
  Screenshot der Seite als Symbol. Icons enthalten Text **als Pfade** (via
  `inkscape --export-text-to-path`), sonst rendern sie auf jedem Gerät anders.
  **Zwei Abfragen pro Item** (WaniKani-Modell): Zeichen und Wörter werden getrennt
  auf **Bedeutung** und **Lesung** geprüft, Radikale und Bausteine nur auf Bedeutung,
  Zhuyin nur auf Lesung — geregelt in `PRUEFUNGEN`. Item-Keys: `typ:zeichen#pruefung`,
  z.B. `character:好#lesung`. Zeichen/Zhuyin nie ändern, sonst reißt der Fortschritt ab.
  Alte Stände ohne `#` werden beim Laden einmalig auf alle Prüfungen kopiert
  (`migriereAufPruefungen`). Im Review wird die Vorderseite **nicht** vorgelesen —
  die Aussprache ist Teil der Antwort.
  `scripts/check_trainer.js` prüft, dass jede Inhaltssprache vollständig verdrahtet
  ist (Deck, Kopfzeile, Vorschau-Titel, TTS-Sprache, Typnamen, Anzeigetext je Item)
  — und dass jeder Item-Typ in **`KARTEN_ART`** steht. Diese Tabelle sagt, welche
  Bauform eine Karte hat (`regel` · `wort` · `morph` · `rusword` · `zhuyin` ·
  `hanzi`). Vorher stand die Zuordnung als `it.typ === 'a' || it.typ === 'b'` an
  vier Stellen einzeln; ein neuer Typ fiel durch alle Ketten bis in den
  Mandarin-Zweig, wo `d.zeichen` steht — auf der Karte stand „undefined“.
- **Russisch morphologisch** (`js/trainer.js`, Sprache `russian-morph`): zweites,
  eigenständiges Vorgehen neben dem Russisch-SRS. Wörter werden aus Präfix + Wurzel
  zusammengeklebt, statt als Ganzes gelernt. Zwei Decks: `bausteine` (morph) und
  `ruwoerter` (rusword); ein Wort wird erst frei, wenn alle seine Teile ≥ Apprentice
  sind. **Abfrage nur in einer Richtung** — Form sehen, Bedeutung denken.
  Aufbau nach STRUKTUR, nicht nach Nützlichkeit: Level 1 klebt glatt (в+ход),
  Level 2 bringt das Härtezeichen (под+езд→подъезд), Level 3 die з→с-Regel
  (раз+ход→расход). **Harte Regel: jedes Wort muss sich restlos aus seinen Teilen
  erklären, mit der räumlichen Grundbedeutung des Präfixes.** Wörter, die eine
  zweite Präfixbedeutung oder einen Umweg übers Verb brauchen (уход, указ, завод,
  повод), gehören in ein späteres Level — nicht als Ausnahme dazwischen.
  Pflegen mit `scripts/seed_russian_morph.js`; das Skript prüft vor dem Upload,
  dass jedes Wort buchstabengenau aus seinen Bausteinen zusammengeht.

- **Französisch** (`js/trainer.js`, Sprache `french`): vier Decks — `aussprache`
  (19 Lautregeln), `bruecken` (10 Regeln, die Wortbündel über Deutsch/Englisch
  erschließen: das Dach auf forêt markiert ein verlorenes s), `frwoerter`
  (400 Wörter in 8 Leveln) und `reise` (24 Wendungen). **Keine Sperre** — anders
  als bei Mandarin hängt die Bedeutung eines Worts an keiner Lautregel, und die
  Aussprache steht ohnehin auf der Karte. **`frwoerter` steht deshalb zuerst**
  in der Deckliste: Der Dashboard-Cursor landet auf dem ersten freigeschalteten
  Eintrag, und mit drei Pedaltasten ist jede Zeile davor echte Arbeit.
  **Der Wortschatz ist nicht handverlesen**, sondern die häufigsten 400 der
  1196 A1-Wörter aus FLELex (Beacco-Fassung, folgt dem Europarat-Referential):
  `data/french-a1-400.json`, deckt ~93 % ab. Die 1196 sind KEINE Lernvorgabe —
  FLELex zählt, was in Lehrwerken vorkommt, nicht was man können muss.
  **Klangnäherung statt Lautschrift**, Konventionen in
  `~/Dokumente/Franzoesisch-Lehrbuch/referenz/KONVENTIONEN.md`. Wichtig:
  `oi` wird **`ua`** geschrieben, nie `wa` — deutsches w spricht man /v/, und
  `w` steht schon für französisches v (`voir` gäbe sonst `wwar`).

- **Kurdisch** (`js/trainer.js`, Sprache `kurdish`): Kurmancî im Hawar-Alphabet —
  „lateinische Schrift" legt die Varietät fest (Soranî schreibt arabisch, Zazakî
  ist eine eigene Sprache). Zwei Decks: `alfabe` (18 Buchstaben, die ein
  Deutschsprachiger falsch liest) und `kuwoerter` (207 Wörter in 9 Leveln).
  **Keine Sperre**, wie beim Französischen.
  **Der Wortschatz ist nicht handverlesen**, sondern die **Swadesh-Liste** —
  207 Grundbegriffe, seit den 1950ern veröffentlicht, kurmancî Spalte aus dem
  englischen Wiktionary, gesichert in `data/kurdish/swadesh-207-kmr.json`.
  Wo die Quelle mehrere Varianten nennt (`se, seg, kûçik`), gilt die erste.
  Für Kurmancî gibt es weder eine CEFR-Liste noch eine freie Frequenzliste
  (FrequencyWords hat kein Kurdisch, Leipzig nur Soranî) — und
  Wikipedia-Häufigkeit gäbe einem Anfänger `bajarê` statt `av`.
  Klangnäherung wie beim Französischen, aber **als Regel im Code**
  (`KLANG` in `seed_kurdish.js`), nicht 207-mal von Hand.
  Pflegen mit `scripts/seed_kurdish.js`.

  Inhalte pflegen: `scripts/seed_zhuyin.js` / `seed_hanzi.js` / `seed_words.js`
  (WK-Daten in `content-private/`, gitignored — NIE committen!).

---

## Bücherregal

Die selbstgeschriebenen Lehrbücher (`~/Dokumente/Japanisch-Lehrbuch`,
`~/Dokumente/Chinesisch-Lehrbuch`) liegen als PDF im Supabase-Bucket **`buecher`**
— **nicht public**. `js/buecher.js` holt nach dem Login eine signierte URL (1 h)
und hängt sie in ein `<iframe>`; der PDF-Viewer des Browsers macht den Rest.
Herunterladen geht über denselben Link. Ohne Session gibt es keine gültige URL.

Neues Buch hochladen (Secret Key umgeht RLS, **beide** Header nötig — ohne
`apikey` antwortet Storage mit `Invalid Compact JWS`):

```bash
set -a && . ./.env && set +a
curl -X POST "$SUPABASE_URL/storage/v1/object/buecher/DATEI.pdf" \
  -H "apikey: $SUPABASE_SECRET_KEY" -H "Authorization: Bearer $SUPABASE_SECRET_KEY" \
  -H "Content-Type: application/pdf" -H "x-upsert: true" \
  --data-binary "@pfad/zum/buch.pdf"
```

Danach den Eintrag in der Liste `BUECHER` in `js/buecher.js` ergänzen.

**Migrationen:** die Direktverbindung (`db.<ref>.supabase.co`) ist nur über IPv6
erreichbar. Falls das Netz kein IPv6 hat, läuft es über den Pooler
`aws-0-eu-central-1.pooler.supabase.com:5432` mit Benutzer `postgres.<projekt-ref>`
— und das Passwort muss prozentkodiert werden, es enthält Sonderzeichen.

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
| Buch-Viewer | zurück | herunterladen | zurück |
| Review-Vorschau | hoch | Tag auf-/zuklappen | runter |
| Statistik | hoch | zurück | runter |
| Karte (vorne, Review) | rückgängig* | aufdecken | aufdecken |
| Ergebnis | — | weiter | — |

\* Rückgängig nur, solange eine Antwort zurückzunehmen ist; sonst deckt auch A auf.

**Vergleich:** `js/vergleich.js` zeigt eine Bestenliste — gesamt und je Sprache.
Die Zahlen kommen aus der Datenbankfunktion `bestenliste()`, die mit
`security definer` an der RLS vorbei rechnet, aber **nur Summen** zurückgibt;
fremde Einzelkarten sieht niemand. Ohne Anmeldung liefert sie null Zeilen.
Sortiert wird nach Karten ab Guru, nicht nach Kartenzahl. Namen stehen in
`profiles` (lesbar für alle Angemeldeten, änderbar nur der eigene) — **nie** die
E-Mail-Adresse. Migrationen einspielen mit `python3 scripts/migrate.py <datei.sql>`.

**Speichern:** Lernstände liegen als **eine Zeile je Karte** in `srs_cards`/`srs_decks`
(nicht mehr als Klumpen in `settings.data` — das führte dazu, dass zwei Geräte sich
gegenseitig überschrieben). `js/sync.js` sammelt Änderungen, schreibt nach 2,5 s Ruhe
gebündelt, puffert bei Fehlschlag und offline in localStorage und zeigt den Status
oben rechts. Alte Stände werden beim ersten Betreten des Trainers übernommen.

**Tagesübersicht:** Über dem Sprachen-Menü steht, wie viel *jetzt* fällig ist und
was *heute noch* dazukommt — gesamt und je Sprache. Die Zahlen kommen aus
`faelligkeiten()` in `js/sync.js`, das **nur `srs_cards` liest**: Fälligkeit hängt
an `next_review`, nicht an den Vokabeldaten. Sonst müsste die App vier Sprachen
aus `vocab_items` laden, bevor überhaupt ein Menü steht. Eine Minute gecacht,
nach jeder Antwort verworfen.

**Gestrichelte Rahmen** in der Übersicht heißen **Baustein** — Radikal
(`component`) oder russisches Wortteil (`morph`), also kein eigenes Wort. Der
Rahmen*farbe* ist die SRS-Stufe. Beides steht seit v15 als Legende im Kopf der
Übersicht; vorher musste man es raten.

**Dashboard-Cursor:** steht beim Öffnen auf dem **zuletzt benutzten Deck**
(`trainer-letztesDeck-<sprache>` in den Settings), bei fälligen Reviews auf
denen. Reihenfolge der Decks ist damit nicht mehr egal, aber auch nicht mehr
alles.

**Design:** Markenfarbe Indigo (`--accent`), Rot nur semantisch (falsch/nochmal).
Light-/Dark-Mode automatisch via `prefers-color-scheme`.

## Text-to-Speech

- Auf der Detailseite eines Items ist das große Wort **antippbar zum Anhören**.
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
