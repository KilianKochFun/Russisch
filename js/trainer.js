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
    { key: 'radikale', titel: '部首 Radikale', typen: ['component'] },
    { key: 'hanzi', titel: '漢字 Zeichen', typen: ['character'] },
    { key: 'woerter', titel: '詞 Wörter', typen: ['word'] },
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
  let gespeichert = getSetting(srsKey());
  // Migration: Radikale steckten früher mit im Hanzi-Deck
  if ((!gespeichert || !gespeichert.cards) && T.deck.key === 'radikale') {
    const altKombi = getSetting(`trainer-${T.lang}-hanzi`);
    if (altKombi?.cards) {
      gespeichert = {
        cards: Object.fromEntries(Object.entries(altKombi.cards).filter(([k]) => k.startsWith('component:'))),
        unlockedLevel: altKombi.unlockedLevel || 1,
      };
    }
  }
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

// Lesson-Reihenfolge: erst Komponenten, dann Zeichen (WaniKani-Gating);
// Wörter erst, wenn alle ihre Zeichen im Hanzi-Deck gelernt sind (srs ≥ 1).
const TYP_RANG = { component: 0, zhuyin: 0, word: 0, character: 1 };

function neue(items) {
  let kandidaten = items.filter(it => {
    const c = T.srs.cards[it.key];
    return it.level <= T.srs.unlockedLevel && (!c || c.srs === 0);
  });
  kandidaten.sort((a, b) =>
    a.level - b.level || TYP_RANG[a.typ] - TYP_RANG[b.typ] || a.position - b.position);

  if (T.deck.key === 'hanzi') {
    const radikale = getSetting(`trainer-${T.lang}-radikale`);
    const gelernt = new Set(Object.entries(radikale?.cards || {})
      .filter(([, c]) => c.srs >= 1).map(([k]) => k));
    kandidaten = kandidaten.filter(it => {
      const komponenten = T.items.filter(k => k.item_type === 'component' && k.level === it.level);
      return komponenten.every(k => gelernt.has('component:' + k.data.zeichen));
    });
  }
  if (T.deck.key === 'woerter') {
    const hanzi = getSetting(`trainer-${T.lang}-hanzi`);
    const gelernt = new Set(Object.entries(hanzi?.cards || {})
      .filter(([k, c]) => k.startsWith('character:') && c.srs >= 1)
      .map(([k]) => k.split(':')[1]));
    kandidaten = kandidaten.filter(it => [...it.data.zeichen].every(c => gelernt.has(c)));
  }
  return kandidaten;
}

function levelStats(items, lvl) {
  const level = items.filter(it => it.level === lvl);
  const guru = level.filter(it => (T.srs.cards[it.key]?.srs || 0) >= 5).length;
  return { total: level.length, guru, pct: level.length ? Math.round(guru / level.length * 100) : 0 };
}

function maxLevel(items) { return items.reduce((m, it) => Math.max(m, it.level), 1); }

function checkLevelUp(items) {
  let aufstieg = false;
  const max = maxLevel(items);
  while (T.srs.unlockedLevel < max) {
    const s = levelStats(items, T.srs.unlockedLevel);
    if (s.total === 0) { T.srs.unlockedLevel++; continue; }  // leeres Level überspringen
    if (s.pct >= 80) { T.srs.unlockedLevel++; aufstieg = true; continue; }
    break;
  }
  return aufstieg;
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
    checkLevelUp(items); // überspringt u.a. leere Anfangslevel
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
  eintraege.push({ art: 'browse', enabled: true, label: 'Übersicht', desc: 'Alle Level & Fortschritt' });
  eintraege.push({ art: 'zurueck', enabled: true, label: '← Sprachen', desc: '' });
  return eintraege;
}

