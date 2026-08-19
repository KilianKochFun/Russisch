#!/usr/bin/env node
// Wörter (TOCFL Band 1–4) → Supabase. Ein Wort kommt in das Level, in dem sein
// zuletzt eingeführtes Zeichen gelernt wird (Manifest aus seed_hanzi.js) —
// es tauchen also nur Wörter auf, deren Zeichen man schon lesen kann.
// Deutsch aus HanDeDict, offizielle Taiwan-Zhuyin aus der TOCFL-Liste.
// Aufruf: node scripts/seed_words.js  (nach seed_hanzi.js!)

const fs = require('fs');
const path = require('path');
const { loadCedict, pinyinToZhuyin, deutschVon } = require('./zh_lib.js');

const SUPA_URL = 'https://qqvmovinqupunbsexiev.supabase.co';
const CP = path.join(__dirname, '..', 'content-private');

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);
const KEY = env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error('SUPABASE_SECRET_KEY fehlt in .env'); process.exit(1); }

const cedict = loadCedict(path.join(CP, 'cedict.txt'));
const handedict = loadCedict(path.join(CP, 'handedict.u8'));
const zeichenLevel = JSON.parse(fs.readFileSync(path.join(CP, 'zeichen-level.json'), 'utf-8'));

function wortLevel(zh) {
  const levels = [...zh].map(c => zeichenLevel[c]);
  if (levels.some(l => l === undefined)) return null;
  return Math.max(...levels);
}

function parseCsvZeile(zeile) {
  const felder = [];
  let feld = '', inQuote = false;
  for (const c of zeile) {
    if (c === '"') inQuote = !inQuote;
    else if (c === ',' && !inQuote) { felder.push(feld); feld = ''; }
    else feld += c;
  }
  felder.push(feld);
  return felder;
}

const rows = [];
const vorhanden = new Set();
const posProLevel = {};
let ohneZeichen = 0;

for (let band = 1; band <= 4; band++) {
  const pfad = path.join(CP, `tocfl-${band}.csv`);
  if (!fs.existsSync(pfad)) { console.warn(`⚠ ${pfad} fehlt`); continue; }
  for (const zeile of fs.readFileSync(pfad, 'utf-8').split('\n').slice(1)) {
    if (!zeile.trim()) continue;
    const f = parseCsvZeile(zeile);
    const wort = (f[2] || '').trim();          // 展開表 = bereinigte Form
    const pinyin = (f[3] || '').trim();
    const zhuyin = (f[5] || '').replace(/　/g, ' ').trim();
    // Einzeichige Wörter bleiben DRAUSSEN, und das ist wichtig genug für eine
    // Begründung, weil es naheliegt, sie aufzunehmen:
    //
    // Bei WaniKani gibt es Einzelkanji-Vokabeln, weil ein Kanji als Wort
    // anders gelesen wird als im Verbund — 人 allein ist „hito“, in 人口
    // „jin“. Diese Spaltung (kun'yomi/on'yomi) ist japanisch. Im Mandarin
    // hat ein Zeichen praktisch immer dieselbe Lesung.
    //
    // Nachgemessen, als sie einmal drin waren: von 109 Einzelzeichen-Wörtern
    // hatten 100 exakt dieselbe Lesung wie ihre Zeichenkarte und 104 exakt
    // dieselbe Bedeutung. Die fünf Abweichler waren SCHLECHTER — 那 wurde zum
    // Familiennamen „Na“, 都 zur „Hauptstadt“, 尺 zu einer Musiknote. Es waren
    // also Dubletten, die zweimal dieselbe Karte abfragen und die Kartenzahl
    // aufblähen, ohne etwas beizubringen.
    if (wort.length < 2 || vorhanden.has(wort)) continue;

    const level = wortLevel(wort);
    if (level === null) { ohneZeichen++; continue; }

    const eintraege = cedict.get(wort) || [];
    if (eintraege.length === 0) continue;
    posProLevel[level] = posProLevel[level] || 0;
    rows.push({
      language: 'chinese-tw', item_type: 'word', level, position: posProLevel[level]++,
      data: {
        zeichen: wort,
        ...deutschVon(handedict, wort, eintraege[0].py),
        pinyin: pinyin || eintraege[0].py,
        zhuyin: zhuyin || eintraege[0].py.split(' ').map(pinyinToZhuyin).join(' '),
        meaning: eintraege[0].defs[0] || '',
        defs: eintraege[0].defs,
        herkunft: 'tocfl' + band,
      },
    });
    vorhanden.add(wort);
  }
}

const proLevel = {};
for (const r of rows) proLevel[r.level] = (proLevel[r.level] || 0) + 1;
console.log('Wörter pro Level:', JSON.stringify(proLevel));
console.log(`Gebaut: ${rows.length} Wörter (${ohneZeichen} warten auf spätere Zeichen-Level)`);

async function main() {
  const headers = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
  const del = await fetch(`${SUPA_URL}/rest/v1/vocab_items?language=eq.chinese-tw&item_type=eq.word`, { method: 'DELETE', headers });
  if (!del.ok) throw new Error('DELETE: ' + del.status + ' ' + await del.text());
  const res = await fetch(`${SUPA_URL}/rest/v1/vocab_items`, { method: 'POST', headers, body: JSON.stringify(rows) });
  if (!res.ok) throw new Error('INSERT: ' + res.status + ' ' + await res.text());
  console.log(`✓ ${rows.length} Wörter geseedet`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
