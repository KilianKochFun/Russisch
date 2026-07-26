#!/usr/bin/env node
// Seedet den russischen Bausteine-Trainer nach Supabase.
// Aufruf: node scripts/seed_russian_morph.js   (braucht SUPABASE_SECRET_KEY in .env)
// Idempotent: löscht vorher alle russian-morph-Einträge und schreibt neu.
//
// Der Aufbau folgt bewusst nicht dem Nutzen eines Worts, sondern seiner
// STRUKTUR — so wie das Mandarin-Deck bei den einfachsten Strichen anfängt.
// Das russische Gegenstück zur Strichzahl sind die Regeln, die beim Zusammen-
// kleben greifen:
//
//   Level 1  nichts greift, alles klebt glatt        в + ход  = вход
//   Level 2  Härtezeichen vor е/ё/ю/я                под + езд = подъезд
//   Level 3  з wird zu с vor stimmlosem Laut          раз + ход = расход
//
// Jedes Level bringt genau eine Regel und erntet die Wörter, die sie freigibt.
//
// HARTE REGEL für den Inhalt: jedes Wort muss sich restlos aus seinen Teilen
// erklären, und zwar mit der RÄUMLICHEN Grundbedeutung des Präfixes. Wörter,
// die eine zweite Präfixbedeutung oder einen Umweg über ein Verb brauchen
// (уход, указ, завод, повод), gehören in ein späteres Level — nicht als
// Ausnahme hier hinein.

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

// ── Bausteine ──────────────────────────────────────────────────────────────
// art: 'praefix' | 'wurzel'. Abgefragt wird nur eine Richtung — Baustein
// zeigen, Bedeutung denken. Die Gegenrichtung prüft nichts Nützliches.

const PRAEFIXE = [
  { form: 'в-',    de: 'hinein',   merk: 'Wie die Präposition в — in etwas hinein.' },
  { form: 'вы-',   de: 'heraus',   merk: 'Zieht immer die Betonung auf sich: вы́ход, вы́пуск, вы́вод.' },
  { form: 'до-',   de: 'bis hin',  merk: 'Wie до — bis zu einem Punkt, und keinen Schritt weiter.' },
  { form: 'про-',  de: 'hindurch', merk: 'Von einer Seite zur anderen, mitten durch.' },
  { form: 'под-',  de: 'heran',    merk: 'Wörtlich „unter“ — von unten herangehen, sich nähern.' },
  { form: 'об-',   de: 'herum',    merk: 'Einmal ringsum, außen herum.' },
  { form: 'от-',   de: 'weg von',  merk: 'Wie от — sich von etwas entfernen.' },
  { form: 'при-',  de: 'herbei',   merk: 'Ankommen, an einem Ziel eintreffen.' },
  { form: 'пере-', de: 'hinüber',  merk: 'Über etwas drüber, von hier nach dort.' },
];

const WURZELN = [
  { form: '-ход-',  de: 'gehen',  merk: 'Zu Fuß. Steckt in ходить = gehen.' },
  { form: '-ступ-', de: 'treten', merk: 'Einen Schritt setzen. Steckt in ступать = schreiten.' },
  { form: '-пуск-', de: 'lassen', merk: 'Zulassen, gewähren. Steckt in пускать = lassen.' },
  { form: '-вод-',  de: 'führen', merk: 'Jemanden oder etwas leiten. Steckt in водить = führen.' },
];

// ── Wörter ─────────────────────────────────────────────────────────────────
// [Wort mit Betonung, Präfix, Wurzel, wörtlich, deutsche Bedeutung]

