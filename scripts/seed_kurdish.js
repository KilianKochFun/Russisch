#!/usr/bin/env node
// Seedet den Kurdisch-Trainer (Kurmancî) nach Supabase.
// Aufruf: node scripts/seed_kurdish.js   (braucht SUPABASE_SECRET_KEY in .env)
// Idempotent: löscht vorher alle kurdish-Einträge und schreibt neu.
//
// ── Welches Kurdisch ──────────────────────────────────────────────────────
// „Mit lateinischem Alphabet“ entscheidet die Frage schon: Das ist Kurmancî,
// die nordkurdische Sprache der Türkei und Syriens, geschrieben im
// Hawar-Alphabet. Soranî im Süden schreibt arabisch, Zazakî ist eine eigene
// Sprache. Es ist also keine Auswahl, die ich getroffen habe — die Schrift
// legt die Varietät fest.
//
// ── Woher die Wörter kommen ───────────────────────────────────────────────
// Nicht aus meinem Kopf. Für Kurmancî gibt es keine CEFR-Wortliste und keine
// brauchbare freie Frequenzliste (FrequencyWords hat kein Kurdisch, die
// Leipziger Sammlung nur Soranî, Sketch Engine ist kostenpflichtig). Und
// Wikipedia-Häufigkeit wäre für einen Anfänger ohnehin die falsche Quelle:
// die bringt `bajarê`, `herêma`, `sala` — Enzyklopädiesprache.
//
// Stattdessen die SWADESH-LISTE: 207 Grundbegriffe, seit den 1950ern
// veröffentlicht und in der Sprachwissenschaft Standard, weil sie die
// Bedeutungen sammelt, die jede Sprache hat. Genau der Kern, den ein Anfänger
// braucht. Die kurmancî Spalte stammt aus dem englischen Wiktionary
// (Appendix:Kurmanji Swadesh list), gesichert in
// data/kurdish/swadesh-207-kmr.json.
//
// Wo die Quelle mehrere Varianten nennt (`se, seg, kûçik`), gilt die erste.
// Auch das ist eine Regel und keine Wahl.
//
// ── Zwei Decks ────────────────────────────────────────────────────────────
//   1. alfabe    — die Buchstaben, die ein Deutschsprachiger falsch liest
//   2. kuwoerter — die 207 Grundbegriffe, in Zehnerschritten der Swadesh-Ordnung
//
// Anders als bei Mandarin gibt es KEINE Sperre zwischen den Decks: Die
// Bedeutung von `masî` hängt an keiner Buchstabenregel, und die Aussprache
// steht auf der Karte. Wie beim Französischen.

const fs = require('fs');
const path = require('path');

const SUPA_URL = 'https://qqvmovinqupunbsexiev.supabase.co';
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);
const KEY = env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error('SUPABASE_SECRET_KEY fehlt in .env'); process.exit(1); }

// ── Die Klangnäherung ─────────────────────────────────────────────────────
// Dieselbe Haltung wie im Französisch-Trainer: keine Lautschrift, sondern
// deutsche Buchstaben, so gelesen, wie ein Deutschsprachiger sie liest. Ein
// zweites fremdes Zeichensystem wäre für einen Legastheniker kein Gewinn.
//
// Und als Regel im Code statt 207-mal von Hand — sonst läuft die Schreibweise
// auseinander, so wie beim ersten Französisch-Anlauf, wo vier Teillisten vier
// verschiedene Lautschriften hatten.
const KLANG = {
  'ç': 'tsch',   // çav — wie „Tscheche“
  'ş': 'sch',    // şev — wie „Schule“
  'c': 'dsch',   // ciwan — wie „Dschungel“
  'j': 'sch',    // jin — das weiche sch aus „Journal“
  'x': 'ch',     // xwîn — das ch aus „Bach“
  'q': 'k',      // qelp — ein k, aber tief im Rachen
  'ê': 'e',      // mêr — langes geschlossenes e
  'î': 'i',      // masî — langes i
  'û': 'u',      // xûn — langes u
  'i': '(e)',    // kirm — ein ganz kurzes, unbetontes e
  'e': 'ä',      // ez — kurzes offenes ä
  'v': 'w',      // av — genau das deutsche w
  's': 'ß',      // se — immer scharf
  'z': 's',      // zik — das weiche s aus „Rose“
  'y': 'j',      // yek — wie deutsches j
};

