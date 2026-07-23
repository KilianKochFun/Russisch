#!/usr/bin/env node
// Adaptiert die privaten Level-Listen (content-private/wk-levels.js) zu traditionellem
// Chinesisch (Taiwan) und lädt sie nach Supabase (vocab_items, hinter RLS/Login).
// Level-Schema: 1–2 vorgezogene TOCFL-Grundzeichen (我, 是, 你 …) · 3–12 WaniKani
// (um +2 verschoben) · 13+ restliche TOCFL-Zeichen Band 1–4.
// Lesungen (Pinyin) kommen aus CC-CEDICT (CC-BY-SA), Zhuyin wird daraus konvertiert.
// Aufruf: node scripts/seed_hanzi.js   (braucht SUPABASE_SECRET_KEY in .env)

const fs = require('fs');
const path = require('path');
const { KANJI, RADICALS } = require('../content-private/wk-levels.js');
const { trad, loadCedict, pinyinToZhuyin, deutschVon } = require('./zh_lib.js');

const SUPA_URL = 'https://qqvmovinqupunbsexiev.supabase.co';
const CEDICT = '/tmp/claude-1000/-home-kiliankoch-Dokumente-GitHubFun-Russisch/bbcf32d8-51ab-4364-bc97-d117e7c1b42b/scratchpad/cedict.txt';

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);
const KEY = env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error('SUPABASE_SECRET_KEY fehlt in .env'); process.exit(1); }

const cedict = loadCedict(CEDICT);
const handedict = loadCedict(CEDICT.replace('cedict.txt', 'handedict.u8'));

// Bei Mehrfachlesungen: die zur Lern-Bedeutung passende Lesung erzwingen
const PRIMAER = {
  '行': 'xing2', '讀': 'du2', '重': 'zhong4', '曲': 'qu3', '血': 'xue4', '校': 'xiao4',
};

// Bevorzugt Lesungen mit echtem Ton (nicht neutral), Reihenfolge sonst wie CEDICT
function lesungen(zeichen) {
  const eintraege = cedict.get(zeichen) || [];
  const sorted = [...eintraege].sort((a, b) =>
    (a.py === PRIMAER[zeichen] ? -1 : 0) - (b.py === PRIMAER[zeichen] ? -1 : 0) ||
    (a.py.endsWith('5') ? 1 : 0) - (b.py.endsWith('5') ? 1 : 0));
  return sorted.map(e => ({
    pinyin: e.py,
    zhuyin: e.py.split(' ').map(pinyinToZhuyin).join(' '),
    defs: e.defs,
  }));
}

// ── Zeilen bauen ───────────────────────────────────────────────────────────
const rows = [];
const warnungen = [];

const posCounter = {};
function push(item_type, level, data) {
  const k = item_type + level;
  posCounter[k] = (posCounter[k] || 0);
  rows.push({ language: 'chinese-tw', item_type, level, position: posCounter[k]++, data });
}

const TOCFL_DIR = '/tmp/claude-1000/-home-kiliankoch-Dokumente-GitHubFun-Russisch/bbcf32d8-51ab-4364-bc97-d117e7c1b42b/scratchpad';
const WK_SHIFT = 2;        // WK-Level 1-10 → 3-12
const VORZIEH_ANZAHL = 50; // wichtigste TOCFL-Zeichen als Level 1-2
const PRO_LEVEL = 25;

// TOCFL-Zeichen in Erst-Vorkommens-Reihenfolge (Band 1-4)
const wkZeichen = new Set(KANJI.filter(([, g]) => g !== '々').map(([, g]) => trad(g)));
const tocflZeichenListe = [];
for (let band = 1; band <= 4; band++) {
  const pfad = `${TOCFL_DIR}/tocfl-${band}.csv`;
  if (!fs.existsSync(pfad)) { console.warn(`⚠ ${pfad} fehlt`); continue; }
  for (const zeile of fs.readFileSync(pfad, 'utf-8').split('\n').slice(1)) {
    const wort = (zeile.split(',')[2] || '').trim();
    for (const c of wort) {
      if (!/\p{Script=Han}/u.test(c)) continue;
      if (!wkZeichen.has(c) && !tocflZeichenListe.includes(c) && (cedict.get(c) || []).length) {
        tocflZeichenListe.push(c);
      }
    }
  }
}
const vorgezogen = tocflZeichenListe.slice(0, VORZIEH_ANZAHL);
const rest = tocflZeichenListe.slice(VORZIEH_ANZAHL);

