# Neue Sprache hinzufügen — Workflow für Claude

> **Für den User:** Sag einfach „Ich will Spanisch hinzufügen" (oder eine andere Sprache). Claude geht dann die Phasen unten **nacheinander** mit dir durch und stellt pro Phase **konkrete Fragen**, bevor irgendetwas geschrieben wird.
>
> **Für Claude:** Diese Datei ist ein verbindlicher Phasen-Workflow. **Niemals direkt mit Dateien loslegen.** Erst alle Phasen 1–4 durchsprechen, Antworten in einem Mini-Briefing zusammenfassen, vom User abnicken lassen, dann Phase 5 (Anlage) starten.

---

## Phase 1 — Lehrplan-Quelle wählen

**Frage an den User:** „An welchem offiziellen Lehrplan soll sich die Sprache orientieren?"

Pro Sprache gibt es typische Optionen:

| Sprache | Übliche Quellen |
|---|---|
| Spanisch | **CEFR/DELE** (Instituto Cervantes „Plan curricular") · SGEL „Nuevo Español en marcha" |
| Italienisch | **CEFR/CILS** · „Nuovo Espresso" (Alma Edizioni) |
| Französisch | **CEFR/DELF** · „Édito" (Didier) |
| Englisch | **CEFR/Cambridge** (KET/PET/FCE) |
| Japanisch | **JLPT** (N5→N1) · Genki I/II · WaniKani (für Kanji) |
| Chinesisch | **HSK 1–6** · NPCR |
| Russisch | **TRKI** (А1–С2) — wie aktuell |

**Pro Auswahl klären:**
1. Welche Level werden zuerst angelegt? (Empfehlung: nur **eines** starten, z.B. A1)
2. Wird das Level in **Unterkapitel** aufgeteilt? (Üblich: A1.1, A1.2, A1.3, A1.4)
3. Gibt es eine **konkrete Vokabelliste** (z.B. „A1 hat ~500 Wörter")? Wo kommt sie her?

---

## Phase 2 — Kapitel-Struktur festlegen

**Frage an den User:** „Wie groß soll ein Kapitel sein und wie ist es aufgebaut?"

**Russisch-Referenz (zur Orientierung):**
- A1 = 4 Unterkapitel (A1.1–A1.4)
- Pro Unterkapitel ~40 Einheiten (Mix aus Vokabeln + Grammatik + Dialog + Text + Hören)
- Pro Vokabeleinheit ~20 Karten

**Zu entscheiden:**
| Frage | Beispiel-Antworten |
|---|---|
| Wie viele Unterkapitel pro Hauptlevel? | 3, 4, 6, … |
| Welche Einheiten-Typen? | `vokabeln`, `grammatik`, `theorie`, `dialog`, `text`, `hoeren`, `kapiteltest` |
| Wie viele Vokabeln pro Einheit? | 10, 15, 20, … |
| Reihenfolge alphabetisch oder thematisch? | Russisch: alphabetisch. Spanisch: lieber thematisch? |
| Soll es einen Abschlusstest pro Unterkapitel geben? | ja/nein |

---

## Phase 3 — Grammatik-Lehrplan festlegen

**Frage an den User:** „Welche Grammatikthemen kommen in welches Kapitel?"

Pro Unterkapitel müssen **Grammatikthemen zugewiesen** werden. Beispiel Spanisch A1:

| Kapitel | Grammatik I | Grammatik II |
|---|---|---|
| A1.1 | Artikel · Genus · ser/estar (Basis) · Subjektpronomen | Präsens regelmäßig -ar/-er/-ir · Fragesätze |
| A1.2 | hay vs. está · Adjektive · Possessive | Reflexive Verben · Unregelmäßige (tener, ir, venir) |
| A1.3 | Direkte Objekte · gustar-Konstruktion | Präteritum perfecto · Demonstrative |
| A1.4 | Indirekte Objekte · Präpositionen | Imperativ · Futur (ir + a + infinitivo) |

**Quelle dafür:** Offizieller Lehrplan (z.B. Instituto Cervantes Plan Curricular A1) ODER ein etabliertes Lehrbuch (Aula Internacional, Nuevo Español en marcha …).

---

## Phase 4 — Stil & Format entscheiden

**Fragen an den User** (eine nach der anderen, nicht alle auf einmal):

### 4a. Fokus
- Mehr **Dialog**-orientiert (typische Alltagssituationen, viel TTS)?
- Mehr **Grammatik**-orientiert (lange Theorie, viele Übungen)?
- Mehr **Vokabel**-orientiert (große Karteikartensätze, weniger Grammatik)?
- Ausgewogen wie Russisch?

### 4b. Erklärungslänge & Aufspaltung
- **Lange Theorie-Texte** (ein Block pro Thema) oder **viele kurze** (aufgespalten in mehrere Häppchen)?
- **Russisch-Beispiel:** A1.1 hat z.B. `theorie-13a.js` (1. Konjugation) und `theorie-13b.js` (2. Konjugation + Sonderfälle) — aufgespalten, weil sonst zu lang.

### 4c. Vokabel-Merksätze
**KRITISCH — sonst hast du Platzhalter wie früher!** Sag dem User:
> „Jede Vokabel braucht im `m:`-Feld eine **echte Hilfe**, nicht nur `Verb` oder `Adj.` Stil-Optionen:
> 1. **Etymologie** (z.B. „Urverwandt mit dt. X, lat. Y")
> 2. **Eselsbrücke** (z.B. „Klingt wie X — denk an Y")
> 3. **Beispielsatz mit Übersetzung**
> 4. **Grammatik-Hinweis** (z.B. Konjugation, Stammwechsel, Genus-Falle)
>
> Empfehlung: **alle vier kombinieren**, so wie jetzt bei Russisch Level 2–5."

### 4d. Bilder / TTS
- Sollen Vokabelkarten **Bilder** zeigen (Unsplash-Lookup)?
- Soll **TTS** automatisch laufen? (Bei Japanisch z.B. **nicht** für WK-Lesetexte — User will Kanji selbst lesen.)

---

## Phase 5 — SRS-Level definieren

**Wichtig:** SRS-Level sind **separat vom Lehrplan**. Sie ordnen die Vokabeln **nach Häufigkeit/Nützlichkeit**, nicht nach Kapitelreihenfolge.

**So funktioniert das technisch:**
- Datei: `srs-levels.js` (aktuell nur für Russisch)
- Format: Array von Arrays von Keys `"vokabel|übersetzung"`
- SRS holt die Karten-Inhalte aus den `vokabeln-*.js`-Dateien per Key-Lookup
- **Key-Match muss exakt sein!** Wenn die Vokabelkarte `de: "Die Küche"` hat, aber das SRS-Level `кухня|Küche` erwartet → Karte wird nicht gefunden.

**Beim Anlegen einer neuen Sprache:**
1. Sollen SRS-Level erstellt werden? (ja/nein)
2. Wenn ja: separate Datei `srs-levels-spanish.js` o.ä. **oder** Multi-Sprach-Struktur in `srs-levels.js`?
3. Typische Level-Größe: 20 Wörter, thematisch gruppiert (Familie → Verben → Wohnung → Essen → Adjektive → …)

---

## Phase 6 — Erst nach User-Abnicken: technische Anlage

**Vorher:** Mini-Briefing schreiben mit allen Phase-1–5-Entscheidungen, vom User abnicken lassen.

**Dann:** Dateien anlegen — Reihenfolge:

```
data/spanish/
├── meta.json              ← { sprache: "Español", icon: "🇪🇸", ordnung: [...] }
└── a1/
    ├── meta.json          ← { name: "A1", ordnung: [...] }
    ├── a1.1/
    │   ├── meta.json      ← { name: "A1.1 — ...", beschreibung: "...", ordnung: [...] }
    │   ├── vokabeln-01.js
    │   ├── theorie-02.js
    │   ├── grammatik-02.js
    │   └── …
    ├── a1.2/
    └── …
```

**Vorlage `meta.json` (Sprach-Wurzel):**
```json
{
  "sprache": "Español",
  "icon": "🇪🇸",
  "ordnung": [
    { "typ": "folder", "name": "A1", "ordner": "a1" }
  ]
}
```

**Vorlage `meta.json` (Unterkapitel):**
```json
{
  "name": "A1.1 — Primeros contactos",
  "beschreibung": "Saludos, números, presentarse",
  "ordnung": [
    { "typ": "file", "name": "Saludos básicos", "datei": "vokabeln-01.js", "format": "vokabeln" },
    { "typ": "file", "name": "Artículos y género (Theorie)", "datei": "theorie-02.js", "format": "theorie" },
    { "typ": "file", "name": "Artículos y género", "datei": "grammatik-02.js", "format": "grammatik" }
  ]
}
```

**Einheiten-Formate** (gleich wie bei Russisch — siehe `CLAUDE.md`):
- `vokabeln`: `{ typ: 'vokabeln', titel, karten: [{ ru, de, m }] }` — bei anderer Sprache statt `ru` halt `es`/`it`/`fr`
- `theorie`: `{ typ: 'theorie', bloecke: [{ titel, erklaerung, beispiele, m }] }`
- `grammatik`: `{ typ: 'grammatik', fragen: [{ q, a[3], c, m }] }`
- `dialog`: `{ typ: 'dialog', tts, zeilen, fragen }`
- `text`: `{ typ: 'text', tts, inhalt, fragen }`
- `hoeren`: `{ typ: 'hoeren', tts, ... }`

⚠ **Achtung:** Das App-Schema verwendet aktuell `ru`/`de` als Feldnamen. Für andere Sprachen muss entweder
- (a) das Schema generisch werden (`l1`/`l2`), **oder**
- (b) die andere Sprache nutzt dieselben Feldnamen (`ru` als „Fremdsprache", `de` als Deutsch).

→ **Mit User klären, bevor angelegt wird.** Option (b) ist deutlich weniger Aufwand, ist aber „hässlich"; Option (a) sauberer aber ein Refactor.

---

## Phase 7 — Vokabelqualität sicherstellen

**Lehre aus Russisch:** Platzhalter wie `m: 'Verb'` oder `m: 'Adj.'` sind nutzlos. **Beim Anlegen direkt richtige Merksätze schreiben.**

Stil-Template (4 Bausteine, kombinieren):
```javascript
{ ru: `hablar`, de: `sprechen`, m: `Urverwandt mit lat. „fabulari" (erzählen) → engl. „fable", dt. „Fabel". 1. Konjugation (-ar): yo hablo, tú hablas, él habla. Eselsbrücke: HABLAR klingt wie „blah-blah".` }
```

**Pro Vokabel im Idealfall:**
1. **Etymologie** (1 Satz, idg./lat./gr. Wurzel oder Entlehnung)
2. **Grammatik-Info** (Konjugation, Genus, Stammwechsel)
3. **Beispielsatz oder Idiom**
4. (optional) **Eselsbrücke** wenn keine Etymologie greift

---

## Phase 8 — Nach Anlage: Verifikation

```bash
# Server starten
node server.js

# Prüfen: erscheint die Sprache im Menü?
# Stichprobe: 5 Vokabeln durchgehen → haben alle echte Merksätze?
# Wenn SRS-Level angelegt: Key-Match-Test
node -e "const L=require('./srs-levels-spanish.js'); const cards={}; /* ... lookup wie bei Russisch */"
```

---

## Anti-Pattern-Liste (NICHT machen)

1. ❌ Direkt mit dem Anlegen von Dateien beginnen, ohne Phase 1–4 zu klären
2. ❌ Vokabeln mit `m: 'Verb'`-Platzhaltern speichern (siehe Russisch-Bug-Historie)
3. ❌ SRS-Level anlegen, ohne Key-Match zu testen
4. ❌ Mehrere Levels (A1 + A2) gleichzeitig anlegen — **immer nur eines**
5. ❌ Lehrplan-Quelle nicht dokumentieren — später unklar, warum welche Themen wo

---

## Beispiel-Briefing (Spanisch, nach Phase 1–4)

> **Sprache:** Spanisch (Español, 🇪🇸)
> **Lehrplan:** Instituto Cervantes Plan Curricular A1, ergänzt mit „Aula Internacional 1"
> **Ziel-Vokabular:** ~500 Wörter A1
> **Struktur:** A1 = 4 Unterkapitel (A1.1 Saludos, A1.2 Familia/Casa, A1.3 Rutina/Comida, A1.4 Pasado/Planes)
> **Pro Unterkapitel:** ~35 Einheiten, Vokabel-Einheiten mit je 15 Karten
> **Fokus:** ausgewogen wie Russisch, aber leicht mehr Dialog (Spanisch ist gesprochene Sprache)
> **Theorie:** kurz halten, nach jedem Block direkt Grammatikübung
> **Vokabel-Stil:** Etymologie (lat. Wurzeln einfach!) + Konjugation + Beispielsatz
> **Bilder:** ja (Unsplash)
> **TTS:** ja (auch DE)
> **SRS-Level:** ja, separate Datei `srs-levels-spanish.js`, 20 Wörter pro Level, thematisch
> **Schema:** Option (b) — wir nutzen `ru`-Feld für Spanisch, kein Refactor

Wenn der User dieses Briefing abnickt → Phase 6 starten.