// In EINEM Durchlauf ersetzen. Nacheinander ginge schief: aus `ç`→`tsch`
// entstünde ein `s` und ein `c`, die die späteren Regeln wieder anfassen.
function klang(wort) {
  let out = '';
  for (const z of wort.toLowerCase()) out += (KLANG[z] !== undefined ? KLANG[z] : z);
  return out;
}

// ── Deck 1: das Alphabet ──────────────────────────────────────────────────
// Nur die Buchstaben, bei denen ein Deutschsprachiger daneben liegt. b, d, f,
// g, l, m, n, p, t liest er richtig und braucht keine Karte.
const ALFABE = [
  { form: 'c',  de: 'dsch',  merk: 'Wie in „Dschungel“ — nicht wie deutsches k oder z.', bsp: 'ciwan — jung' },
  { form: 'ç',  de: 'tsch',  merk: 'Wie in „Tscheche“. Das Häkchen macht aus dem dsch ein tsch.', bsp: 'çav — Auge' },
  { form: 'ş',  de: 'sch',   merk: 'Das harte sch wie in „Schule“.', bsp: 'şev — Nacht' },
  { form: 'j',  de: 'sch',   merk: 'Das WEICHE sch wie in „Journal“ — nicht das deutsche j.', bsp: 'jin — Frau' },
  { form: 'x',  de: 'ch',    merk: 'Das ch aus „Bach“, hinten im Hals. Kein ks.', bsp: 'xwîn — Blut' },
  { form: 'q',  de: 'k',     merk: 'Ein k, aber tiefer im Rachen gebildet als das normale k. Für den Anfang: sprich k.', bsp: 'qelp — Rinde' },
  { form: 'v',  de: 'w',     merk: 'Genau das deutsche w. Kurdisch schreibt v, wo Deutsch w schreibt.', bsp: 'av — Wasser' },
  { form: 'w',  de: 'w (englisch)', merk: 'Das englische w aus „water“, mit gerundeten Lippen. Deutsches w wäre v — dafür steht das kurdische v.', bsp: 'welat — Land' },
  { form: 's',  de: 'ß',     merk: 'Immer scharf wie in „Fass“, nie weich.', bsp: 'se — Hund' },
  { form: 'z',  de: 's',     merk: 'Das weiche s aus „Rose“.', bsp: 'zik — Bauch' },
  { form: 'y',  de: 'j',     merk: 'Wie das deutsche j in „ja“.', bsp: 'yek — eins' },
  { form: 'e',  de: 'ä',     merk: 'Kurzes offenes ä wie in „hätte“ — nicht wie deutsches e.', bsp: 'ez — ich' },
  { form: 'ê',  de: 'e',     merk: 'Langes geschlossenes e wie in „See“. Der Hut macht es lang.', bsp: 'mêr — Mann' },
  { form: 'i',  de: '(e)',   merk: 'Ein sehr kurzes, unbetontes e — kaum hörbar. In diesem Trainer in Klammern.', bsp: 'kirm — Wurm' },
  { form: 'î',  de: 'i',     merk: 'Langes i wie in „Bier“.', bsp: 'masî — Fisch' },
  { form: 'u',  de: 'u',     merk: 'Kurzes u.', bsp: 'kurt — kurz' },
  { form: 'û',  de: 'u',     merk: 'Langes u wie in „Hut“.', bsp: 'xûn — Blut' },
  { form: 'r / rr', de: 'r / rr', merk: 'Einfaches r wird geschlagen, doppeltes rr gerollt. Der Unterschied trägt Bedeutung.', bsp: 'pir — Brücke · pirr — viel' },
];

