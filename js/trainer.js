// Generischer SRS-Trainer für Supabase-Decks (Mandarin: Zhuyin, Zeichen, später Wörter).
// WaniKani-Mechanik: Level → Lessons (5er-Batches) → Reviews (Apprentice→Burned),
// Level-Up bei 80 % der Level-Items auf Guru+. Fortschritt landet in settings
// (Cloud) + localStorage — über js/progress.js setSetting/getSetting.
import { S, SRS_STAGES } from './state.js';
import { speak } from './tts.js';
import { getSetting, setSetting } from './progress.js';
import { ladeDeckItems } from './decks.js';

const DECKS = {
  'chinese-tw': [
    { key: 'zhuyin', titel: 'ㄅㄆㄇ Zhuyin-Alphabet', typen: ['zhuyin'] },
    { key: 'hanzi', titel: '漢字 Komponenten & Zeichen', typen: ['component', 'character'] },
  ],
};

// Trainer-State (bewusst getrennt vom Alt-App-State in S — nur S.state wird geteilt)
const T = {
  lang: null, deck: null,
  items: [],          // [{key, typ, level, data}]
  srs: null,          // {cards: {key: {srs, nextReview}}, unlockedLevel}
  cursor: 0,
  lessonCards: [], lessonIdx: 0, phase: 'review', // 'lesson' | 'review'
  pool: [], done: 0, total: 0, failed: new Set(), current: null,
  stats: { up: 0, down: 0, burned: 0 },
};

const el = id => document.getElementById(id);
const show = id => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  el(id).classList.add('active');
};
const itemKey = it => it.item_type + ':' + (it.data.zeichen || it.data.zhuyin || it.data.wort || it.position);

function srsKey() { return `trainer-${T.lang}-${T.deck.key}`; }

function ladeSrs() {
  const gespeichert = getSetting(srsKey());
  T.srs = (gespeichert && gespeichert.cards) ? gespeichert : { cards: {}, unlockedLevel: 1 };
}

function speichereSrs() { setSetting(srsKey(), T.srs); }

function deckItems(deck) {
  return T.items
    .filter(it => deck.typen.includes(it.item_type))
    .map(it => ({ key: it.item_type + ':' + (it.data.zeichen || it.data.zhuyin || it.position), typ: it.item_type, level: it.level, data: it.data }));
}

function faellig(items) {
  const now = Date.now();
  return items.filter(it => {
    const c = T.srs.cards[it.key];
    return c && c.srs >= 1 && c.srs < 9 && c.nextReview && new Date(c.nextReview).getTime() <= now;
  });
}

function neue(items) {
  return items.filter(it => {
    const c = T.srs.cards[it.key];
    return it.level <= T.srs.unlockedLevel && (!c || c.srs === 0);
  });
}

function levelStats(items, lvl) {
  const level = items.filter(it => it.level === lvl);
  const guru = level.filter(it => (T.srs.cards[it.key]?.srs || 0) >= 5).length;
  return { total: level.length, guru, pct: level.length ? Math.round(guru / level.length * 100) : 0 };
}

function maxLevel(items) { return items.reduce((m, it) => Math.max(m, it.level), 1); }

function checkLevelUp(items) {
  if (T.srs.unlockedLevel >= maxLevel(items)) return;
  if (levelStats(items, T.srs.unlockedLevel).pct >= 80) T.srs.unlockedLevel++;
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export async function trainerShowDashboard(lang) {
  T.lang = lang;
  S.state = 'tr-dashboard';
  show('tr-dashboard-screen');
  el('tr-dash-list').innerHTML = '<div class="menu-item"><span class="menu-item-body"><span class="menu-item-name">Lade Inhalte…</span></span></div>';
  try {
    T.items = await ladeDeckItems(lang);
  } catch (e) {
    el('tr-dash-list').innerHTML = `<div class="menu-item"><span class="menu-item-body"><span class="menu-item-name">⚠ ${e.message}</span></span></div>`;
    return;
  }
  T.cursor = Math.max(0, dashItems().findIndex(it => it.enabled));
  trainerRenderDashboard();
}

function dashItems() {
  const eintraege = [];
  for (const deck of (DECKS[T.lang] || [])) {
    T.deck = deck; ladeSrs();
    const items = deckItems(deck);
    const due = faellig(items).length;
    const frisch = neue(items).length;
    const stats = levelStats(items, T.srs.unlockedLevel);
    eintraege.push({
      deck, art: 'review', enabled: due > 0,
      label: `${deck.titel} — Reviews`, desc: `${due} fällig`,
    });
    eintraege.push({
      deck, art: 'lesson', enabled: frisch > 0,
      label: `${deck.titel} — Neue lernen`,
      desc: `${Math.min(5, frisch)} von ${frisch} · Level ${T.srs.unlockedLevel}/${maxLevel(items)} (${stats.pct}% Guru+)`,
    });
  }
  eintraege.push({ art: 'zurueck', enabled: true, label: '← Sprachen', desc: '' });
  return eintraege;
}

function trainerRenderDashboard() {
  const list = el('tr-dash-list');
  list.innerHTML = '';
  dashItems().forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'menu-item' + (i === T.cursor ? ' selected' : '');
    if (!item.enabled) div.style.opacity = '0.4';
    div.innerHTML = `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${item.label}</span>
        ${item.desc ? `<span class="menu-item-desc">${item.desc}</span>` : ''}
      </span>`;
    if (item.enabled) {
      div.onclick = () => { T.cursor = i; trainerDashSelect(); };
      div.style.cursor = 'pointer';
    }
    list.appendChild(div);
  });
}

