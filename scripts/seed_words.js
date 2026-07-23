#!/usr/bin/env node
// Wörter (WK-Vokabellisten, gefiltert) → traditionell → CC-CEDICT → Supabase.
// Nur Wörter, die CC-CEDICT als echtes Mandarin-Wort kennt, kommen durch.
// Aufruf: node scripts/seed_words.js

const fs = require('fs');
const path = require('path');
const { trad, loadCedict, pinyinToZhuyin } = require('./zh_lib.js');
const { WORDS } = require('../content-private/wk-vocab.js');

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

const rows = [];
let uebersprungen = 0;
for (const [level, woerter] of WORDS) {
  let pos = 0;
  for (const wort of woerter) {
    const zh = trad(wort);
    const eintraege = (cedict.get(zh) || []).sort((a, b) =>
      (a.py.endsWith('5') ? 1 : 0) - (b.py.endsWith('5') ? 1 : 0));
    if (eintraege.length === 0) { uebersprungen++; continue; }
    const e = eintraege[0];
    rows.push({
      language: 'chinese-tw', item_type: 'word', level, position: pos++,
      data: {
        zeichen: zh,
        pinyin: e.py,
        zhuyin: e.py.split(' ').map(pinyinToZhuyin).join(' '),
        meaning: e.defs[0] || '',
        defs: e.defs,
      },
    });
  }
}

console.log(`Gebaut: ${rows.length} Wörter (${uebersprungen} nicht in CEDICT → übersprungen)`);

async function main() {
  const headers = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
  const del = await fetch(`${SUPA_URL}/rest/v1/vocab_items?language=eq.chinese-tw&item_type=eq.word`, { method: 'DELETE', headers });
  if (!del.ok) throw new Error('DELETE: ' + del.status + ' ' + await del.text());
  const res = await fetch(`${SUPA_URL}/rest/v1/vocab_items`, { method: 'POST', headers, body: JSON.stringify(rows) });
  if (!res.ok) throw new Error('INSERT: ' + res.status + ' ' + await res.text());
  console.log(`✓ ${rows.length} Wörter geseedet`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
