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
    merk: 'petit klingt „pöti“, grand klingt „grã“. Der Buchstabe steht da, gesprochen wird er nicht.',
    bsp: [['petit', 'pöti', 'klein'], ['grand', 'grã', 'groß']] },
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
  { form: 'oi', de: 'wa', merk: 'Fest zusammen, immer „wa“.',
    bsp: [['moi', 'mwa', 'ich'], ['trois', 'trwa', 'drei']] },
  { form: 'ai · ei', de: 'ä', merk: 'Offenes ä wie in „hätte“.',
    bsp: [['mais', 'mä', 'aber'], ['seize', 'ßäs', 'sechzehn']] },
  { form: 'au · eau', de: 'o', merk: 'eaux ist ein einziger Laut: o.',
    bsp: [['eau', 'o', 'Wasser'], ['bateau', 'bato', 'Boot']] },
  { form: 'eu · œu', de: 'ö', merk: 'Wie in „Köln“.',
    bsp: [['deux', 'dö', 'zwei'], ['sœur', 'ßör', 'Schwester']] },
  { form: 'ch', de: 'sch', merk: 'Nie wie deutsches „ch“.',
    bsp: [['chat', 'scha', 'Katze'], ['chercher', 'schärsche', 'suchen']] },
  { form: 'j · ge · gi', de: 'weiches sch',
    merk: 'Wie das g in „Garage“ oder das j in „Journal“.',
    bsp: [['je', 'schö', 'ich'], ['manger', 'mãsche', 'essen']] },
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

