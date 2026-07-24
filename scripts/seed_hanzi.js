#!/usr/bin/env node
// Taiwan-Curriculum, strukturell aufgebaut (WaniKani-Prinzip, eigene Inhalte):
// Einfachste Zeichen (Atome) zuerst, dann Zeichen, die daraus zusammengesetzt sind.
// Ein Zeichen kommt erst dran, wenn alle seine Bausteine bekannt sind.
// Quellen: TOCFL Band 1–4 (Zeichen-VORRAT, nicht Reihenfolge!), makemeahanzi
// (Zerlegung + Strichzahl), CC-CEDICT (Lesungen), HanDeDict (Deutsch).
// Aktuell werden nur die ersten MAX_LEVEL Level gebaut — Erweiterung: Zahl erhöhen.
// Aufruf: node scripts/seed_hanzi.js

const fs = require('fs');
const path = require('path');
const { loadCedict, pinyinToZhuyin, deutschVon } = require('./zh_lib.js');

const SUPA_URL = 'https://qqvmovinqupunbsexiev.supabase.co';
const CP = path.join(__dirname, '..', 'content-private');

const MAX_LEVEL = 3;
const ZEICHEN_PRO_LEVEL = 20;

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);
const KEY = env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error('SUPABASE_SECRET_KEY fehlt in .env'); process.exit(1); }

// Handgeschriebene Zerlegungs-Merksätze für Zeichen, deren Zerlegung einen
// unbenennbaren Rest (？) enthält — das WaniKani-Prinzip, auf Deutsch:
const ZERLEGUNG_TEXT = {
  '力': '丿 Schwungstrich + gespannter Haken — ein angespannter Arm: Kraft',
  '刀': 'wie 力, aber der Griff schaut oben heraus — eine Klinge',
  '也': '乚 Bogen-Haken, quer durchgestrichen',
  '久': '勹 Umarmung mit ausgestelltem Bein — wer umarmt, bleibt lange',
  '才': 'Hand (wie 扌) mit Schrägstrich — rohes Talent',
  '己': 'offene Schlangenlinie — man selbst',
  '水': '亅 Haken in der Mitte + Spritzer links und rechts — Wasser',
  '方': '亠 Deckel über schwungvollem Haken — eine Fahne weht in eine Richtung',
  '片': 'die rechte Hälfte eines Baumstamms (halbes 木) — eine Scheibe/Platte',
  '今': '人-Dach mit Strich darunter — der Augenblick unterm Dach: jetzt',
  '以': 'Schnörkel + 人 Mensch — mittels einer Person',
  '友': 'eine Hand über 又 (noch einer Hand) — Freundschaft',
  '不': '一 Decke, darunter sperrt sich etwas — nein, nicht!',
  '介': '人 Mensch zwischen zwei Strichen — dazwischen, vermitteln',
  '戶': 'Strich über 尸 liegendem Körper — eine Tür in der Angel',
  '五': '二 oben und unten, in der Mitte verbunden — fünf',
  '司': 'Haken umschließt 口 Mund — der, der Befehle gibt: verwalten',
};

