#!/usr/bin/env node
// Adaptiert die privaten Level-Listen (content-private/wk-levels.js) zu traditionellem
// Chinesisch (Taiwan) und lädt sie nach Supabase (vocab_items, hinter RLS/Login).
// Lesungen (Pinyin) kommen aus CC-CEDICT (CC-BY-SA), Zhuyin wird daraus konvertiert.
// Aufruf: node scripts/seed_hanzi.js   (braucht SUPABASE_SECRET_KEY in .env)

const fs = require('fs');
const path = require('path');
const { KANJI, RADICALS } = require('../content-private/wk-levels.js');

const SUPA_URL = 'https://qqvmovinqupunbsexiev.supabase.co';
const CEDICT = '/tmp/claude-1000/-home-kiliankoch-Dokumente-GitHubFun-Russisch/bbcf32d8-51ab-4364-bc97-d117e7c1b42b/scratchpad/cedict.txt';

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);
const KEY = env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error('SUPABASE_SECRET_KEY fehlt in .env'); process.exit(1); }

// ── Japanische Vereinfachungen (Shinjitai) → traditionelles Chinesisch ─────
const TRAD = {
  '円':'圓','戸':'戶','広':'廣','万':'萬','写':'寫','気':'氣','氷':'冰','虫':'蟲',
  '内':'內','号':'號','礼':'禮','宝':'寶','体':'體','来':'來','当':'當','図':'圖',
  '毎':'每','会':'會','学':'學','声':'聲','麦':'麥','両':'兩','国':'國','姉':'姊',
  '点':'點','歩':'步','辺':'邊','黒':'黑','画':'畫','黄':'黃','楽':'樂','数':'數',
  '医':'醫','絵':'繪','対':'對','発':'發','県':'縣','乗':'乘','売':'賣','仮':'假',
  '験':'驗','実':'實','顔':'顏','鉄':'鐵','軽':'輕','読':'讀','転':'轉','横':'橫',
  // Radikal-Glyphen: japanische Halbbreit-/Katakana-Formen → chinesische Komponenten
  'ｲ':'亻','ネ':'礻','⻌':'辶',
};
const trad = s => [...s].map(c => TRAD[c] || c).join('');

// ── CC-CEDICT: traditionell → [{py, defs}] in Dateireihenfolge ─────────────
const cedict = new Map();
for (let line of fs.readFileSync(CEDICT, 'utf-8').split('\n')) {
  line = line.replace(/\r$/, '');
  if (!line || line[0] === '#') continue;
  const m = line.match(/^(\S+) (\S+) \[([^\]]+)\] \/(.+)\/$/);
  if (!m) continue;
  const [, tr, , py, defs] = m;
  if (!cedict.has(tr)) cedict.set(tr, []);
  cedict.get(tr).push({ py: py.toLowerCase(), defs: defs.split('/').slice(0, 3) });
}

// ── Pinyin (numeriert, CEDICT-Stil) → Zhuyin ───────────────────────────────
const INITIALS = [
  ['zh','ㄓ'],['ch','ㄔ'],['sh','ㄕ'],['b','ㄅ'],['p','ㄆ'],['m','ㄇ'],['f','ㄈ'],
  ['d','ㄉ'],['t','ㄊ'],['n','ㄋ'],['l','ㄌ'],['g','ㄍ'],['k','ㄎ'],['h','ㄏ'],
  ['j','ㄐ'],['q','ㄑ'],['x','ㄒ'],['r','ㄖ'],['z','ㄗ'],['c','ㄘ'],['s','ㄙ'],
];
const FINALS = {
  'iong':'ㄩㄥ','iang':'ㄧㄤ','uang':'ㄨㄤ','ueng':'ㄨㄥ',
  'iao':'ㄧㄠ','ian':'ㄧㄢ','ing':'ㄧㄥ','uai':'ㄨㄞ','uan':'ㄨㄢ','ang':'ㄤ','eng':'ㄥ',
  'ia':'ㄧㄚ','ie':'ㄧㄝ','iu':'ㄧㄡ','in':'ㄧㄣ','io':'ㄧㄛ',
  'ua':'ㄨㄚ','uo':'ㄨㄛ','ui':'ㄨㄟ','un':'ㄨㄣ','ue':'ㄩㄝ','ve':'ㄩㄝ',
  'van':'ㄩㄢ','vn':'ㄩㄣ','ong':'ㄨㄥ',
  'ai':'ㄞ','ei':'ㄟ','ao':'ㄠ','ou':'ㄡ','an':'ㄢ','en':'ㄣ','er':'ㄦ',
  'a':'ㄚ','o':'ㄛ','e':'ㄜ','i':'ㄧ','u':'ㄨ','v':'ㄩ',
};
const TONES = { 1:'', 2:'ˊ', 3:'ˇ', 4:'ˋ', 5:'˙' };

function pinyinToZhuyin(py) {
  // z.B. "shang4", "lu:3" → "ㄕㄤˋ", "ㄌㄩˇ"
  const m = py.match(/^([a-zü:]+)([1-5])$/);
  if (!m) return null;
  let [, syl, tone] = m;
  syl = syl.replace('u:', 'v').replace('ü', 'v');

  let ini = '', rest = syl;
  for (const [p, z] of INITIALS) {
    if (syl.startsWith(p)) { ini = z; rest = syl.slice(p.length); break; }
  }
  // zhi/chi/shi/ri/zi/ci/si: das "i" ist stumm
  if (ini && rest === 'i' && 'ㄓㄔㄕㄖㄗㄘㄙ'.includes(ini)) rest = '';
  // yi/wu/yu-Schreibungen
  if (!ini) {
    if (rest === 'yi' || rest === 'i') rest = 'i';
    else if (rest === 'wu' || rest === 'u') rest = 'u';
    else if (rest === 'yu' || rest === 'v') rest = 'v';
    else if (rest.startsWith('yu')) rest = 'v' + rest.slice(2);
    else if (rest.startsWith('y')) { rest = rest.slice(1); if (!rest.startsWith('i')) rest = 'i' + rest; }
    else if (rest.startsWith('w')) { rest = rest.slice(1); if (!rest.startsWith('u')) rest = 'u' + rest; }
  }
  // j/q/x + u = ü
  if ('ㄐㄑㄒ'.includes(ini) && rest.startsWith('u')) rest = 'v' + rest.slice(1);

  let fin = '';
  if (rest) {
    fin = FINALS[rest];
    if (fin === undefined) return null;
  }
  const kern = ini + fin;
  return tone === '5' ? TONES[5] + kern : kern + TONES[tone];
}

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