const WOERTER = [
  ['вход',      'в-',    '-ход-',  'hinein-gehen',   'Eingang'],
  ['вы́ход',     'вы-',   '-ход-',  'heraus-gehen',   'Ausgang'],
  ['дохо́д',     'до-',   '-ход-',  'bis-hin-gehen',  'Einkommen'],
  ['прохо́д',    'про-',  '-ход-',  'hindurch-gehen', 'Durchgang'],
  ['подхо́д',    'под-',  '-ход-',  'heran-gehen',    'Herangehensweise'],
  ['обхо́д',     'об-',   '-ход-',  'herum-gehen',    'Umweg, Rundgang'],
  ['отхо́д',     'от-',   '-ход-',  'weg-gehen',      'Abgang, Rückzug'],
  ['прихо́д',    'при-',  '-ход-',  'herbei-gehen',   'Ankunft'],
  ['перехо́д',   'пере-', '-ход-',  'hinüber-gehen',  'Übergang'],

  ['до́ступ',    'до-',   '-ступ-', 'bis-hin-treten', 'Zugang'],
  ['вы́ступ',    'вы-',   '-ступ-', 'heraus-treten',  'Vorsprung'],
  ['о́тступ',    'от-',   '-ступ-', 'weg-treten',     'Rücktritt, Einzug'],
  ['по́дступ',   'под-',  '-ступ-', 'heran-treten',   'Annäherung'],

  ['впуск',     'в-',    '-пуск-', 'hinein-lassen',  'Einlass'],
  ['вы́пуск',    'вы-',   '-пуск-', 'heraus-lassen',  'Ausgabe'],
  ['про́пуск',   'про-',  '-пуск-', 'hindurch-lassen','Passierschein'],
  ['до́пуск',    'до-',   '-пуск-', 'bis-hin-lassen', 'Zulassung'],
  ['о́тпуск',    'от-',   '-пуск-', 'weg-lassen',     'Urlaub'],

  ['ввод',      'в-',    '-вод-',  'hinein-führen',  'Eingabe'],
  ['вы́вод',     'вы-',   '-вод-',  'heraus-führen',  'Ableitung, Schluss'],
  ['перево́д',   'пере-', '-вод-',  'hinüber-führen', 'Übersetzung'],
  ['про́вод',    'про-',  '-вод-',  'hindurch-führen','Kabel'],
  ['отво́д',     'от-',   '-вод-',  'weg-führen',     'Ableitung'],
  ['подво́д',    'под-',  '-вод-',  'heran-führen',   'Zuführung'],
];

// ── Zeilen bauen ───────────────────────────────────────────────────────────

const ohneBetonung = w => w.normalize('NFD').replace(/́/g, '').normalize('NFC');

const rows = [];
let pos = 0;
for (const p of PRAEFIXE) {
  rows.push({ language: 'russian-morph', item_type: 'morph', level: 1, position: pos++,
    data: { form: p.form, art: 'praefix', de: p.de, merk: p.merk } });
}
for (const w of WURZELN) {
  rows.push({ language: 'russian-morph', item_type: 'morph', level: 1, position: pos++,
    data: { form: w.form, art: 'wurzel', de: w.de, merk: w.merk } });
}

let wpos = 0;
for (const [wort, praefix, wurzel, woertlich, de] of WOERTER) {
  rows.push({ language: 'russian-morph', item_type: 'rusword', level: 1, position: wpos++,
    data: {
      wort: ohneBetonung(wort),      // Schlüssel und Abfrageform
      betont: wort,                  // mit Betonungszeichen, nur zur Anzeige
      de, woertlich,
      teile: [praefix, wurzel],      // verweist auf die morph-Karten
    } });
}

// ── Gegenprüfung, bevor irgendetwas hochgeht ───────────────────────────────
// Genau die Regel, die der Nutzer gesetzt hat: kein Wort ohne vollständige
// Zerlegung in Bausteine, die es auch wirklich gibt.
const bekannt = new Set([...PRAEFIXE, ...WURZELN].map(m => m.form));
let fehler = 0;
for (const [wort, ...teile] of WOERTER.map(w => [w[0], w[1], w[2]])) {
  for (const t of teile) {
    if (!bekannt.has(t)) { console.error(`✗ ${wort}: Baustein ${t} ist nicht definiert`); fehler++; }
  }
  const roh = ohneBetonung(wort);
  const zusammen = teile.map(t => t.replace(/-/g, '')).join('');
  if (roh !== zusammen) {
    console.error(`✗ ${wort}: Teile ergeben "${zusammen}", das Wort ist aber "${roh}"`);
    fehler++;
  }
}
if (fehler) { console.error(`\n${fehler} Problem(e) — nichts hochgeladen.`); process.exit(1); }
console.log(`✓ ${WOERTER.length} Wörter, jedes klebt buchstabengenau aus seinen Teilen zusammen.`);

// ── Hochladen ──────────────────────────────────────────────────────────────

async function main() {
  const h = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

  const del = await fetch(`${SUPA_URL}/rest/v1/vocab_items?language=eq.russian-morph`,
    { method: 'DELETE', headers: h });
  if (!del.ok) { console.error('Löschen fehlgeschlagen:', await del.text()); process.exit(1); }

  const ins = await fetch(`${SUPA_URL}/rest/v1/vocab_items`,
    { method: 'POST', headers: { ...h, Prefer: 'return=minimal' }, body: JSON.stringify(rows) });
  if (!ins.ok) { console.error('Einfügen fehlgeschlagen:', await ins.text()); process.exit(1); }

  const morphe = rows.filter(r => r.item_type === 'morph').length;
  const woerter = rows.filter(r => r.item_type === 'rusword').length;
  console.log(`✓ hochgeladen: ${morphe} Bausteine, ${woerter} Wörter`);
}
main();