// ── Deutsche Namen für Komponenten, die keine eigenständigen Zeichen sind ──
const NAMEN = {
  '亻': 'Mensch (links)', '氵': 'Wasser (drei Tropfen)', '扌': 'Hand (links)',
  '忄': 'Herz (links)', '宀': 'Dach', '广': 'Haus am Hang', '辶': 'Weg / gehen',
  '艹': 'Gras', '⺮': 'Bambus (oben)', '⺼': 'Fleisch', '糹': 'Seide (links)',
  '釒': 'Metall (links)', '飠': 'Essen (links)', '衤': 'Kleidung (links)',
  '礻': 'Geist / Altar', '亠': 'Deckel', '丷': 'zwei Hörner', '灬': 'Feuer (unten)',
  '阝': 'Hügel / Stadt', '攵': 'schlagen', '匕': 'Löffel', '隹': 'kleiner Vogel',
  '囗': 'Umzäunung', '丿': 'Schwungstrich', '丨': 'senkrechter Strich', '丶': 'Punkt',
  '亅': 'Haken', '乚': 'Bogen-Haken', '幺': 'Fädchen', '厶': 'privat', '彳': 'Schritt',
  '几': 'Tischchen', '頁': 'Kopf', '禾': 'Getreide', '巾': 'Tuch', '夂': 'folgen',
  '冂': 'offener Rahmen', '冖': 'Bedeckung', '冫': 'Eis (zwei Tropfen)', '刂': 'Messer (rechts)',
  '勹': 'Umarmung', '尸': 'liegender Körper', '彡': 'Haare / Streifen', '寸': 'Daumenbreite',
  '戈': 'Hellebarde', '廾': 'zwei Hände', '爫': 'Kralle (oben)', '罒': 'Netz (oben)',
  '疒': 'Krankheit', '耂': 'alt (oben)', '尔': 'du (Baustein)', '兀': 'Sockel',
  '曰': 'sprechen (breite Sonne)', '氏': 'Sippe', '勿': 'nicht (Baustein)',
  '乂': 'Kreuzung', '卜': 'Orakel', '厂': 'Klippe', '凵': 'offene Schale',
  '卩': 'Siegel', '殳': 'Waffe', '气': 'Dampf', '爿': 'Bett (links)', '虫': 'Insekt',
  '皿': 'Schale', '穴': 'Höhle', '疋': 'Stoffballen', '聿': 'Schreibpinsel',
  '艮': 'störrisch', '欠': 'gähnen', '斗': 'Schöpfkelle', '弋': 'Pflock',
};

// ── Daten laden ─────────────────────────────────────────────────────────────
const cedict = loadCedict(path.join(CP, 'cedict.txt'));
const handedict = loadCedict(path.join(CP, 'handedict.u8'));

const striche = new Map();
for (const line of fs.readFileSync(path.join(CP, 'graphics.txt'), 'utf-8').split('\n')) {
  if (!line.trim()) continue;
  try { const e = JSON.parse(line); striche.set(e.character, e.strokes.length); } catch {}
}
const mma = new Map();
for (const line of fs.readFileSync(path.join(CP, 'makemeahanzi.txt'), 'utf-8').split('\n')) {
  if (!line.trim()) continue;
  try { const e = JSON.parse(line); mma.set(e.character, e); } catch {}
}

// Zeichen-Vorrat: TOCFL Band 1–4, Reihenfolge = Erst-Vorkommen (Häufigkeits-Proxy)
const pool = [];
for (let band = 1; band <= 4; band++) {
  for (const zeile of fs.readFileSync(path.join(CP, `tocfl-${band}.csv`), 'utf-8').split('\n').slice(1)) {
    const wort = (zeile.split(',')[2] || '').trim();
    for (const c of wort) {
      if (!/\p{Script=Han}/u.test(c)) continue;
      if (!pool.includes(c) && (cedict.get(c) || []).length) pool.push(c);
    }
  }
}
const poolRang = new Map(pool.map((c, i) => [c, i]));
const poolSet = new Set(pool);

const IDC = /[⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻？]/u;
function teileVon(zeichen) {
  const d = mma.get(zeichen)?.decomposition || '';
  return [...d].filter(t => !IDC.test(t) && t !== zeichen);
}

// ── Strukturelle Level-Konstruktion ─────────────────────────────────────────
// Greedy: In jeder Runde die einfachsten (Strichzahl, dann Häufigkeit) Zeichen
// nehmen, deren Bausteine alle bekannt oder benennbar sind. Neue Nicht-Zeichen-
// Bausteine werden im selben Level als Radikal eingeführt.
const bekannt = new Set();        // gelernte Zeichen + eingeführte Komponenten
const level = [];                 // [{zeichen: [...], komponenten: [...]}]
const offen = [...pool];