function pushTocflZeichen(zeichen, level) {
  const les = lesungen(zeichen);
  push('character', level, {
    zeichen,
    ...deutschVon(handedict, zeichen),
    meaning: les[0].defs[0] || '',
    pinyin: les[0].pinyin,
    zhuyin: les[0].zhuyin,
    defs: les[0].defs,
    weitere_lesungen: les.slice(1, 3).map(l => ({ pinyin: l.pinyin, zhuyin: l.zhuyin })),
    herkunft: 'tocfl',
  });
}

// Level 1-2: vorgezogene Grundzeichen
vorgezogen.forEach((z, i) => pushTocflZeichen(z, 1 + Math.floor(i / PRO_LEVEL)));

// Level 3-12: WaniKani (Komponenten + Zeichen)
for (const [level, glyph, name] of RADICALS) {
  if (!glyph) { warnungen.push(`Radical „${name}" (L${level}): kein Zeichen — übersprungen`); continue; }
  push('component', level + WK_SHIFT, { zeichen: trad(glyph), name });
}
for (const [level, glyph, meaning] of KANJI) {
  if (glyph === '々') continue; // japanisches Wiederholungszeichen — kein Mandarin
  const zeichen = trad(glyph);
  const les = lesungen(zeichen);
  if (les.length === 0) { warnungen.push(`Kanji ${glyph}→${zeichen}: nicht in CEDICT — übersprungen`); continue; }
  push('character', level + WK_SHIFT, {
    zeichen,
    ...deutschVon(handedict, zeichen),
    meaning,
    pinyin: les[0].pinyin,
    zhuyin: les[0].zhuyin,
    defs: les[0].defs,
    weitere_lesungen: les.slice(1, 3).map(l => ({ pinyin: l.pinyin, zhuyin: l.zhuyin })),
  });
}

// Level 13+: restliche TOCFL-Zeichen (Band 1-4)
const REST_START = 10 + WK_SHIFT + 1;
rest.forEach((z, i) => pushTocflZeichen(z, REST_START + Math.floor(i / PRO_LEVEL)));
console.log(`TOCFL: ${vorgezogen.length} vorgezogen (L1-2), ${rest.length} in L${REST_START}+`);

const zeichenLevel = {};
for (const r of rows) if (r.item_type === 'character') zeichenLevel[r.data.zeichen] = r.level;

// Manifest für seed_words.js: Zeichen → Level
fs.writeFileSync(path.join(__dirname, '..', 'content-private', 'zeichen-level.json'),
  JSON.stringify(zeichenLevel));

console.log(`Gebaut: ${rows.length} Zeilen (${rows.filter(r=>r.item_type==='component').length} Komponenten, ${rows.filter(r=>r.item_type==='character').length} Zeichen)`);
warnungen.forEach(w => console.log('⚠', w));

// ── Seeden ─────────────────────────────────────────────────────────────────
async function main() {
  const headers = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
  for (const typ of ['component', 'character']) {
    const del = await fetch(`${SUPA_URL}/rest/v1/vocab_items?language=eq.chinese-tw&item_type=eq.${typ}`, { method: 'DELETE', headers });
    if (!del.ok) throw new Error('DELETE ' + typ + ': ' + del.status + ' ' + await del.text());
  }
  const res = await fetch(`${SUPA_URL}/rest/v1/vocab_items`, { method: 'POST', headers, body: JSON.stringify(rows) });
  if (!res.ok) throw new Error('INSERT: ' + res.status + ' ' + await res.text());
  console.log(`✓ ${rows.length} Items geseedet`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
