#!/usr/bin/env node
// Seedet den Französisch-Trainer nach Supabase.
// Aufruf: node scripts/seed_french.js   (braucht SUPABASE_SECRET_KEY in .env)
// Idempotent: löscht vorher alle french-Einträge und schreibt neu.
//
// Aufbau nach demselben Gedanken wie die anderen Sprachen — erst das System,
// dann die Wörter. Für Französisch heißt das etwas anderes als für Russisch:
//
//   Morphologie bringt hier NICHTS. Die französischen Präfixe und Suffixe sind
//   lateinisch, und dieselben stecken längst im Deutschen — `préparation` neben
//   `Präparation` ist kein Erkenntnisgewinn. Die Wurzeln wiederum sind für
//   Deutschsprachige tot: `-cev-` in recevoir sagt niemandem etwas.
//
//   Der Hebel liegt woanders: bei den LAUTREGELN (Schrift und Aussprache laufen
//   im Französischen weit auseinander, aber regelmäßig) und bei den BRÜCKEN zum
//   Deutschen und Englischen. Das Dach auf forêt markiert ein verlorenes s —
//   und das s steht in „Forst“ noch da. Eine Karte, hunderte Wörter.
//
// Drei Decks, in dieser Reihenfolge freigeschaltet:
//   1. Aussprache — ohne die rätst du bei jedem Wort
//   2. Brücken    — Regeln, die je ein Bündel Wörter geschenkt bringen
//   3. Wörter     — was keine Regel abdeckt, nach Häufigkeit

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