// ── Deck 2: die Swadesh-Begriffe ──────────────────────────────────────────
// Die deutschen Bedeutungen zu den englischen Glossen der Quelle, in deren
// Reihenfolge. Übersetzt, nicht ausgesucht — die Begriffe stehen fest.
const DEUTSCH = [
  'ich', 'du', 'er, sie, es', 'wir', 'ihr', 'sie (mehrere)', 'dies', 'jenes', 'hier', 'dort',
  'wer', 'was', 'wo', 'wann', 'wie', 'nicht', 'alle', 'viele', 'einige', 'wenige',
  'andere', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'groß', 'lang', 'breit', 'dick',
  'schwer', 'klein', 'kurz', 'eng', 'dünn', 'die Frau', 'der Mann', 'der Mensch', 'das Kind', 'die Ehefrau',
  'der Ehemann', 'die Mutter', 'der Vater', 'das Tier', 'der Fisch', 'der Vogel', 'der Hund', 'die Laus', 'die Schlange', 'der Wurm',
  'der Baum', 'der Wald', 'der Stock', 'die Frucht', 'der Samen', 'das Blatt', 'die Wurzel', 'die Rinde', 'die Blume', 'das Gras',
  'das Seil', 'die Haut', 'das Fleisch', 'das Blut', 'der Knochen', 'das Fett', 'das Ei', 'das Horn', 'der Schwanz', 'die Feder',
  'das Haar', 'der Kopf', 'das Ohr', 'das Auge', 'die Nase', 'der Mund', 'der Zahn', 'die Zunge', 'der Fingernagel', 'der Fuß',
  'das Bein', 'das Knie', 'die Hand', 'der Flügel', 'der Bauch', 'die Eingeweide', 'der Hals', 'der Rücken', 'die Brust', 'das Herz',
  'die Leber', 'trinken', 'essen', 'beißen', 'saugen', 'spucken', 'erbrechen', 'blasen', 'atmen', 'lachen',
  'sehen', 'hören', 'wissen', 'denken', 'riechen', 'sich fürchten', 'schlafen', 'leben', 'sterben', 'töten',
  'kämpfen', 'jagen', 'schlagen', 'schneiden', 'spalten', 'stechen', 'kratzen', 'graben', 'schwimmen', 'fliegen',
  'gehen', 'kommen', 'liegen', 'sitzen', 'stehen', 'sich drehen', 'fallen', 'geben', 'halten', 'drücken',
  'reiben', 'waschen', 'wischen', 'ziehen', 'schieben', 'werfen', 'binden', 'nähen', 'zählen', 'sagen',
  'singen', 'spielen', 'treiben (auf Wasser)', 'fließen', 'frieren', 'schwellen', 'die Sonne', 'der Mond', 'der Stern', 'das Wasser',
  'der Regen', 'der Fluss', 'der See', 'das Meer', 'das Salz', 'der Stein', 'der Sand', 'der Staub', 'die Erde', 'die Wolke',
  'der Nebel', 'der Himmel', 'der Wind', 'der Schnee', 'das Eis', 'der Rauch', 'das Feuer', 'die Asche', 'brennen', 'der Weg',
  'der Berg', 'rot', 'grün', 'gelb', 'weiß', 'schwarz', 'die Nacht', 'der Tag', 'das Jahr', 'warm',
  'kalt', 'voll', 'neu', 'alt', 'gut', 'schlecht', 'faul', 'schmutzig', 'gerade', 'rund',
  'scharf', 'stumpf', 'glatt', 'nass', 'trocken', 'richtig', 'nah', 'fern', 'rechts', 'links',
  'an, bei', 'in', 'mit', 'und', 'wenn', 'weil', 'der Name',
];

const SWADESH = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'data', 'kurdish', 'swadesh-207-kmr.json'), 'utf-8'));

const PRO_LEVEL = 25;

// ── Zeilen bauen ──────────────────────────────────────────────────────────
const rows = [];
ALFABE.forEach((a, i) => {
  rows.push({ language: 'kurdish', item_type: 'alfabe', level: 1, position: i,
    data: { form: a.form, de: a.de, merk: a.merk, bsp: a.bsp } });
});