function trainerForecast() {
  const jetzt = Date.now();
  const tagesende = new Date(); tagesende.setHours(23, 59, 59, 999);
  const morgenende = tagesende.getTime() + 86400000;
  const wochenende = tagesende.getTime() + 7 * 86400000;
  let heute = 0, morgen = 0, woche = 0;
  for (const deck of (DECKS[T.lang] || [])) {
    T.deck = deck; ladeSrs();
    for (const c of Object.values(T.srs.cards)) {
      if (!c.nextReview || c.srs < 1 || c.srs >= 9) continue;
      const due = new Date(c.nextReview).getTime();
      if (due <= tagesende.getTime()) heute++;
      else if (due <= morgenende) morgen++;
      else if (due <= wochenende) woche++;
    }
  }
  el('tr-dash-forecast').innerHTML = (heute + morgen + woche) === 0 ? '' : `
    <div style="display:flex;gap:24px;justify-content:center;margin-bottom:20px;font-family:var(--mono);font-size:11px;color:var(--muted);">
      <span>Heute <b style="color:var(--text)">${heute}</b></span>
      <span>Morgen <b style="color:var(--text)">${morgen}</b></span>
      <span>Nächste 7 Tage <b style="color:var(--text)">${woche}</b></span>
    </div>`;
}