function verfuegbar(zeichen) {
  return teileVon(zeichen).every(t =>
    bekannt.has(t) || (!poolSet.has(t) && (NAMEN[t] || !mma.get(t)?.decomposition)));
}

for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
  const kandidaten = offen
    .filter(verfuegbar)
    .sort((a, b) => (striche.get(a) || 99) - (striche.get(b) || 99) || poolRang.get(a) - poolRang.get(b));
  const gewaehlt = kandidaten.slice(0, ZEICHEN_PRO_LEVEL);
  const komponenten = [];
  for (const z of gewaehlt) {
    for (const t of teileVon(z)) {
      if (!bekannt.has(t) && !poolSet.has(t) && !komponenten.includes(t)) komponenten.push(t);
    }
  }
  gewaehlt.forEach(z => { bekannt.add(z); offen.splice(offen.indexOf(z), 1); });
  komponenten.forEach(k => bekannt.add(k));
  level.push({ zeichen: gewaehlt, komponenten });
}

// ── Zeilen bauen ────────────────────────────────────────────────────────────
const PRIMAER = { '行': 'xing2', '讀': 'du2', '重': 'zhong4', '曲': 'qu3', '血': 'xue4', '校': 'xiao4' };
function lesungen(zeichen) {
  const eintraege = cedict.get(zeichen) || [];
  return [...eintraege].sort((a, b) =>
    (a.py === PRIMAER[zeichen] ? -1 : 0) - (b.py === PRIMAER[zeichen] ? -1 : 0) ||
    (a.py.endsWith('5') ? 1 : 0) - (b.py.endsWith('5') ? 1 : 0))
    .map(e => ({
      pinyin: e.py,
      zhuyin: e.py.split(' ').map(pinyinToZhuyin).join(' '),
      defs: e.defs,
    }));
}

function nameVon(teil) {
  if (NAMEN[teil]) return NAMEN[teil];
  const de = deutschVon(handedict, teil).de;
  return de || null;
}

const rows = [];
const posCounter = {};
function push(item_type, lvl, data) {
  const k = item_type + lvl;
  posCounter[k] = posCounter[k] || 0;
  rows.push({ language: 'chinese-tw', item_type, level: lvl, position: posCounter[k]++, data });
}

level.forEach(({ zeichen, komponenten }, i) => {
  const lvl = i + 1;
  for (const k of komponenten) {
    push('component', lvl, { zeichen: k, name: nameVon(k) || '—' });
  }
  for (const z of zeichen) {
    const les = lesungen(z);
    const zerlegung = teileVon(z).map(t => ({ z: t, name: nameVon(t) })).filter(t => t.name);
    push('character', lvl, {
      zeichen: z,
      ...deutschVon(handedict, z),
      meaning: les[0].defs[0] || '',
      pinyin: les[0].pinyin,
      zhuyin: les[0].zhuyin,
      defs: les[0].defs,
      weitere_lesungen: les.slice(1, 3).map(l => ({ pinyin: l.pinyin, zhuyin: l.zhuyin })),
      zerlegung: zerlegung.length ? zerlegung : undefined,
      zerlegung_text: ZERLEGUNG_TEXT[z],
      striche: striche.get(z),
    });
  }
});

// Manifest für seed_words.js
const zeichenLevel = {};
for (const r of rows) if (r.item_type === 'character') zeichenLevel[r.data.zeichen] = r.level;
fs.writeFileSync(path.join(CP, 'zeichen-level.json'), JSON.stringify(zeichenLevel));

level.forEach(({ zeichen, komponenten }, i) =>
  console.log(`Level ${i + 1}: ${zeichen.join('')} | Radikale: ${komponenten.join('') || '—'}`));
console.log(`Gebaut: ${rows.length} Zeilen (${rows.filter(r => r.item_type === 'component').length} Komponenten, ${rows.filter(r => r.item_type === 'character').length} Zeichen) — Vorrat: noch ${offen.length} Zeichen für spätere Level`);

// ── Seeden ──────────────────────────────────────────────────────────────────
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
