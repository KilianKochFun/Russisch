#!/usr/bin/env node
// Adaptiert die privaten Level-Listen (content-private/wk-levels.js) zu traditionellem
// Chinesisch (Taiwan) und lädt sie nach Supabase (vocab_items, hinter RLS/Login).
// Lesungen (Pinyin) kommen aus CC-CEDICT (CC-BY-SA), Zhuyin wird daraus konvertiert.
// Aufruf: node scripts/seed_hanzi.js   (braucht SUPABASE_SECRET_KEY in .env)

const fs = require('fs');
const path = require('path');
const { KANJI, RADICALS } = require('../content-private/wk-levels.js');
const { trad, loadCedict, pinyinToZhuyin } = require('./zh_lib.js');

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

for (const [level, glyph, name] of RADICALS) {
  if (!glyph) { warnungen.push(`Radical „${name}" (L${level}): kein Zeichen — übersprungen`); continue; }
  const zeichen = trad(glyph);
  push('component', level, { zeichen, name });
}

for (const [level, glyph, meaning] of KANJI) {
  const zeichen = trad(glyph);
  const les = lesungen(zeichen);
  if (les.length === 0) { warnungen.push(`Kanji ${glyph}→${zeichen} (L${level}, ${meaning}): nicht in CEDICT — übersprungen`); continue; }
  push('character', level, {
    zeichen,
    meaning,
    pinyin: les[0].pinyin,
    zhuyin: les[0].zhuyin,
    defs: les[0].defs,
    weitere_lesungen: les.slice(1, 3).map(l => ({ pinyin: l.pinyin, zhuyin: l.zhuyin })),
  });
}

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