// ── Deck 1: Aussprache ─────────────────────────────────────────────────────
// form = das Schriftbild, de = wie es klingt, merk = die Regel dahinter
const AUSSPRACHE = [
  { form: '-t -d -s -x -z', de: 'schweigt am Wortende',
    merk: 'petit klingt „p(ö)ti“, grand klingt „grã“. Der Buchstabe steht da, gesprochen wird er nicht.',
    bsp: [['petit', 'p(ö)ti', 'klein'], ['grand', 'grã', 'groß']] },
  { form: 'c r f l', de: 'am Wortende gesprochen',
    merk: 'Die vier Ausnahmen zur Regel oben. Merkhilfe: C-a-R-e-F-u-L.',
    bsp: [['bonjour', 'bõschur', 'guten Tag'], ['neuf', 'nöf', 'neun']] },
  { form: '-ent (bei Verben)', de: 'schweigt komplett',
    merk: 'ils parlent ist EINE Silbe: „parl“. Die häufigste Falle beim Vorlesen.',
    bsp: [['ils parlent', 'il parl', 'sie sprechen']] },
  { form: '-e', de: 'schweigt am Wortende',
    merk: 'table klingt „tabl“, ohne Vokal am Schluss.',
    bsp: [['table', 'tabl', 'Tisch'], ['France', 'frãss', 'Frankreich']] },
  { form: 'ou', de: 'u', merk: 'Immer u, nie „au“.',
    bsp: [['vous', 'wu', 'ihr / Sie'], ['bonjour', 'bõschur', 'guten Tag']] },
  { form: 'u', de: 'ü', merk: 'Das einfache u ist immer ü. Für u braucht es ou.',
    bsp: [['tu', 'tü', 'du'], ['rue', 'rü', 'Straße']] },
  { form: 'oi', de: 'ua', merk: 'Ein kurzes u, das sofort in den nächsten Vokal rutscht. '
    + 'Nicht „wa“ — deutsches w spricht man wie v, und dafür steht w hier schon.',
    bsp: [['moi', 'mua', 'ich'], ['trois', 'trua', 'drei'], ['voir', 'wuar', 'sehen']] },
  { form: 'ai · ei', de: 'ä', merk: 'Offenes ä wie in „hätte“.',
    bsp: [['mais', 'mä', 'aber'], ['seize', 'ßäs', 'sechzehn']] },
  { form: 'au · eau', de: 'o', merk: 'eaux ist ein einziger Laut: o.',
    bsp: [['eau', 'o', 'Wasser'], ['bateau', 'bato', 'Boot']] },
  { form: 'eu · œu', de: 'volles ö', merk: 'Wie in „Köln“. Zu unterscheiden vom schwachen (ö), '
    + 'das aus einem schlichten e kommt und oft ganz wegfällt: je klingt sch(ö).',
    bsp: [['deux', 'dö', 'zwei'], ['sœur', 'ßör', 'Schwester']] },
  { form: 'ch', de: 'sch', merk: 'Nie wie deutsches „ch“.',
    bsp: [['chat', 'scha', 'Katze'], ['chercher', 'schärsche', 'suchen']] },
  { form: 'j · ge · gi', de: 'weiches sch',
    merk: 'Wie das g in „Garage“ oder das j in „Journal“.',
    bsp: [['je', 'sch(ö)', 'ich'], ['manger', 'mãsche', 'essen']] },
  { form: 'qu', de: 'k', merk: 'Kein „kw“ wie im Deutschen.',
    bsp: [['qui', 'ki', 'wer'], ['quatre', 'katr', 'vier']] },
  { form: 'h', de: 'schweigt immer', merk: 'Wird nie gesprochen, egal wo es steht.',
    bsp: [['homme', 'om', 'Mann'], ['heure', 'ör', 'Stunde']] },
  { form: 'gn', de: 'nj', merk: 'Wie in „Champagner“.',
    bsp: [['montagne', 'mõtanj', 'Berg']] },
  { form: 'an · am · en · em', de: 'nasales ã',
    merk: 'Durch die Nase, das n selbst wird nicht gesprochen.',
    bsp: [['grand', 'grã', 'groß'], ['temps', 'tã', 'Zeit / Wetter']] },
  { form: 'on · om', de: 'nasales õ', merk: 'Wie ã, nur mit o-Färbung.',
    bsp: [['bon', 'bõ', 'gut'], ['nom', 'nõ', 'Name']] },
  { form: 'in · ain · ein · un', de: 'nasales ä̃',
    merk: 'Das dritte Nasal. Offener als die anderen beiden.',
    bsp: [['vin', 'wä̃', 'Wein'], ['pain', 'pä̃', 'Brot']] },
  { form: 'Liaison', de: 'stummer Endkonsonant wird vor Vokal doch gesprochen',
    merk: 'les amis klingt „lesami“. Deshalb hört man Wortgrenzen kaum.',
    bsp: [['les amis', 'lesami', 'die Freunde'], ['vous avez', 'wusawe', 'ihr habt']] },
];