export function trainerDashMove(dir) {
  const items = dashItems();
  let next = T.cursor + dir;
  while (next >= 0 && next < items.length && !items[next].enabled) next += dir;
  if (next >= 0 && next < items.length) T.cursor = next;
  trainerRenderDashboard();
}

export function trainerDashSelect() {
  const item = dashItems()[T.cursor];
  if (!item || !item.enabled) return;
  if (item.art === 'zurueck') { window.renderSprachenGlobal?.(); return; }
  T.deck = item.deck;
  ladeSrs();
  const items = deckItems(item.deck);
  T.stats = { up: 0, down: 0, burned: 0 };
  T.failed = new Set();
  if (item.art === 'lesson') {
    T.phase = 'lesson';
    T.lessonCards = neue(items).slice(0, 5);
    T.lessonIdx = 0;
    zeigeLessonKarte();
  } else {
    T.phase = 'review';
    starteReviews(faellig(items));
  }
}

// ── Karten-Rendering ───────────────────────────────────────────────────────
function frontHtml(it) {
  const d = it.data;
  if (it.typ === 'zhuyin') return `<div class="karte-wort" style="font-size:clamp(64px,18vw,120px);">${d.zhuyin}</div>`;
  if (it.typ === 'component') return `<div class="karte-wort" style="font-size:clamp(64px,18vw,120px);">${d.zeichen}</div>`;
  return `<div class="karte-wort" style="font-size:clamp(64px,18vw,120px);">${d.zeichen}</div>`;
}

function backHtml(it) {
  const d = it.data;
  if (it.typ === 'zhuyin') {
    const b = d.beispiel || {};
    return `
      <div class="karte-wort karte-back-klein">${d.zhuyin}</div>
      <div class="karte-de" style="font-size:clamp(28px,6vw,48px);">${d.pinyin}</div>
      <div class="karte-merksatz">${d.hinweis || ''}</div>
      <div class="tr-beispiel">${b.zh || ''} &nbsp; ${b.zy || ''} &nbsp; <span style="color:var(--muted)">${b.py || ''} — ${b.de || ''}</span></div>`;
  }
  if (it.typ === 'component') {
    return `
      <div class="karte-wort karte-back-klein">${d.zeichen}</div>
      <div class="karte-de" style="font-size:clamp(28px,6vw,48px);">${d.name}</div>
      <div class="karte-merksatz">Komponente</div>`;
  }
  return `
    <div class="karte-wort karte-back-klein">${d.zeichen}</div>
    <div class="karte-de" style="font-size:clamp(24px,5vw,40px);">${d.zhuyin} &nbsp;·&nbsp; ${d.pinyin}</div>
    <div class="karte-de" style="font-size:clamp(20px,4vw,32px);">${d.meaning}</div>
    <div class="karte-merksatz">${(d.defs || []).join(' · ')}</div>`;
}

function sprich(it) {
  const d = it.data;
  if (it.typ === 'zhuyin') { if (d.beispiel?.zh) speak(d.beispiel.zh, 'zh-TW'); }
  else if (it.typ === 'character') speak(d.zeichen, 'zh-TW');
}

function zeigeKarte(vorne) {
  el('tr-front').style.display = vorne ? 'block' : 'none';
  el('tr-back').style.display = vorne ? 'none' : 'block';
  el('tr-review-buttons').style.display = (!vorne && T.phase === 'review') ? 'grid' : 'none';
  el('tr-weiter-hint').style.display = (!vorne && T.phase === 'lesson') ? 'block' : 'none';
}

