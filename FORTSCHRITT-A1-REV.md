# Fortschritt A1 (überarbeitet)

## Konzept

Dieser Kurs verfolgt einen bewusst anderen Ansatz als der ursprüngliche A1-Kurs:

- **Extrem langsames Tempo bei Grammatik.** Jedes Thema wird in kleine Häppchen zerlegt, ausführlich erklärt und mit vielen Übungen gefestigt, bevor das nächste kommt. Lieber ein Thema wirklich verstehen als fünf halb.
- **Zu jeder Grammatik/Theorie direkt passende Texte, Dialoge und Hörübungen.** Keine trockene Regelsammlung — jede neue Struktur wird sofort in Kontext eingebettet, damit man sieht wie sie in der Praxis funktioniert.
- **Vokabeln werden separat über das SRS-System gelernt** und tauchen hier nicht als eigene Einheiten auf. Die Texte und Dialoge verwenden bewusst einfache Wörter, die nach und nach schwerer werden — grob orientiert an dem was man im SRS schon kennt. Aber nicht 1:1 — man soll auch lernen mit unbekannten Wörtern umzugehen und aus dem Kontext zu erschließen.
- **Keine Vokabel-Einheiten im Kurs.** Wortschatz kommt über SRS + natürliche Begegnung in Texten/Dialogen.

---

## Vokabel-Tracking

CSV-Datei: `data/russian/a1-rev/vokabel-tracker.csv`
- Spalte `einheit`: Nummer der Einheit in der das Wort eingeführt wird (leer = noch nicht benutzt)
- 482 Wörter gesamt, **30 bisher benutzt**

Schnell-Abfragen:
```bash
# Benutzte Wörter zählen
grep -c ";[0-9]" data/russian/a1-rev/vokabel-tracker.csv

# Freie Nomen (feminin)
grep ";f\.;" data/russian/a1-rev/vokabel-tracker.csv | grep ";$"

# Freie Verben
grep ";Verb;" data/russian/a1-rev/vokabel-tracker.csv | grep ";$"

# Wörter einer bestimmten Einheit
grep ";03$" data/russian/a1-rev/vokabel-tracker.csv
```

---

## Grammatik-Themen

| # | Thema | Einheit | Status |
|---|---|---|---|
| 1 | Personalpronomen (я/ты/он/она/оно/мы/вы/они) | 01 | ✅ |
| 2 | Nominativ — Genus erkennen (m./f./n.) | 02 | ✅ |
| 3 | Nullkopula — Это..., быть entfällt im Präsens | 03 | ✅ |
| 4 | Verneinung (да/нет/не) | 04 | ✅ |
| 5 | Fragewörter Кто?/Что? | 05 | ✅ |
| 6 | Possessivpronomen (мой/моя/моё, твой/твоя/твоё) | 06 | ✅ |
| 7 | Adjektive Nominativ (-ый/-ой/-ая/-ое) | 07 | ✅ |
| 8 | Fragewörter (где/куда/когда/как/почему) | — | ⬜ |
| 9 | Präpositiv (в/на + Wo?) | — | ⬜ |
| 10 | Verbkonjugation 1. Konjugation | — | ⬜ |
| 11 | Verbkonjugation 2. Konjugation | — | ⬜ |
| 12 | Zeitangaben (утром/днём/вечером/ночью) | — | ⬜ |
| 13 | Akkusativ Femininum (-а → -у) | — | ⬜ |
| 14 | Akkusativ Maskulinum (belebt/unbelebt) + Neutrum | — | ⬜ |
| 15 | Bewegungsverben (идти/ходить, ехать/ездить) | — | ⬜ |
| 16 | Wohin (в/на + Akk.) vs. Wo (в/на + Präp.) | — | ⬜ |
| 17 | Personalpronomen im Akkusativ | — | ⬜ |
| 18 | Genitiv (нет + Gen., Mengen, Zahlen) | — | ⬜ |
| 19 | Dativ (нравиться, Alter, indir. Objekt) | — | ⬜ |
| 20 | Demonstrativpronomen (этот/эта/это/эти) | — | ⬜ |
| 21 | Instrumental (с + Instr., Berufe) | — | ⬜ |
| 22 | Präteritum + Aspekt (imperfektiv/perfektiv) | — | ⬜ |
| 23 | Futur (буду + Inf. / perf. Verb) | — | ⬜ |
| 24 | Imperativ + Modalwörter (можно/нельзя/должен) | — | ⬜ |
| 25 | у + Gen. + есть (Haben) | — | ⬜ |

---

## Einheiten-Übersicht

| Einheit | Inhalt | Vokabeln | Text/Dialog/Hören |
|---|---|---|---|
| 01 | Personalpronomen | — | — |
| 02 | Nominativ & Genus | банк, аптека, автобус, библиотека, вино | — |
| 03 | Nullkopula (Это...) | студент, врач, школа, дом, окно | ✅ Text + Dialog + Hören |
| 04 | Verneinung (Да/Нет/Не) | ресторан, парк, магазин, книга, музей | ✅ Text + Dialog + Hören |
| 05 | Кто? & Что? | брат, сестра, друг, газета, письмо | ✅ Text + Dialog + Hören |
| 06 | Possessivpronomen | мама, папа, машина, комната, квартира | ✅ Text + Dialog + Hören |
| 07 | Adjektive Nominativ | большой, маленький, новый, старый, хороший | ✅ Text + Dialog + Hören |