// ── Deck 2: Brücken ────────────────────────────────────────────────────────
// Regeln, die je ein Bündel Wörter freischalten
const BRUECKEN = [
  { form: '◌̂  (Dach)', de: 'hier stand früher ein s',
    merk: 'Setz ein s ein, dann erkennst du das deutsche oder englische Wort.',
    bsp: [['forêt', 'Forst / forest', 'Wald'], ['hôpital', 'Hospital', 'Krankenhaus'],
          ['château', 'Castell / castle', 'Schloss'], ['fête', 'Fest / feast', 'Fest'],
          ['maître', 'Meister / master', 'Meister'], ['août', 'August', 'August']] },
  { form: 'é- am Wortanfang', de: 'auch hier fehlt ein s',
    merk: 'Dasselbe wie beim Dach, nur am Wortanfang.',
    bsp: [['école', 'Schule / school', 'Schule'], ['étoile', 'Stern / star', 'Stern'],
          ['étudiant', 'Student', 'Student'], ['île', 'Insel / isle', 'Insel']] },
  { form: '-tion', de: '= deutsch -tion',
    merk: 'Praktisch ausnahmslos. Aussprache: „ßjõ“.',
    bsp: [['nation', 'Nation', 'Nation'], ['station', 'Station', 'Bahnhof'],
          ['information', 'Information', 'Auskunft']] },
  { form: '-té', de: '= deutsch -tät',
    merk: 'Aussprache: „te“.',
    bsp: [['université', 'Universität', 'Universität'], ['qualité', 'Qualität', 'Qualität'],
          ['liberté', 'Liberalität', 'Freiheit']] },
  { form: '-ique', de: '= deutsch -isch / -ik',
    merk: 'Aussprache: „ik“.',
    bsp: [['musique', 'Musik', 'Musik'], ['politique', 'Politik', 'Politik'],
          ['pratique', 'praktisch', 'praktisch']] },
  { form: '-eur', de: '= deutsch -eur / -or',
    merk: 'Meist der Handelnde. Aussprache: „ör“.',
    bsp: [['professeur', 'Professor', 'Lehrer'], ['docteur', 'Doktor', 'Arzt'],
          ['ordinateur', '(Ordinator)', 'Computer']] },
  { form: '-aire', de: '= deutsch -är',
    merk: 'Aussprache: „är“.',
    bsp: [['nécessaire', 'notwendig', 'nötig'], ['ordinaire', 'ordinär', 'gewöhnlich']] },
  { form: '-age', de: '= deutsch -age',
    merk: 'Die deutschen -age-Wörter sind alle von hier. Aussprache: „asch“.',
    bsp: [['garage', 'Garage', 'Garage'], ['voyage', '(Voyage)', 'Reise'],
          ['message', 'Message', 'Nachricht']] },
  { form: '-ment', de: 'macht ein Adverb, = deutsch -lich / -weise',
    merk: 'An die weibliche Form des Adjektivs gehängt.',
    bsp: [['normalement', 'normalerweise', 'normalerweise'],
          ['seulement', '(einzig-lich)', 'nur']] },
  { form: 'ch- statt k-', de: 'wo Deutsch k hat, steht oft ch',
    merk: 'Aus lateinischem c wurde im Französischen ch.',
    bsp: [['chanter', '(kantieren)', 'singen'], ['chambre', '(Kammer)', 'Zimmer'],
          ['champ', '(Kampagne)', 'Feld']] },
];

// ── Deck 3: Wörter ────────────────────────────────────────────────────────
// Nicht mehr handverlesen, sondern aus FLELex (Beacco-Fassung, die dem
// Europarat-Referential für Französisch folgt): die häufigsten 400 der 1196
// A1-Wörter. Das deckt rund 93 % aller Vorkommen in A1-Material ab und liegt
// damit in derselben Größenordnung wie HSK 1 (500) oder JLPT N5 (~800).
//
// Die 1196 sind KEINE Lernvorgabe — FLELex zählt, welche Wörter in Lehrwerken
// vorkommen, nicht welche man beherrschen muss. Der Langschwanz (divorcer,
// électricité …) bringt zusammen etwa ein Prozent.
const A1 = require('../data/french-a1-400.json');
const PRO_LEVEL = 50;

// ── Deck 4: Unterwegs ─────────────────────────────────────────────────────
// Wörter und Wendungen, die auf einer Reise sofort gebraucht werden, aber
// nicht unter den häufigsten 400 stehen — teils weil sie seltener sind, teils
// weil FLELex nur Einzelwörter kennt und keine Wendungen.
const UNTERWEGS = [
  ['bonsoir', 'bõßuar', 'guten Abend'],
  ['pardon', 'pardõ', 'Entschuldigung'],
  ['s\u2019il vous pla\u00eet', 'ßilwuplä', 'bitte'],
  ['au revoir', 'or(ö)wuar', 'auf Wiedersehen'],
  ['gare', 'gar', 'Bahnhof'],
  ['billet', 'bijä', 'Fahrkarte'],
  ['cl\u00e9', 'kle', 'Schlüssel'],
  ['addition', 'adißjõ', 'Rechnung'],
  ['argent', 'arschã', 'Geld'],
  ['march\u00e9', 'marsche', 'Markt'],
  ['ouvert', 'uwär', 'geöffnet'],
  ['ferm\u00e9', 'färme', 'geschlossen'],
  ['droite', 'druat', 'rechts'],
  ['tout droit', 'tu drua', 'geradeaus'],
  ['entr\u00e9e', 'ãtre', 'Eingang'],
  ['sortie', 'ßorti', 'Ausgang'],
  ['toilettes', 'tualät', 'Toilette'],
  ['aide', 'äd', 'Hilfe'],
  ['perdu', 'pärdü', 'verloren'],
  ['pain', 'pä̃', 'Brot'],
  ['je voudrais', 'sch(ö) wudrä', 'ich hätte gern'],
  ['je ne comprends pas', 'sch(ö) n(ö) kõprã pa', 'ich verstehe nicht'],
  ['parlez-vous allemand ?', 'parle wu almã', 'sprechen Sie Deutsch?'],
  ['combien \u00e7a co\u00fbte ?', 'kõbjä̃ ßa kut', 'was kostet das?'],
];