function trainerRenderDashboard() {
  trainerForecast();
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
  if (item.art === 'browse') { trainerShowBrowse(); return; }
  T.deck = item.deck;
  ladeSrs();
  const items = deckItems(item.deck);
  checkLevelUp(items);
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

// ── Tonfarben (1 orange · 2 grün · 3 blau · 4 violett · neutral grau) ──────
const TON_FARBEN = { 1: '#d98a3d', 2: '#3fa34d', 3: '#3b7fd4', 4: '#a05fd4', 5: 'var(--muted)' };

function tonVon(silbe) {
  if (silbe.includes('˙')) return 5;
  if (silbe.includes('ˊ')) return 2;
  if (silbe.includes('ˇ')) return 3;
  if (silbe.includes('ˋ')) return 4;
  return 1;
}

function mitTonfarben(zeichen, zhuyin) {
  const silben = (zhuyin || '').trim().split(/\s+/);
  const chars = [...zeichen];
  if (silben.length !== chars.length) return zeichen;
  return chars.map((c, i) => `<span style="color:${TON_FARBEN[tonVon(silben[i])]}">${c}</span>`).join('');
}

function zhuyinFarbig(zhuyin) {
  return (zhuyin || '').trim().split(/\s+/)
    .map(s => `<span style="color:${TON_FARBEN[tonVon(s)]}">${s}</span>`).join(' ');
}

// ── Karten-Rendering ───────────────────────────────────────────────────────
const TYP_LABEL = { component: 'Komponente 部', character: 'Zeichen 字', word: 'Wort 詞', zhuyin: 'Zhuyin ㄅ' };

function frontHtml(it, farben) {
  const d = it.data;
  if (it.typ === 'zhuyin') return `<div class="karte-wort" style="font-size:clamp(64px,18vw,120px);">${d.zhuyin}</div>`;
  const anzeige = farben ? mitTonfarben(d.zeichen, d.zhuyin) : d.zeichen;
  return `<div class="karte-wort" style="font-size:clamp(64px,18vw,120px);">${anzeige}</div>`;
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
      <div class="tr-strokes"></div>
      <div class="karte-de" style="font-size:clamp(28px,6vw,48px);">${d.name}</div>
      <div class="karte-merksatz">Komponente</div>`;
  }
  const b = d.beispiel_de;
  return `
    <div class="karte-wort karte-back-klein">${mitTonfarben(d.zeichen, d.zhuyin)}</div>
    ${[...d.zeichen].length === 1 ? '<div class="tr-strokes"></div>' : ''}
    <div class="karte-de" style="font-size:clamp(24px,5vw,40px);">${zhuyinFarbig(d.zhuyin)} &nbsp;·&nbsp; ${d.pinyin}</div>
    <div class="karte-de" style="font-size:clamp(20px,4vw,32px);">${d.de || d.meaning}</div>
    ${d.zerlegung ? `<div class="karte-merksatz" style="font-size:14px;">= ${d.zerlegung.map(t => `<b>${t.z}</b> ${t.name}`).join(' &nbsp;+&nbsp; ')}</div>` : ''}
    <div class="karte-merksatz">${[d.de ? d.meaning : null, ...(d.defs_de || d.defs || []).slice(1)].filter(Boolean).join(' · ')}</div>
    ${b ? `<div class="tr-beispiel">${b.zh} — <span style="color:var(--muted)">${b.de}</span></div>` : ''}`;
}

// Strichfolge-Animation (Hanzi Writer, vendored; Zeichendaten vom CDN —
// offline schlägt das leise fehl und der Container bleibt unsichtbar)
function animiereZeichen(ziel, zeichen, groesse = 110, zeigeFehler = false) {
  const fehler = (grund) => {
    if (!ziel) return;
    if (zeigeFehler) {
      ziel.innerHTML = `<span style="font-family:var(--mono);font-size:10px;color:var(--muted);">Strichfolge nicht verfügbar (${grund})</span>`;
    } else {
      ziel.style.display = 'none';
    }
  };
  if (!ziel) return;
  if (!window.HanziWriter) { fehler('Bibliothek fehlt — Seite neu laden'); return; }
  if (!zeichen || [...zeichen].length !== 1) { fehler('nur für Einzelzeichen'); return; }
  ziel.innerHTML = '';
  ziel.style.cssText = 'display:flex;justify-content:center;margin:8px 0;';
  try {
    const writer = window.HanziWriter.create(ziel, zeichen, {
      width: groesse, height: groesse, padding: 4,
      strokeColor: getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#f0ece4',
      delayBetweenStrokes: 120,
      strokeAnimationSpeed: 1.6,
      onLoadCharDataError: () => fehler('keine Strichdaten'),
    });
    writer.animateCharacter();
    ziel.onclick = (ev) => { ev.stopPropagation(); writer.animateCharacter(); };
  } catch (e) {
    fehler(e.message);
  }
}

function malStrichfolge(it) {
  animiereZeichen(el('tr-back').querySelector('.tr-strokes'), it.data.zeichen);
}

function sprich(it) {
  const d = it.data;
  if (it.typ === 'zhuyin') { if (d.beispiel?.zh) speak(d.beispiel.zh, 'zh-TW'); }
  else if (it.typ === 'character' || it.typ === 'word') speak(d.zeichen, 'zh-TW');
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
  el('tr-tag').textContent = 'NEU · ' + (TYP_LABEL[it.typ] || T.deck.titel);
  el('tr-counter').textContent = `${T.lessonIdx + 1} / ${T.lessonCards.length}`;
  el('tr-progress').style.width = (T.lessonIdx / T.lessonCards.length * 100) + '%';
  el('tr-front').innerHTML = frontHtml(it, true);
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
  malStrichfolge(it);
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
  el('tr-tag').textContent = 'REVIEW · ' + (TYP_LABEL[T.current.typ] || T.deck.titel);
  el('tr-counter').textContent = `noch ${T.pool.length} · ${T.done} ✓`;
  el('tr-progress').style.width = (T.done / T.total * 100) + '%';
  const c = T.srs.cards[T.current.key];
  const stage = SRS_STAGES[c?.srs || 0];
  el('tr-stage-badge').textContent = stage.name;
  el('tr-stage-badge').style.background = stage.color;
  el('tr-front').innerHTML = frontHtml(T.current, false);
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
  const aufstieg = checkLevelUp(items);
  speichereSrs();
  el('tr-result-levelup').textContent = aufstieg ? `🎉 Level ${T.srs.unlockedLevel} freigeschaltet!` : '';
  S.state = 'tr-result';
  show('tr-result-screen');
  el('tr-result-up').textContent = T.stats.up;
  el('tr-result-down').textContent = T.stats.down;
  el('tr-result-burned').textContent = T.stats.burned;
  const stats = levelStats(items, T.srs.unlockedLevel);
  el('tr-result-level').textContent =
    `Level ${T.srs.unlockedLevel} — ${stats.guru}/${stats.total} auf Guru+ (${stats.pct}%, 80% schalten frei)`;
}

export function trainerShowBrowse() {
  S.state = 'tr-browse';
  show('tr-browse-screen');
  const c = el('tr-browse-content');
  let html = '';
  for (const deck of (DECKS[T.lang] || [])) {
    T.deck = deck; ladeSrs();
    const items = deckItems(deck);
    checkLevelUp(items);
    const max = maxLevel(items);
    html += `<div style="font-family:var(--display);font-weight:900;font-size:16px;margin:28px 0 4px;">${deck.titel}</div>`;
    for (let lvl = 1; lvl <= max; lvl++) {
      const level = items.filter(i => i.level === lvl)
        .sort((a, b) => TYP_RANG[a.typ] - TYP_RANG[b.typ] || a.position - b.position);
      if (!level.length) continue;
      const locked = lvl > T.srs.unlockedLevel;
      const stats = levelStats(items, lvl);
      const striche = level.map(i => i.data.striche).filter(Boolean);
      const strichInfo = striche.length ? ` · ${Math.min(...striche)}–${Math.max(...striche)} Striche` : '';
      html += `<div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin:12px 0 6px;">Level ${lvl}${locked ? ' 🔒' : ` — ${stats.guru}/${stats.total} Guru+`} · ${level.length} Items${strichInfo}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">`;
      for (const it of level) {
        const srs = T.srs.cards[it.key]?.srs ?? -1;
        const farbe = (locked || srs < 1) ? 'var(--border)' : SRS_STAGES[srs].color;
        const glyph = it.data.zeichen || it.data.zhuyin;
        const tip = `${it.data.pinyin || ''} ${it.data.meaning || it.data.name || ''}`.trim();
        const strich = it.typ === 'component' ? 'border-style:dashed;' : '';
        html += `<span data-deck="${deck.key}" data-key="${it.key.replace(/"/g, '&quot;')}" title="${(it.typ === 'component' ? 'Komponente: ' : '') + tip.replace(/"/g, '&quot;')}" style="padding:4px 9px;border-radius:3px;border:1px solid ${farbe};${strich}font-size:16px;cursor:pointer;${locked ? 'opacity:0.35;' : ''}">${glyph}</span>`;
      }
      html += '</div>';
    }
  }
  c.innerHTML = html;
  c.onclick = (e) => {
    const box = e.target.closest('[data-key]');
    if (box) trainerShowDetail(box.dataset.deck, box.dataset.key);
  };
  window.scrollTo(0, 0);
}

// ── Detail-Ansicht (Klick in der Übersicht) ────────────────────────────────
function formatNaechstesReview(c) {
  if (!c || !c.srs) return 'Noch nicht gelernt';
  if (c.srs >= 9) return 'Burned — für immer gemeistert 🎉';
  if (!c.nextReview) return '—';
  const diff = new Date(c.nextReview).getTime() - Date.now();
  if (diff <= 0) return 'jetzt fällig!';
  const stunden = Math.round(diff / 3600000);
  if (stunden < 1) return 'in weniger als 1 Stunde';
  if (stunden < 48) return `in ${stunden} Stunde${stunden === 1 ? '' : 'n'}`;
  const dat = new Date(c.nextReview);
  return `${dat.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}, ${dat.getHours()} Uhr`;
}

const zeile = (label, inhalt) => inhalt ? `
  <div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid var(--border);text-align:left;">
    <span style="font-family:var(--mono);font-size:10px;color:var(--muted);min-width:110px;padding-top:3px;text-transform:uppercase;letter-spacing:0.1em;">${label}</span>
    <span style="flex:1;">${inhalt}</span>
  </div>` : '';

export function trainerShowDetail(deckKey, key) {
  const deck = (DECKS[T.lang] || []).find(dk => dk.key === deckKey);
  if (!deck) return;
  T.deck = deck; ladeSrs();
  const it = deckItems(deck).find(i => i.key === key);
  if (!it) return;
  T.browseScroll = window.scrollY;
  S.state = 'tr-detail';
  show('tr-detail-screen');

  const d = it.data;
  const c = T.srs.cards[it.key];
  const stage = (c && c.srs >= 1) ? SRS_STAGES[Math.min(c.srs, 9)] : null;

  let html = `<div style="text-align:center;">
    <span class="category-tag blue">${TYP_LABEL[it.typ] || it.typ} · Level ${it.level}</span>
    <div class="karte-wort" style="font-size:clamp(56px,14vw,96px);margin:16px 0 4px;">${(it.typ === 'character' || it.typ === 'word') ? mitTonfarben(d.zeichen, d.zhuyin) : (d.zeichen || d.zhuyin)}</div>
    ${it.typ !== 'zhuyin' && [...(d.zeichen || '')].length === 1 ? '<div id="tr-detail-strokes"></div>' : ''}
  </div>`;

  if (d.zhuyin || d.pinyin) html += zeile('Lesung', `${zhuyinFarbig(d.zhuyin || '')} &nbsp;·&nbsp; ${d.pinyin || ''}`);
  html += zeile('Bedeutung', d.de || d.name || d.meaning || '');
  if (d.defs_de && d.defs_de.length > 1) html += zeile('Auch', d.defs_de.slice(1).join(' · '));
  if (d.meaning && d.de) html += zeile('Englisch', [d.meaning, ...(d.defs || []).slice(1)].join(' · '));
  if (d.zerlegung) html += zeile('Zerlegung', d.zerlegung.map(z => `<b>${z.z}</b> ${z.name}`).join(' &nbsp;+&nbsp; '));
  if (d.striche) html += zeile('Striche', `${d.striche} — Animation oben antippen zum Wiederholen`);
  if (d.hinweis) html += zeile('Aussprache', d.hinweis);
  if (d.beispiel) html += zeile('Beispiel', `${d.beispiel.zh} &nbsp;${d.beispiel.zy || ''} &nbsp;<span style="color:var(--muted)">${d.beispiel.py || ''} — ${d.beispiel.de || ''}</span>`);
  if (d.beispiel_de) html += zeile('Beispielsatz', `${d.beispiel_de.zh} — <span style="color:var(--muted)">${d.beispiel_de.de}</span>`);

  // Wo kommt das vor?
  if (it.typ === 'component') {
    const nutzer = T.items.filter(x => x.item_type === 'character' && (x.data.zerlegung || []).some(z => z.z === d.zeichen))
      .map(x => x.data.zeichen).slice(0, 15);
    if (nutzer.length) html += zeile('Baustein von', nutzer.join(' '));
  }
  if (it.typ === 'character') {
    const woerter = T.items.filter(x => x.item_type === 'word' && [...x.data.zeichen].includes(d.zeichen))
      .map(x => x.data.zeichen).slice(0, 15);
    if (woerter.length) html += zeile('In Wörtern', woerter.join(' · '));
  }

  // SRS-Status + nächster Termin
  html += zeile('SRS-Stufe', stage
    ? `<span style="background:${stage.color};color:#fff;padding:2px 10px;border-radius:3px;font-family:var(--mono);font-size:11px;">${stage.name}</span>`
    : '<span style="color:var(--muted)">Noch nicht gelernt</span>');
  html += zeile('Nächstes Review', formatNaechstesReview(c));

  el('tr-detail-content').innerHTML = html;
  animiereZeichen(el('tr-detail-strokes'), it.typ !== 'zhuyin' ? d.zeichen : null, 130, true);
  sprich(it);
}

export function trZurueckZurUebersicht() {
  trainerShowBrowse();
  requestAnimationFrame(() => window.scrollTo(0, T.browseScroll || 0));
}

export function trAbbrechen() {
  if (!S.state.startsWith('tr-lesson') && !S.state.startsWith('tr-review')) return;
  if (T.phase === 'review') speichereSrs(); // beantwortete Karten behalten ihren Fortschritt
  trainerShowDashboard(T.lang);
}

export function trBackToDash() {
  trainerShowDashboard(T.lang);
}

// Für ui.js (Sprachauswahl) und inline-onclick ohne Import-Zyklus:
Object.assign(window, { trainerShowDashboard, trFlip, trNext, trGewusst, trNochmal, trBackToDash, trainerShowBrowse, trAbbrechen, trainerShowDetail, trZurueckZurUebersicht });