// ── Lesson ─────────────────────────────────────────────────────────────────
function zeigeLessonKarte() {
  const it = T.lessonCards[T.lessonIdx];
  S.state = 'tr-lesson-front';
  show('tr-card-screen');
  el('tr-tag').textContent = 'NEU · ' + T.deck.titel;
  el('tr-counter').textContent = `${T.lessonIdx + 1} / ${T.lessonCards.length}`;
  el('tr-progress').style.width = (T.lessonIdx / T.lessonCards.length * 100) + '%';
  el('tr-front').innerHTML = frontHtml(it);
  el('tr-back').innerHTML = backHtml(it);
  zeigeKarte(true);
  sprich(it);
}

export function trFlip() {
  if (S.state === 'tr-lesson-front') S.state = 'tr-lesson-back';
  else if (S.state === 'tr-review-front') S.state = 'tr-review-back';
  else return;
  zeigeKarte(false);
  const it = T.phase === 'lesson' ? T.lessonCards[T.lessonIdx] : T.current;
  sprich(it);
}

export function trNext() {
  if (S.state !== 'tr-lesson-back') return;
  T.lessonIdx++;
  if (T.lessonIdx >= T.lessonCards.length) {
    // Lesson fertig → die frischen Karten sofort abfragen
    T.phase = 'review';
    starteReviews(T.lessonCards, true);
  } else {
    zeigeLessonKarte();
  }
}

// ── Reviews ────────────────────────────────────────────────────────────────
function starteReviews(items, istLessonReview) {
  T.pool = [...items];
  T.done = 0;
  T.total = T.pool.length;
  T.istLessonReview = !!istLessonReview;
  naechsteReviewKarte();
}

function naechsteReviewKarte() {
  if (T.pool.length === 0) { beendeSession(); return; }
  T.current = T.pool[Math.floor(Math.random() * T.pool.length)];
  S.state = 'tr-review-front';
  show('tr-card-screen');
  el('tr-tag').textContent = 'REVIEW · ' + T.deck.titel;
  el('tr-counter').textContent = `noch ${T.pool.length} · ${T.done} ✓`;
  el('tr-progress').style.width = (T.done / T.total * 100) + '%';
  const c = T.srs.cards[T.current.key];
  const stage = SRS_STAGES[c?.srs || 0];
  el('tr-stage-badge').textContent = stage.name;
  el('tr-stage-badge').style.background = stage.color;
  el('tr-front').innerHTML = frontHtml(T.current);
  el('tr-back').innerHTML = backHtml(T.current);
  zeigeKarte(true);
  if (T.current.typ !== 'zhuyin') sprich(T.current); // Zhuyin: Ton erst beim Aufdecken (wäre sonst die Lösung)
}

function updateCard(key, korrekt) {
  if (!T.srs.cards[key]) T.srs.cards[key] = { srs: 0, nextReview: new Date().toISOString() };
  const c = T.srs.cards[key];
  const alt = c.srs;
  if (korrekt) c.srs = Math.min(9, c.srs + 1);
  else c.srs = alt === 0 ? 0 : Math.max(1, c.srs - 2);
  if (c.srs >= 9) {
    c.nextReview = null;
    T.stats.burned++;
  } else {
    const due = new Date(Date.now() + SRS_STAGES[c.srs].interval);
    due.setMinutes(0, 0, 0);
    c.nextReview = due.toISOString();
  }
  if (c.srs > alt) { T.stats.up++; return 1; }
  if (c.srs < alt) { T.stats.down++; return -1; }
  return 0;
}

export function trGewusst() {
  if (S.state !== 'tr-review-back') return;
  T.pool.splice(T.pool.indexOf(T.current), 1);
  T.done++;
  if (!T.failed.has(T.current.key)) updateCard(T.current.key, true);
  naechsteReviewKarte();
}

export function trNochmal() {
  if (S.state !== 'tr-review-back') return;
  if (!T.failed.has(T.current.key)) {
    T.failed.add(T.current.key);
    updateCard(T.current.key, false);
  }
  naechsteReviewKarte(); // bleibt im Pool → kommt wieder
}

function beendeSession() {
  const items = deckItems(T.deck);
  checkLevelUp(items);
  speichereSrs();
  S.state = 'tr-result';
  show('tr-result-screen');
  el('tr-result-up').textContent = T.stats.up;
  el('tr-result-down').textContent = T.stats.down;
  el('tr-result-burned').textContent = T.stats.burned;
  const stats = levelStats(items, T.srs.unlockedLevel);
  el('tr-result-level').textContent =
    `Level ${T.srs.unlockedLevel} — ${stats.guru}/${stats.total} auf Guru+ (${stats.pct}%, 80% schalten frei)`;
}

export function trBackToDash() {
  trainerShowDashboard(T.lang);
}

// Für ui.js (Sprachauswahl) und inline-onclick ohne Import-Zyklus:
Object.assign(window, { trainerShowDashboard, trFlip, trNext, trGewusst, trNochmal, trBackToDash });
