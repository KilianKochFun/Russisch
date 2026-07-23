#!/usr/bin/env node
// Wörter (WK-Vokabellisten, gefiltert) → traditionell → CC-CEDICT → Supabase.
// Nur Wörter, die CC-CEDICT als echtes Mandarin-Wort kennt, kommen durch.
// Aufruf: node scripts/seed_words.js

const fs = require('fs');
const path = require('path');
const { trad, loadCedict, pinyinToZhuyin, deutschVon } = require('./zh_lib.js');
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
const handedict = loadCedict(CEDICT.replace('cedict.txt', 'handedict.u8'));
const { KANJI } = require('../content-private/wk-levels.js');

// Level jedes gelernten Zeichens — Manifest aus seed_hanzi.js (inkl. TOCFL-Level 11+),
// Fallback: nur WK-Zeichen
let zeichenLevel = {};
const manifest = path.join(__dirname, '..', 'content-private', 'zeichen-level.json');
if (fs.existsSync(manifest)) {
  zeichenLevel = JSON.parse(fs.readFileSync(manifest, 'utf-8'));
} else {
  for (const [lvl, glyph] of KANJI) zeichenLevel[trad(glyph)] = lvl;
}
const zeichenLevelVon = c => zeichenLevel[c];

const rows = [];
const vorhanden = new Set();
const posProLevel = {};
function pushWort(level, data) {
  posProLevel[level] = posProLevel[level] || 0;
  rows.push({ language: 'chinese-tw', item_type: 'word', level, position: posProLevel[level]++, data });
  vorhanden.add(data.zeichen);
}

// Level immer aus den Zeichen ableiten: das Wort kommt dorthin, wo sein
// zuletzt eingeführtes Zeichen gelernt wird (Manifest aus seed_hanzi.js)
function wortLevel(zh) {
  const levels = [...zh].map(c => zeichenLevelVon(c));
  if (levels.some(l => l === undefined)) return null;
  return Math.max(...levels);
}

let uebersprungen = 0;
for (const [, woerter] of WORDS) {
  for (const wort of woerter) {
    const zh = trad(wort);
    const eintraege = (cedict.get(zh) || []).sort((a, b) =>
      (a.py.endsWith('5') ? 1 : 0) - (b.py.endsWith('5') ? 1 : 0));
    const level = wortLevel(zh);
    if (eintraege.length === 0 || vorhanden.has(zh) || level === null) { uebersprungen++; continue; }
    const e = eintraege[0];
    pushWort(level, {
      zeichen: zh,
      ...deutschVon(handedict, zh),
      pinyin: e.py,
      zhuyin: e.py.split(' ').map(pinyinToZhuyin).join(' '),
      meaning: e.defs[0] || '',
      defs: e.defs,
    });
  }
}
console.log(`WK-Wörter: ${rows.length} (${uebersprungen} nicht in CEDICT/doppelt/ohne Zeichen → übersprungen)`);

// ── TOCFL-Lückenfüller (Band 1–4) ───────────────────────────────────────────
// WaniKani-Prinzip: Ein Wort kommt in das Level, in dem sein letztes Zeichen
// eingeführt wird. Wörter mit Zeichen außerhalb des Zeichen-Decks bleiben draußen.
const ZIEL_PRO_LEVEL = 25;
const TOCFL_DIR = '/tmp/claude-1000/-home-kiliankoch-Dokumente-GitHubFun-Russisch/bbcf32d8-51ab-4364-bc97-d117e7c1b42b/scratchpad';


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

let tocflNeu = 0, ohneZeichen = 0;
for (let band = 1; band <= 4; band++) {
  const pfad = `${TOCFL_DIR}/tocfl-${band}.csv`;
  if (!fs.existsSync(pfad)) { console.warn(`⚠ ${pfad} fehlt — überspringe Band ${band}`); continue; }
  const zeilen = fs.readFileSync(pfad, 'utf-8').split('\n').slice(1);
  for (const zeile of zeilen) {
    if (!zeile.trim()) continue;
    const f = parseCsvZeile(zeile);
    const wort = (f[2] || '').trim();          // 展開表 = bereinigte Form
    const pinyin = (f[3] || '').trim();
    const zhuyin = (f[5] || '').replace(/　/g, ' ').trim(); // offizielle Taiwan-Zhuyin
    if (wort.length < 2 || vorhanden.has(wort)) continue;

    let level = wortLevel(wort);
    if (level === null) { ohneZeichen++; continue; }
    // Level voll? → ins nächste überlaufen statt Wort zu verwerfen
    while (posProLevel[level] >= ZIEL_PRO_LEVEL) level++;

    const eintraege = cedict.get(wort) || [];
    if (eintraege.length === 0) continue;
    pushWort(level, {
      zeichen: wort,
      ...deutschVon(handedict, wort),
      pinyin: pinyin || eintraege[0].py,
      zhuyin: zhuyin || eintraege[0].py.split(' ').map(pinyinToZhuyin).join(' '),
      meaning: eintraege[0].defs[0] || '',
      defs: eintraege[0].defs,
      herkunft: 'tocfl' + band,
    });
    tocflNeu++;
  }
}

const proLevel = {};
for (const r of rows) proLevel[r.level] = (proLevel[r.level] || 0) + 1;
console.log(`TOCFL ergänzt: +${tocflNeu} Wörter (${ohneZeichen} mit ungelernten Zeichen ausgelassen)`);
console.log('Wörter pro Level:', JSON.stringify(proLevel));
console.log(`Gebaut: ${rows.length} Wörter gesamt`);

async function main() {
  const headers = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
  const del = await fetch(`${SUPA_URL}/rest/v1/vocab_items?language=eq.chinese-tw&item_type=eq.word`, { method: 'DELETE', headers });
  if (!del.ok) throw new Error('DELETE: ' + del.status + ' ' + await del.text());
  const res = await fetch(`${SUPA_URL}/rest/v1/vocab_items`, { method: 'POST', headers, body: JSON.stringify(rows) });
  if (!res.ok) throw new Error('INSERT: ' + res.status + ' ' + await res.text());
  console.log(`✓ ${rows.length} Wörter geseedet`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