// ── Zeilen bauen ───────────────────────────────────────────────────────────

const rows = [];
let p = 0;
for (const a of AUSSPRACHE) {
  rows.push({ language: 'french', item_type: 'aussprache', level: 1, position: p++,
    data: { form: a.form, de: a.de, merk: a.merk, bsp: a.bsp } });
}
p = 0;
for (const b of BRUECKEN) {
  rows.push({ language: 'french', item_type: 'bruecke', level: 1, position: p++,
    data: { form: b.form, de: b.de, merk: b.merk, bsp: b.bsp } });
}
let wp = 0, lvl = 1;
for (const e of A1) {
  if (wp >= PRO_LEVEL) { wp = 0; lvl++; }
  rows.push({ language: 'french', item_type: 'fword', level: lvl, position: wp++,
    data: { wort: e.wort, aussprache: e.aus, de: e.de, wortart: e.tag, rang: e.rang } });
}
let up = 0;
for (const [wort, aus, de] of UNTERWEGS) {
  rows.push({ language: 'french', item_type: 'reise', level: 1, position: up++,
    data: { wort, aussprache: aus, de } });
}

// ── Gegenprüfung ───────────────────────────────────────────────────────────
let fehler = 0;
const gesehen = new Set();
for (const { wort } of A1) {
  if (gesehen.has(wort)) { console.error(`✗ ${wort} steht doppelt in der Liste`); fehler++; }
  gesehen.add(wort);
}
for (const r of rows) {
  if (!r.data.de) { console.error(`✗ ohne Bedeutung: ${JSON.stringify(r.data).slice(0, 60)}`); fehler++; }
  if ((r.item_type === 'fword' || r.item_type === 'reise') && !r.data.aussprache) {
    console.error(`✗ ohne Aussprache: ${r.data.wort}`); fehler++;
  }
}
if (fehler) { console.error(`\n${fehler} Problem(e) — nichts hochgeladen.`); process.exit(1); }
console.log(`✓ ${AUSSPRACHE.length} Ausspracheregeln, ${BRUECKEN.length} Brücken, `
  + `${A1.length} A1-Wörter in ${Math.ceil(A1.length / PRO_LEVEL)} Leveln, ${UNTERWEGS.length} Reisewörter.`);

// ── Hochladen ──────────────────────────────────────────────────────────────
async function main() {
  const h = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  const del = await fetch(`${SUPA_URL}/rest/v1/vocab_items?language=eq.french`, { method: 'DELETE', headers: h });
  if (!del.ok) { console.error('Löschen fehlgeschlagen:', await del.text()); process.exit(1); }
  const ins = await fetch(`${SUPA_URL}/rest/v1/vocab_items`,
    { method: 'POST', headers: { ...h, Prefer: 'return=minimal' }, body: JSON.stringify(rows) });
  if (!ins.ok) { console.error('Einfügen fehlgeschlagen:', await ins.text()); process.exit(1); }
  console.log(`✓ hochgeladen: ${rows.length} Items`);
}
main();
