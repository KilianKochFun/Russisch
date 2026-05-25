# Russisch Quiz — Projektübersicht

## Dateien

| Datei/Ordner | Zweck |
|---|---|
| `russisch_quiz.html` | Die komplette App (UI, Navigation, Logik) |
| `quizze.js` | Alte Fragendatenbank — bleibt als Fallback im Menü |
| `server.js` | Node-Server + TTS-Proxy + `/api/kapitel` |
| `LERNPLAN.md` | A1–B1 Lehrplan (Kapitel 1–12) mit Vokabeln/Grammatik |
| `SPRACHE-HINZUFUEGEN.md` | **Workflow zum Anlegen neuer Sprachen** (Spanisch, Italienisch …) — Phasen 1–8 immer der Reihe nach durchgehen |
| `data/` | Kapitel-Module (JS) — hier werden Inhalte editiert |
| `scripts/` | Python-Hilfsskripte für Datengenerierung |

## Server starten

```bash
node server.js
# → http://localhost:3000
```

Der Server macht drei Dinge:
- Statische Dateien ausliefern
- TTS-Proxy unter `/tts?q=TEXT`
- `/api/kapitel` — lädt alle Kapitel aus `data/` und gibt JSON zurück

---

## Dateistruktur `data/`

```
data/
├── index.js                    ← require() aller Kapitel
├── a1-vokabeln-gesamt.js       ← Referenz: alle 482 A1-Wörter
├── a1.1/
│   ├── index.js                ← { id, name, beschreibung, einheiten: [...] }
│   ├── 01-vokabeln.js          ← { typ: 'vokabeln', karten: [{ru, de, m}] }
│   ├── 02-grammatik.js         ← { typ: 'grammatik', fragen: [{q, a[3], c, m}] }
│   ├── 03-dialog.js            ← { typ: 'dialog', tts, zeilen, fragen }
│   └── 05-text.js              ← { typ: 'text', tts, inhalt, fragen }
├── a1.2/ ... a1.4/
```

Dateinummern (`01-`, `02-` ...) bestimmen die Lernreihenfolge.

---

## Einheiten-Typen

| typ | Lernmodus | Pedal |
|---|---|---|
| `vokabeln` | Karteikarte: RU zeigen → aufdecken → DE + Merksatz | beliebig=aufdecken, A=gewusst, C=nochmal |
| `grammatik` | Multiple Choice (3 Optionen) | A/B/C=Antwort, dann beliebig=weiter |
| `dialog` | Zeile für Zeile mit TTS, dann Verständnisfragen | beliebig=nächste Zeile, dann A/B/C |
| `text` | TTS liest Text vor, dann Verständnisfragen | beliebig=zu Fragen, dann A/B/C |

---

## Neues Kapitel anlegen

```bash
python3 scripts/add_kapitel.py a2.1 "A2.1 — Kasussystem" \
  --einheiten vokabeln,grammatik,dialog,grammatik,text \
  --beschreibung "Alle 6 Fälle im Überblick"
```

Oder manuell: Ordner `data/a2.1/` anlegen, `index.js` + Einheiten-Dateien erstellen, dann in `data/index.js` eintragen.

---

## Neue Fragen in bestehende Einheit

Datei öffnen z.B. `data/a1.1/02-grammatik.js` und in `fragen: [...]` anhängen:

```javascript
{
  q: `Frage?`,
  a: [`Option A`, `Option B`, `Option C`],
  c: 0,        // Index der richtigen Antwort
  m: `Merksatz / Erklärung`
}
```

---

## Neue Vokabeln aus Datenquellen regenerieren

```bash
python3 scripts/generate_vocab.py          # A1 (Standard)
python3 scripts/generate_vocab.py --level A2   # A2-Wörter
python3 scripts/generate_vocab.py --dry-run    # nur Statistik
```

Quellen: SMARTool (GitHub) + OpenRussian (GitHub) — werden automatisch geladen und gecacht in `/tmp/russisch_cache/`.

---

## Grammatik-Lehrplan (Referenz)

**Alle Grammatik-Einheiten (`*-grammatik.js`) orientieren sich am offiziellen RKI A1-Lehrplan.**
Referenzdatei im Projekt-Root: `A1-Lehrplan RKI.html`

Themenverteilung nach Kapitel:

| Kapitel | Grammatik I (`02-`) | Grammatik II (`04-` oder `05-`/`08-`/...) |
|---|---|---|
| **a1.1** | Nullkopula, Pronomen, Genus, Possessivpronomen | Verneinung/Haben · Adjektive · Fragewörter/Präpositiv · Verbkonjugation · Zeitangaben |
| **a1.2** | Akkusativ (Objekt) | Bewegungsverben (идти/ходить, ехать/ездить) + Wohin (в/на+Akk.) |
| **a1.3** | Genitiv (Besitz, нет, у, Mengen, Zahlen) | Dativ (Adressat, Alter, нравиться) + Demonstrativpronomen |
| **a1.4** | Instrumental (заниматься, быть+Beruf, с+Instr.) | Präteritum + Aspektpaar + Futur + Imperativ + можно/нельзя/должен |

## Anki-Export

```bash
python3 scripts/export_anki.py                     # alle Vokabeln
python3 scripts/export_anki.py --kapitel a1.1      # nur ein Kapitel
```

---

## Steuerung (3-Tasten-Pedal — A, B, C)

**KRITISCH:** Nur diese 3 Tasten. Keine anderen Tasten hinzufügen.

| Screen | A | B | C |
|---|---|---|---|
| Menü | hoch | auswählen | runter |
| Karteikarte (vorne) | aufdecken | aufdecken | aufdecken |
| Karteikarte (hinten) | gewusst ✓ | gewusst ✓ | nochmal ↩ |
| Dialog lesen | nächste Zeile | nächste Zeile | nächste Zeile |
| Quiz-Frage | Antwort A | Antwort B | Antwort C |
| Nach Antwort | weiter | weiter | weiter |
| Ergebnis | hoch | auswählen | runter |

---

## Aktuelle Kapitel

| ID | Name | Status |
|---|---|---|
| `a1.1` | A1.1 — Erste Kontakte | vollständig (Vok+Gram+Dialog+Gram+Text) |
| `a1.2` | A1.2 | Vokabeln fertig, Grammatik TODO |
| `a1.3` | A1.3 | Vokabeln fertig, Grammatik TODO |
| `a1.4` | A1.4 | Vokabeln fertig, Grammatik TODO |
| *(alte Quizze)* | quizze.js | im Menü unter Trennlinie |

---

## Text-to-Speech

- Automatisch über `/tts?q=TEXT` (Google Translate Proxy)
- Nur wenn Server läuft **und** Internet vorhanden
- Karteikarten: spricht RU-Wort beim Erscheinen und beim Aufdecken
- Dialog/Text: spricht wenn `tts: true` gesetzt

TTS testen: `http://localhost:3000/tts?q=солнце`