// ── Deck 3: Wörter ─────────────────────────────────────────────────────────
// [französisch, Aussprache in deutscher Näherung, deutsch, Level]
// Level 1 = die Wörter, ohne die kein Satz geht. Level 2 = Alltag.
// Level 3 = unterwegs.
const WOERTER = [
  // Level 1 — Grundgerüst
  ['je', 'schö', 'ich', 1], ['tu', 'tü', 'du', 1], ['il', 'il', 'er', 1],
  ['elle', 'äl', 'sie', 1], ['nous', 'nu', 'wir', 1], ['vous', 'wu', 'ihr / Sie', 1],
  ['ils', 'il', 'sie (Plural)', 1],
  ['être', 'ätr', 'sein', 1], ['avoir', 'awwar', 'haben', 1],
  ['aller', 'ale', 'gehen', 1], ['faire', 'fär', 'machen', 1],
  ['pouvoir', 'puwwar', 'können', 1], ['vouloir', 'wulwar', 'wollen', 1],
  ['savoir', 'ßawwar', 'wissen', 1], ['dire', 'dir', 'sagen', 1],
  ['le', 'lö', 'der / den', 1], ['la', 'la', 'die', 1], ['les', 'le', 'die (Plural)', 1],
  ['un', 'ä̃', 'ein', 1], ['une', 'ün', 'eine', 1],
  ['de', 'dö', 'von / aus', 1], ['à', 'a', 'zu / nach / in', 1],
  ['et', 'e', 'und', 1], ['ou', 'u', 'oder', 1], ['mais', 'mä', 'aber', 1],
  ['dans', 'dã', 'in', 1], ['sur', 'ßür', 'auf', 1], ['pour', 'pur', 'für', 1],
  ['avec', 'awäk', 'mit', 1], ['sans', 'ßã', 'ohne', 1],
  ['ne … pas', 'nö … pa', 'nicht (Klammer ums Verb)', 1],
  ['oui', 'wi', 'ja', 1], ['non', 'nõ', 'nein', 1],
  ['qui', 'ki', 'wer', 1], ['que', 'kö', 'was / dass', 1],
  ['où', 'u', 'wo', 1], ['quand', 'kã', 'wann', 1],
  ['comment', 'komã', 'wie', 1], ['pourquoi', 'purkwa', 'warum', 1],
  ['combien', 'kõbjä̃', 'wie viel', 1],
  ['ce', 'ßö', 'dies', 1], ['très', 'trä', 'sehr', 1], ['aussi', 'oßi', 'auch', 1],
  ['plus', 'plü', 'mehr', 1], ['bien', 'bjä̃', 'gut', 1],

  // Level 2 — Alltag
  ['bonjour', 'bõschur', 'guten Tag', 2], ['bonsoir', 'bõßwar', 'guten Abend', 2],
  ['merci', 'märßi', 'danke', 2], ['pardon', 'pardõ', 'Entschuldigung', 2],
  ['s’il vous plaît', 'ßilwuplä', 'bitte', 2],
  ['au revoir', 'orwwar', 'auf Wiedersehen', 2],
  ['monsieur', 'mößjö', 'Herr', 2], ['madame', 'madam', 'Frau', 2],
  ['jour', 'schur', 'Tag', 2], ['nuit', 'nüi', 'Nacht', 2],
  ['temps', 'tã', 'Zeit / Wetter', 2], ['heure', 'ör', 'Stunde / Uhr', 2],
  ['homme', 'om', 'Mann', 2], ['femme', 'fam', 'Frau', 2],
  ['enfant', 'ãfã', 'Kind', 2], ['ami', 'ami', 'Freund', 2],
  ['maison', 'mäsõ', 'Haus', 2], ['ville', 'wil', 'Stadt', 2],
  ['rue', 'rü', 'Straße', 2], ['pays', 'pei', 'Land', 2],
  ['eau', 'o', 'Wasser', 2], ['pain', 'pä̃', 'Brot', 2],
  ['vin', 'wä̃', 'Wein', 2], ['café', 'kafe', 'Kaffee', 2],
  ['manger', 'mãsche', 'essen', 2], ['boire', 'bwar', 'trinken', 2],
  ['grand', 'grã', 'groß', 2], ['petit', 'pöti', 'klein', 2],
  ['bon', 'bõ', 'gut', 2], ['nouveau', 'nuwo', 'neu', 2],
  ['beaucoup', 'boku', 'viel', 2], ['peu', 'pö', 'wenig', 2],
  ['aujourd’hui', 'oschurdüi', 'heute', 2], ['demain', 'dömä̃', 'morgen', 2],
  ['hier', 'jär', 'gestern', 2], ['maintenant', 'mä̃tnã', 'jetzt', 2],
  ['ici', 'ißi', 'hier', 2], ['là', 'la', 'dort', 2],

  // Level 3 — unterwegs
  ['gare', 'gar', 'Bahnhof', 3], ['train', 'trä̃', 'Zug', 3],
  ['billet', 'bijä', 'Fahrkarte', 3], ['hôtel', 'otäl', 'Hotel', 3],
  ['chambre', 'schãbr', 'Zimmer', 3], ['clé', 'kle', 'Schlüssel', 3],
  ['addition', 'adißjõ', 'Rechnung', 3], ['argent', 'arschã', 'Geld', 3],
  ['magasin', 'magasä̃', 'Geschäft', 3], ['marché', 'marsche', 'Markt', 3],
  ['ouvert', 'uwär', 'geöffnet', 3], ['fermé', 'färme', 'geschlossen', 3],
  ['gauche', 'gohsch', 'links', 3], ['droite', 'drwat', 'rechts', 3],
  ['tout droit', 'tu drwa', 'geradeaus', 3],
  ['entrée', 'ãtre', 'Eingang', 3], ['sortie', 'ßorti', 'Ausgang', 3],
  ['toilettes', 'toalät', 'Toilette', 3],
  ['aide', 'äd', 'Hilfe', 3], ['perdu', 'pärdü', 'verloren', 3],
  ['je voudrais', 'schö wudrä', 'ich hätte gern', 3],
  ['je ne comprends pas', 'schö nö kõprã pa', 'ich verstehe nicht', 3],
  ['parlez-vous allemand ?', 'parle wu almã', 'sprechen Sie Deutsch?', 3],
  ['combien ça coûte ?', 'kõbjä̃ ßa kut', 'was kostet das?', 3],
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
const posProLevel = {};
for (const [wort, aus, de, level] of WOERTER) {
  posProLevel[level] = posProLevel[level] || 0;
  rows.push({ language: 'french', item_type: 'fword', level, position: posProLevel[level]++,
    data: { wort, aussprache: aus, de } });
}

// ── Gegenprüfung ───────────────────────────────────────────────────────────
let fehler = 0;
const gesehen = new Set();
for (const [wort] of WOERTER) {
  if (gesehen.has(wort)) { console.error(`✗ ${wort} steht doppelt in der Liste`); fehler++; }
  gesehen.add(wort);
}
for (const r of rows) {
  if (!r.data.de) { console.error(`✗ ohne Bedeutung: ${JSON.stringify(r.data).slice(0, 60)}`); fehler++; }
  if (r.item_type === 'fword' && !r.data.aussprache) {
    console.error(`✗ ohne Aussprache: ${r.data.wort}`); fehler++;
  }
}
if (fehler) { console.error(`\n${fehler} Problem(e) — nichts hochgeladen.`); process.exit(1); }
console.log(`✓ ${AUSSPRACHE.length} Ausspracheregeln, ${BRUECKEN.length} Brücken, ${WOERTER.length} Wörter — alle vollständig.`);

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
