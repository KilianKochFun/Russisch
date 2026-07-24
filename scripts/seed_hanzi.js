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

// Deutsche Bedeutung von Hand, wo das Wörterbuch Kurioses liefert
// (己 → "Hexyl-Gruppe", 也 → "(wird zur Betonung verwendet)" …)
const DE_FIX = {
  '己': 'selbst; sich selbst',
  '也': 'auch; ebenfalls',
  '士': 'Gelehrter; Krieger',
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

// Reine Striche sind keine Radikale — nie als Lernkarte oder Zerlegungsteil zeigen
const STRICH_PRIMITIVE = new Set(['丿', '丨', '丶', '乚', '亅', '乂', '𠃌', '㇏', '𡿨']);

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
      if (STRICH_PRIMITIVE.has(t)) continue;
      if (!bekannt.has(t) && !poolSet.has(t) && !komponenten.includes(t)) komponenten.push(t);
    }
  }
  gewaehlt.forEach(z => { bekannt.add(z); offen.splice(offen.indexOf(z), 1); });
  komponenten.forEach(k => bekannt.add(k));
  level.push({ zeichen: gewaehlt, komponenten });
}

// ── Zeilen bauen ────────────────────────────────────────────────────────────
const PRIMAER = { '行': 'xing2', '讀': 'du2', '重': 'zhong4', '曲': 'qu3', '血': 'xue4', '校': 'xiao4', '尺': 'chi3', '中': 'zhong1', '大': 'da4', '比': 'bi3' };
// Nachnamen-, Varianten- und Kurzform-Einträge sind selten die Lern-Bedeutung
const nachrangig = e => (e.eigenname || /variant of|surname |abbr\. for|^used in |^see /i.test(e.defs[0] || '')) ? 1 : 0;

function lesungen(zeichen) {
  const eintraege = cedict.get(zeichen) || [];
  return [...eintraege].sort((a, b) =>
    (a.py === PRIMAER[zeichen] ? -1 : 0) - (b.py === PRIMAER[zeichen] ? -1 : 0) ||
    nachrangig(a) - nachrangig(b) ||
    (a.py.endsWith('5') ? 1 : 0) - (b.py.endsWith('5') ? 1 : 0))
    .map(e => ({
      pinyin: e.py,
      zhuyin: e.py.split(' ').map(pinyinToZhuyin).join(' '),
      defs: e.defs,
    }));
}

// Radikal-/Zerlegungsnamen kurz halten: "wieder, noch einmal (Adv)" → "wieder"
function kurz(text) {
  return text ? text.split(/[,;]/)[0].replace(/\s*\([^)]*\)\s*$/, '').trim() : text;
}

function nameVon(teil) {
  if (DE_FIX[teil]) return kurz(DE_FIX[teil]);
  if (NAMEN[teil]) return NAMEN[teil];
  const les = lesungen(teil);
  const de = deutschVon(handedict, teil, les[0]?.pinyin).de;
  return kurz(de) || null;
}

const rows = [];
const posCounter = {};
function push(item_type, lvl, data) {
  const k = item_type + lvl;
  posCounter[k] = posCounter[k] || 0;
  rows.push({ language: 'chinese-tw', item_type, level: lvl, position: posCounter[k]++, data });
}

// Zeichen, die als Baustein anderer Pool-Zeichen dienen, werden ZUSÄTZLICH
// als Radikal eingeführt (WaniKani-Prinzip: erst Radikal 女, dann Hanzi 女).
// Über den GANZEN Pool berechnet, damit der Radikal-Status stabil bleibt,
// wenn später mehr Level gebaut werden.
const wirdGebraucht = new Set();
for (const c of pool) for (const t of teileVon(c)) if (poolSet.has(t)) wirdGebraucht.add(t);

level.forEach(({ zeichen, komponenten }, i) => {
  const lvl = i + 1;
  for (const k of komponenten) {
    push('component', lvl, { zeichen: k, name: nameVon(k) || '—' });
  }
  for (const z of zeichen) {
    if (wirdGebraucht.has(z)) {
      push('component', lvl, { zeichen: z, name: nameVon(z) || '—', istZeichen: true });
    }
  }
  for (const z of zeichen) {
    const les = lesungen(z);
    // Enthält die Roh-Zerlegung einen unbenennbaren Rest (？), wäre die Liste
    // irreführend halb — dann übernimmt allein das Merkbild (ZERLEGUNG_TEXT)
    // Zerlegung nur auf Radikal-Ebene: unbenennbare Reste (？) oder reine
    // Striche machen ein Zeichen zum "Urzeichen" — keine Strich-Anatomie zeigen
    const roh = mma.get(z)?.decomposition || '';
    const teile = teileVon(z).filter(t => !STRICH_PRIMITIVE.has(t));
    const zerlegung = (roh.includes('？') || teile.length < 2) ? []
      : teile.map(t => ({ z: t, name: nameVon(t) })).filter(t => t.name);
    const deutsch = deutschVon(handedict, z, les[0].pinyin);
    if (DE_FIX[z]) deutsch.de = DE_FIX[z];
    push('character', lvl, {
      zeichen: z,
      ...deutsch,
      meaning: les[0].defs[0] || '',
      pinyin: les[0].pinyin,
      zhuyin: les[0].zhuyin,
      defs: les[0].defs,
      weitere_lesungen: les.slice(1, 3).map(l => ({ pinyin: l.pinyin, zhuyin: l.zhuyin })),
      zerlegung: zerlegung.length ? zerlegung : undefined,
      striche: striche.get(z),
    });
  }
});

// Manifest für seed_words.js
const zeichenLevel = {};
for (const r of rows) if (r.item_type === 'character') zeichenLevel[r.data.zeichen] = r.level;
fs.writeFileSync(path.join(CP, 'zeichen-level.json'), JSON.stringify(zeichenLevel));

level.forEach(({ zeichen, komponenten }, i) => {
  const zusatz = zeichen.filter(z => wirdGebraucht.has(z));
  console.log(`Level ${i + 1}: ${zeichen.join('')} | Radikale: ${komponenten.join('')}${zusatz.length ? ' + als Zeichen-Radikale: ' + zusatz.join('') : ''}`);
});
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