const woerter = [];
SWADESH.forEach((e, i) => {
  const nr = Number(e[0]);
  const wort = e[2].split(',')[0].trim();       // erste Variante, wo die Quelle mehrere nennt
  const varianten = e[2].split(',').slice(1).map(s => s.trim()).filter(Boolean);
  woerter.push({ nr, wort, varianten, de: DEUTSCH[i], gloss: e[1] });
});

woerter.forEach((w, i) => {
  rows.push({
    language: 'kurdish', item_type: 'kuwort',
    level: Math.floor(i / PRO_LEVEL) + 1, position: i % PRO_LEVEL,
    data: {
      wort: w.wort, aussprache: klang(w.wort), de: w.de,
      swadesh: w.nr, gloss: w.gloss,
      ...(w.varianten.length ? { varianten: w.varianten } : {}),
    },
  });
});

// ── Gegenprüfung ──────────────────────────────────────────────────────────
let fehler = 0;
if (DEUTSCH.length !== SWADESH.length) {
  console.error(`✗ ${SWADESH.length} Swadesh-Begriffe, aber ${DEUTSCH.length} deutsche Bedeutungen`);
  fehler++;
}
const gesehen = new Map();
for (const w of woerter) {
  if (!w.wort) { console.error(`✗ ${w.nr} ${w.gloss}: kein kurdisches Wort`); fehler++; }
  if (!w.de) { console.error(`✗ ${w.nr} ${w.gloss}: keine deutsche Bedeutung`); fehler++; }
  // Doppelte sind hier KEIN Fehler: Swadesh fragt Begriffe ab, und zwei
  // Begriffe können im Kurdischen dasselbe Wort haben (this/that → ev/ew).
  // Aber zwei Karten mit demselben Wort UND derselben Bedeutung wären eine.
  const k = `${w.wort}|${w.de}`;
  if (gesehen.has(k)) { console.error(`✗ ${w.wort} „${w.de}“ steht doppelt`); fehler++; }
  gesehen.set(k, w.nr);
}
// Buchstaben, die die Klangnäherung nicht kennt, fallen sonst still durch.
// Punkte sind erlaubt: Kurmancî klammert manche Präpositionen um das Wort
// herum (`di ... de` für „in“), und diese Auslassung gehört zum Eintrag.
const UNBEKANNT = /[^a-zäöüß().' -]/;
for (const w of woerter) {
  const k = klang(w.wort);
  if (UNBEKANNT.test(k)) {
    console.error(`✗ ${w.wort} → „${k}“ enthält Zeichen, für die es keine Regel gibt`);
    fehler++;
  }
}
if (fehler) { console.error(`\n${fehler} Problem(e) — nichts hochgeladen.`); process.exit(1); }

const stufen = Math.ceil(woerter.length / PRO_LEVEL);
console.log(`✓ ${ALFABE.length} Buchstabenregeln, ${woerter.length} Swadesh-Begriffe in ${stufen} Leveln.`);
console.log('  Probe:', woerter.slice(0, 6).map(w => `${w.wort} [${klang(w.wort)}] ${w.de}`).join(' · '));

// ── Hochladen ─────────────────────────────────────────────────────────────
async function main() {
  if (process.argv.includes('--trocken')) { console.log('(trocken — nichts hochgeladen)'); return; }
  const h = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const del = await fetch(`${SUPA_URL}/rest/v1/vocab_items?language=eq.kurdish`, { method: 'DELETE', headers: h });
  if (!del.ok) { console.error('Löschen fehlgeschlagen:', await del.text()); process.exit(1); }
  const ins = await fetch(`${SUPA_URL}/rest/v1/vocab_items`,
    { method: 'POST', headers: { ...h, Prefer: 'return=minimal' }, body: JSON.stringify(rows) });
  if (!ins.ok) { console.error('Einfügen fehlgeschlagen:', await ins.text()); process.exit(1); }
  console.log(`✓ hochgeladen: ${rows.length} Items`);
}
main();
