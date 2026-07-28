// UI: Sprachen-Menü + Russisch-SRS-Trainer.
// Der alte Kapitelbaum (Grammatik/Dialog/Text/Hören/Theorie/Quiz) wurde entfernt —
// er lebt in der Git-History (Commit 58632d3 und davor) weiter.
import { S, SRS_STAGES } from './state.js';
import { speak } from './tts.js';
import { getSetting, setSetting, istEingeloggt, abmelden } from './progress.js';

const GENUS_FARBEN = { m: 'var(--blue)', f: '#e05080', n: '#a78bfa' };

// ── Utilities ──────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function getGenus(karte) {
  if (!karte.m) return null;
  const m = karte.m.trimStart();
  if (m.startsWith('m.')) return 'm';
  if (m.startsWith('f.')) return 'f';
  if (m.startsWith('n.')) return 'n';
  return null;
}

function highlightRu(text) {
  if (!text) return '';
  return text.replace(/[\u0400-\u04FF][\u0400-\u04FF\-]*/g,
    w => `<span class="ru-wort">${w}</span>`);
}

// ── Sprachen Menu ──────────────────────────────────────────────────────────
// Neuausrichtung: reine Trainer-Plattform. Der alte Kapitelbaum (Grammatik,
// Dialoge, Texte) ist nicht mehr erreichbar — jede Sprache führt direkt in
// ihr Trainer-Dashboard.
const ZEIGE_ALTEN_RUSSISCH_SRS = false;

function getSprachenItems() {
  const items = [];
  // Der alte Russisch-SRS (482 Einzelvokabeln) ist vorerst ausgeblendet — der
  // morphologische Trainer übernimmt. Code und Lernstand bleiben unangetastet;
  // auf ZEIGE_ALTEN_RUSSISCH_SRS = true kommt er zurück.
  const russisch = ZEIGE_ALTEN_RUSSISCH_SRS ? S.sprachenData.find(s => s.id === 'russian') : null;
  if (russisch) {
    const due = srsGetDueCards().length;
    items.push({
      trainer: 'russisch-srs', sprache: russisch,
      name: '🇷🇺 Русский — Vokabeltrainer',
      desc: (due > 0 ? `${due} Reviews fällig` : 'Keine Reviews fällig') + ' · Level ' + S.srsData.unlockedLevel,
    });
  }
  items.push({
    trainer: 'chinese-tw', sprache: { id: 'chinese-tw', sprache: '中文（台灣）', icon: '🇹🇼' },
    name: '🇹🇼 中文 — Mandarin (traditionell)',
    desc: 'Zhuyin ㄅㄆㄇ · Zeichen · Wörter',
  });
  items.push({
    trainer: 'russian-morph',
    sprache: { id: 'russian-morph', sprache: 'Русский', icon: '🇷🇺' },
    name: '🇷🇺 Русский — Wortbausteine',
    desc: 'Wörter aus Präfixen und Wurzeln zusammensetzen',
  });
  items.push({
    isBuecher: true, name: '📚 Bücherregal',
    desc: 'Japanisch N3→N2 · Chinesisch von innen heraus — im Browser lesen',
  });
  items.push({ isExport: true, name: '⬇ Lernstand sichern',
    desc: 'Alles als Datei herunterladen — Versicherung gegen Datenverlust' });
  items.push({ isPedal: true, name: '⚙ Pedal-Tasten belegen', desc: 'Aktuell: A · B · C (oder eigene Belegung)' });
  if (istEingeloggt()) items.push({ isLogout: true, name: 'Abmelden', desc: 'Fortschritt bleibt gespeichert' });
  return items;
}

function renderSprachen() {
  S.state = 'sprachen-menu';
  show('sprachen-screen');
  const list = document.getElementById('sprachen-list');
  list.innerHTML = '';

  getSprachenItems().forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'menu-item' + (i === S.sprachenCursor ? ' selected' : '');
    div.innerHTML = `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name"${(item.isLogout || item.isPedal) ? ' style="color:var(--muted)"' : ''}>${item.name}</span>
        <span class="menu-item-desc">${item.desc}</span>
      </span>`;
    div.onclick = () => { S.sprachenCursor = i; sprachenSelect(); };
    div.style.cursor = 'pointer';
    list.appendChild(div);
  });
}

function sprachenMove(dir) {
  const n = getSprachenItems().length;
  S.sprachenCursor = (S.sprachenCursor + dir + n) % n;
  renderSprachen();
}

function sprachenSelect() {
  const item = getSprachenItems()[S.sprachenCursor];
  if (!item) return;
  if (item.isLogout) { abmelden(); return; }
  if (item.isPedal) { window.startePedalSetup?.(); return; }
  if (item.isExport) {
    import('./sync.js').then(async ({ exportiereAlles }) => {
      const { alleSettings } = await import('./progress.js');
      const n = await exportiereAlles(alleSettings());
      alert(`Lernstand gesichert — ${n} Karten in der Datei.`);
    });
    return;
  }
  if (item.isBuecher) { S.buecherCursor = 0; window.buecherShowListe?.(); return; }
  S.aktiveSprache = item.sprache;
  if (item.trainer === 'russisch-srs') {
    srsShowDashboard();
  } else if (item.trainer === 'russian-morph') {
    window.trainerShowDashboard?.('russian-morph');
  } else {
    // Mandarin-Trainer (js/trainer.js hängt sich an window, um Zyklen zu vermeiden)
    window.trainerShowDashboard?.('chinese-tw');
  }
}

// ── SRS Image Loading ─────────────────────────────────────────────────────
// Bilder kommen vom lokalen /api/image-Proxy (Unsplash) — auf GitHub Pages
// schlägt der Fetch still fehl, dann gibt es einfach kein Bild.
const _srsImageCache = {}; // de → {url, credit, link} oder null

async function srsLoadImage(de, imgEl) {
  imgEl.style.display = 'none';
  imgEl.innerHTML = '';

  if (_srsImageCache[de] === null) return; // already tried, no result
  if (_srsImageCache[de]) {
    srsShowImage(imgEl, _srsImageCache[de]);
    return;
  }

  try {
    const res = await fetch('/api/image?q=' + encodeURIComponent(de));
    if (!res.ok) { _srsImageCache[de] = null; return; }
    const data = await res.json();
    _srsImageCache[de] = data;
    srsShowImage(imgEl, data);
  } catch (e) {
    _srsImageCache[de] = null;
  }
}

function srsShowImage(imgEl, data) {
  imgEl.innerHTML = `<img src="${data.url}" alt="${data.alt}" style="max-width:100%;max-height:160px;border-radius:4px;object-fit:cover;">
    <div style="font-family:var(--mono);font-size:8px;color:var(--muted);margin-top:4px;">Foto: ${data.credit}</div>`;
  imgEl.style.display = 'block';
  imgEl.style.textAlign = 'center';
  imgEl.style.margin = '12px 0';
}

// ── SRS System ────────────────────────────────────────────────────────────

function srsCardKey(card) { return card.ru + '|' + card.de; }

function srsBuildCardMap() {
  S.srsAllCards = [];
  S.srsCardMap = {};
  if (!S.sprachenData || !S.sprachenData.length) return;

  for (const sprache of S.sprachenData) {
    if (sprache.id !== 'russian') continue;
    for (const kap of (sprache.kapitel || [])) {
      for (const uk of (kap.unterkapitel || [])) {
        for (const einheit of (uk.einheiten || [])) {
          if (einheit.typ !== 'vokabeln' || !einheit.karten) continue;
          for (const karte of einheit.karten) {
            const key = srsCardKey(karte);
            if (!S.srsCardMap[key]) {
              S.srsCardMap[key] = karte;
              S.srsAllCards.push(karte);
            }
          }
        }
      }
    }
  }
}

async function srsLoad() {
  try {
    // Reihenfolge: Cloud (settings) → localStorage → Seed-Datei (Mai 2026)
    const cloud = getSetting('srs-russian');
    const raw = localStorage.getItem('srs-russian');
    if (cloud && cloud.cards) {
      S.srsData = cloud;
    } else if (raw) {
      S.srsData = JSON.parse(raw);
    } else {
      const res = await fetch('srs-data.json');
      const seed = res.ok ? await res.json() : {};
      S.srsData = seed.russian || { cards: {}, unlockedLevel: 1 };
    }
  } catch (e) {
    console.warn('SRS-Daten nicht geladen:', e.message);
    S.srsData = { cards: {}, unlockedLevel: 1 };
  }
  if (!S.srsData.cards) S.srsData.cards = {};
  if (!S.srsData.unlockedLevel) S.srsData.unlockedLevel = 1;
}

async function srsSave() {
  try {
    localStorage.setItem('srs-russian', JSON.stringify(S.srsData));
    // Cloud-Sync: kompletter Stand in settings.data → synct zwischen Geräten
    setSetting('srs-russian', S.srsData);
  } catch (e) {
    console.error('SRS-Speichern fehlgeschlagen:', e.message);
  }
}

function srsGetDueCards() {
  const now = Date.now();
  const due = [];
  for (const [key, data] of Object.entries(S.srsData.cards)) {
    if (data.srs >= 9) continue; // Burned
    if (data.srs === 0) continue; // Not yet learned
    if (new Date(data.nextReview).getTime() <= now) {
      const card = S.srsCardMap[key];
      if (card) due.push({ key, card, data });
    }
  }
  return due;
}

function srsGetNewCards() {
  const newCards = [];
  if (typeof SRS_LEVELS === 'undefined') return newCards;

  for (let lvl = 0; lvl < Math.min(S.srsData.unlockedLevel, SRS_LEVELS.length); lvl++) {
    for (const key of SRS_LEVELS[lvl]) {
      if (!S.srsData.cards[key] || S.srsData.cards[key].srs === 0) {
        const card = S.srsCardMap[key];
        if (card) newCards.push({ key, card });
      }
    }
  }
  return newCards;
}

function srsGetLevelStats(lvl) {
  if (typeof SRS_LEVELS === 'undefined' || lvl >= SRS_LEVELS.length) return { total: 0, guru: 0, pct: 0 };
  const keys = SRS_LEVELS[lvl];
  let guru = 0;
  for (const key of keys) {
    const data = S.srsData.cards[key];
    if (data && data.srs >= 5) guru++;
  }
  return { total: keys.length, guru, pct: keys.length ? Math.round((guru / keys.length) * 100) : 0 };
}

function srsGetStageCounts() {
  const counts = { apprentice: 0, guru: 0, master: 0, enlightened: 0, burned: 0, neu: 0 };
  for (const data of Object.values(S.srsData.cards)) {
    if (data.srs === 0) counts.neu++;
    else if (data.srs <= 4) counts.apprentice++;
    else if (data.srs <= 6) counts.guru++;
    else if (data.srs === 7) counts.master++;
    else if (data.srs === 8) counts.enlightened++;
    else if (data.srs >= 9) counts.burned++;
  }
  return counts;
}

function srsCheckLevelUp() {
  const currentLvl = S.srsData.unlockedLevel - 1;
  if (typeof SRS_LEVELS === 'undefined') return;
  if (currentLvl >= SRS_LEVELS.length - 1) return;
  const stats = srsGetLevelStats(currentLvl);
  if (stats.pct >= 80) {
    S.srsData.unlockedLevel = Math.min(S.srsData.unlockedLevel + 1, SRS_LEVELS.length);
  }
}

function srsGetForecast() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = [];

  // Count reviews for today + next 6 days
  for (let d = 0; d < 7; d++) {
    const dayStart = new Date(today.getTime() + d * 86400000);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    let count = 0;

    for (const data of Object.values(S.srsData.cards)) {
      if (data.srs >= 9 || data.srs === 0) continue;
      if (!data.nextReview) continue;
      const t = new Date(data.nextReview).getTime();
      if (d === 0) {
        if (t < dayEnd.getTime()) count++;
      } else {
        if (t >= dayStart.getTime() && t < dayEnd.getTime()) count++;
      }
    }

    const labels = ['Heute', 'Morgen'];
    let label;
    if (d < 2) {
      label = labels[d];
    } else {
      const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      label = weekdays[dayStart.getDay()];
    }
    days.push({ label, count });
  }

  return days;
}

function srsShowForecastDetail() {
  window.zeigeForecast?.({
    cards: S.srsData.cards,
    titel: 'Русский — Vokabeltrainer',
    // Kartenschlüssel ist "ru|de"; für die Anzeige reicht die Vorderseite,
    // die Rückseite landet im Tooltip.
    aufloesen: (key) => {
      const card = S.srsCardMap[key.split('|').slice(0, 2).join('|')] || S.srsCardMap[key];
      if (card) return { vorne: card.ru, hinten: card.de };
      const [ru, de] = key.split('|');
      return ru ? { vorne: ru, hinten: de || '' } : null;
    },
    zurueck: () => srsShowDashboard(),
  });
}

// ── SRS Dashboard ──

function srsShowDashboard() {
  S.state = 'srs-dashboard';
  show('srs-dashboard-screen');
  // Set cursor to first enabled item
  const items = srsGetDashboardItems();
  S.srsDashboardCursor = items.findIndex(it => it.enabled);
  if (S.srsDashboardCursor < 0) S.srsDashboardCursor = 0;
  srsRenderDashboard();
}

function srsRenderDashboard() {
  const dueCards = srsGetDueCards();
  const newCards = srsGetNewCards();
  const currentLvl = S.srsData.unlockedLevel;
  const stats = srsGetLevelStats(currentLvl - 1);
  const counts = srsGetStageCounts();

  document.getElementById('srs-level-label').textContent = `LEVEL ${currentLvl} / ${typeof SRS_LEVELS !== 'undefined' ? SRS_LEVELS.length : '?'}`;
  document.getElementById('srs-level-progress').style.width = stats.pct + '%';
  document.getElementById('srs-level-stats').textContent = `${stats.guru} / ${stats.total} auf Guru+ (${stats.pct}%) — 80% zum Freischalten`;

  // Stage bars
  const barsEl = document.getElementById('srs-stage-bars');
  const total = counts.apprentice + counts.guru + counts.master + counts.enlightened + counts.burned;
  if (total > 0) {
    barsEl.innerHTML = [
      { n: counts.apprentice, cls: 'srs-stage-apprentice', label: 'App ' + counts.apprentice },
      { n: counts.guru, cls: 'srs-stage-guru', label: 'Guru ' + counts.guru },
      { n: counts.master, cls: 'srs-stage-master', label: 'Mstr ' + counts.master },
      { n: counts.enlightened, cls: 'srs-stage-enlightened', label: 'Enl ' + counts.enlightened },
      { n: counts.burned, cls: 'srs-stage-burned', label: 'Brn ' + counts.burned },
    ].filter(s => s.n > 0).map(s =>
      `<div class="${s.cls}" style="flex:${s.n};display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:9px;color:#fff;min-width:24px;" title="${s.label}">${s.n}</div>`
    ).join('');
  } else {
    barsEl.innerHTML = '<div style="flex:1;background:var(--border);"></div>';
  }

  // Forecast: compact summary on dashboard
  const forecastEl = document.getElementById('srs-forecast');
  const forecast = srsGetForecast();
  if (forecast.length > 0) {
    forecastEl.innerHTML = `
      <div style="font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:0.1em;margin-bottom:8px;">ANSTEHENDE REVIEWS</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        ${forecast.map(f => `
          <div style="text-align:center;min-width:48px;">
            <div style="font-family:var(--display);font-size:18px;font-weight:700;color:${f.count > 0 ? 'var(--text)' : 'var(--muted)'};">${f.count}</div>
            <div style="font-family:var(--mono);font-size:9px;color:var(--muted);">${f.label}</div>
          </div>
        `).join('')}
      </div>`;
  } else {
    forecastEl.innerHTML = '';
  }

  // Menu list
  const list = document.getElementById('srs-dashboard-list');
  const items = srsGetDashboardItems();
  list.innerHTML = '';
  items.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'menu-item' + (i === S.srsDashboardCursor ? ' selected' : '');
    if (!item.enabled) div.style.opacity = '0.4';
    div.innerHTML = `
      <span class="cursor-arrow" style="color:var(--green)">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${item.label}</span>
        ${item.desc ? `<span class="menu-item-desc">${item.desc}</span>` : ''}
      </span>`;
    if (item.enabled) {
      div.onclick = () => { S.srsDashboardCursor = i; srsDashboardSelect(); };
      div.style.cursor = 'pointer';
    }
    list.appendChild(div);
  });

  // Scroll selected item into view
  document.querySelector('#srs-dashboard-list .selected')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function srsGetDashboardItems() {
  const dueCards = srsGetDueCards();
  const newCards = srsGetNewCards();
  return [
    { label: `Reviews starten`, desc: `${dueCards.length} fällig`, enabled: dueCards.length > 0 },
    { label: `Neue Karten lernen`, desc: `${Math.min(5, newCards.length)} verfügbar`, enabled: newCards.length > 0 },
    { label: `Review-Vorschau`, desc: `Wann was drankommt — Tag für Tag, Stunde für Stunde`, enabled: true },
    { label: `Vokabel-Übersicht`, desc: `Alle Level & Fortschritt`, enabled: true },
    { label: '← Zurück', desc: '', enabled: true },
  ];
}

function srsDashboardMove(dir) {
  const items = srsGetDashboardItems();
  let next = S.srsDashboardCursor + dir;
  // Skip disabled items
  while (next >= 0 && next < items.length && !items[next].enabled) {
    next += dir;
  }
  if (next >= 0 && next < items.length) {
    S.srsDashboardCursor = next;
  }
  srsRenderDashboard();
}

function srsDashboardSelect() {
  if (S.srsDashboardCursor === 0) {
    const due = srsGetDueCards();
    if (due.length === 0) return;
    srsStartReviews(due);
  } else if (S.srsDashboardCursor === 1) {
    const newCards = srsGetNewCards();
    if (newCards.length === 0) return;
    srsStartLesson(newCards.slice(0, 5));
  } else if (S.srsDashboardCursor === 2) {
    srsShowForecastDetail();
  } else if (S.srsDashboardCursor === 3) {
    srsShowBrowse();
  } else {
    renderSprachen();
  }
}

// ── SRS Lesson ──

function srsStartLesson(cards) {
  S.srsLessonCards = cards;
  S.srsLessonIdx = 0;
  S.srsLessonPhase = 'show';
  srsShowLessonCard();
}

function srsShowLessonCard() {
  S.state = 'srs-lesson-front';
  show('srs-lesson-screen');
  const { card } = S.srsLessonCards[S.srsLessonIdx];
  const total = S.srsLessonCards.length;

  document.getElementById('srs-lesson-progress').style.width = ((S.srsLessonIdx / total) * 100) + '%';
  document.getElementById('srs-lesson-counter').textContent = `${S.srsLessonIdx + 1} / ${total}`;

  // Genus bar
  const genus = getGenus(card);
  const genusColor = GENUS_FARBEN[genus] || 'var(--border)';
  const bar = document.getElementById('srs-lesson-genus-bar');
  bar.style.background = genus ? genusColor : 'var(--border)';
  bar.style.opacity = genus ? '1' : '0.3';

  // Front
  const ruEl = document.getElementById('srs-lesson-ru');
  ruEl.textContent = card.ru;
  ruEl.style.color = genus ? genusColor : '';

  document.getElementById('srs-lesson-front').style.display = 'block';
  document.getElementById('srs-lesson-back').style.display = 'none';

  speak(card.ru);
}

function srsLessonFlip() {
  S.state = 'srs-lesson-back';
  const { card } = S.srsLessonCards[S.srsLessonIdx];
  const genus = getGenus(card);
  const genusColor = GENUS_FARBEN[genus] || '';

  const backRu = document.getElementById('srs-lesson-back-ru');
  backRu.textContent = card.ru;
  backRu.style.color = genusColor;

  document.getElementById('srs-lesson-back-de').textContent = card.de;
  document.getElementById('srs-lesson-m').innerHTML = highlightRu(card.m || '');

  // Bild laden
  srsLoadImage(card.de, document.querySelector('#srs-lesson-back .srs-card-image'));

  document.getElementById('srs-lesson-front').style.display = 'none';
  document.getElementById('srs-lesson-back').style.display = 'block';

  speak(card.ru);
}

function srsLessonNext() {
  S.srsLessonIdx++;
  if (S.srsLessonIdx >= S.srsLessonCards.length) {
    // Phase 1 done, start review of these cards
    srsStartLessonReview();
  } else {
    srsShowLessonCard();
  }
}

function srsStartLessonReview() {
  S.srsReviewPool = S.srsLessonCards.map(({ key, card }) => ({ key, card, ruDeOk: false, deRuOk: false }));
  S.srsReviewDone = 0;
  S.srsReviewTotal = S.srsReviewPool.length;
  S.srsReviewFailed = new Set();
  S.srsSessionStats = { up: 0, down: 0, burned: 0 };
  S.srsLessonPhase = 'review';
  // BUG-FIX: Reste einer früher abgebrochenen Review-Session löschen — sonst
  // zeigt srsFinishBatch nach der Lesson fälschlich den Batch-Pause-Screen
  S.srsBatchQueue = [];
  S.srsBatchIdx = 0;
  srsPickNextReviewCard();
}

// ── SRS Reviews ──

function srsStartReviews(dueCards) {
  S.srsSessionStats = { up: 0, down: 0, burned: 0 };
  S.srsReviewFailed = new Set();

  // Split into batches of 10
  const shuffledDue = shuffle(dueCards);
  S.srsBatchQueue = [];
  for (let i = 0; i < shuffledDue.length; i += 10) {
    S.srsBatchQueue.push(shuffledDue.slice(i, i + 10));
  }
  S.srsBatchIdx = 0;
  srsStartBatch();
}

function srsStartBatch() {
  const batch = S.srsBatchQueue[S.srsBatchIdx];
  S.srsReviewPool = batch.map(({ key, card }) => ({ key, card, ruDeOk: false, deRuOk: false }));
  S.srsReviewDone = 0;
  S.srsReviewTotal = S.srsReviewPool.length;
  srsPickNextReviewCard();
}

// Pick a random card from the pool and a direction that still needs answering
function srsPickNextReviewCard() {
  if (S.srsReviewPool.length === 0) {
    srsFinishBatch();
    return;
  }

  // Pick random pair from pool
  const poolIdx = Math.floor(Math.random() * S.srsReviewPool.length);
  const pair = S.srsReviewPool[poolIdx];

  // Pick a direction that has not been answered correctly yet
  let direction;
  if (!pair.ruDeOk && !pair.deRuOk) {
    direction = Math.random() < 0.5 ? 'ru-de' : 'de-ru';
  } else if (!pair.ruDeOk) {
    direction = 'ru-de';
  } else {
    direction = 'de-ru';
  }

  S.srsCurrentReview = { poolIdx, pair, direction };
  srsShowReviewCard();
}

function srsShowReviewCard() {
  const { pair, direction } = S.srsCurrentReview;
  S.state = 'srs-review-front';
  show('srs-review-screen');

  // Counter: "noch X | Y geschafft"
  const remaining = S.srsReviewPool.length;
  document.getElementById('srs-review-progress').style.width = ((S.srsReviewDone / S.srsReviewTotal) * 100) + '%';
  document.getElementById('srs-review-counter').textContent = `noch ${remaining} · ${S.srsReviewDone} ✓`;

  // Direction label
  const dirLabel = direction === 'ru-de' ? 'РУ → DE' : 'DE → РУ';
  document.getElementById('srs-review-direction').textContent = dirLabel;

  // SRS badge
  const cardData = S.srsData.cards[pair.key];
  const srsStage = cardData ? cardData.srs : 0;
  const badge = document.getElementById('srs-review-srs-badge');
  badge.textContent = SRS_STAGES[srsStage].name;
  badge.style.background = SRS_STAGES[srsStage].color;
  badge.style.color = '#fff';

  // Genus
  const genus = getGenus(pair.card);
  const genusColor = GENUS_FARBEN[genus] || 'var(--border)';
  const bar = document.getElementById('srs-review-genus-bar');
  bar.style.background = genus ? genusColor : 'var(--border)';
  bar.style.opacity = genus ? '1' : '0.3';

  // Front word
  const frontText = direction === 'ru-de' ? pair.card.ru : pair.card.de;
  const frontEl = document.getElementById('srs-review-front-wort');
  frontEl.textContent = frontText;
  frontEl.style.color = (direction === 'ru-de' && genus) ? genusColor : '';

  // Prepare back
  const backOben = document.getElementById('srs-review-back-oben');
  backOben.textContent = frontText;
  backOben.style.color = (direction === 'ru-de' && genus) ? genusColor : '';

  const backUnten = document.getElementById('srs-review-back-unten');
  backUnten.textContent = direction === 'ru-de' ? pair.card.de : pair.card.ru;
  backUnten.style.color = (direction === 'de-ru' && genus) ? genusColor : '';

  // Merksatz hidden in normal reviews (shown only on nochmal)
  document.getElementById('srs-review-merksatz').style.display = 'none';

  document.getElementById('srs-review-front').style.display = 'block';
  document.getElementById('srs-review-back').style.display = 'none';

  // TTS
  if (direction === 'ru-de') {
    speak(pair.card.ru);
  } else {
    speak(pair.card.de, 'de');
  }
}

function srsReviewFlip() {
  S.state = 'srs-review-back';
  document.getElementById('srs-review-front').style.display = 'none';
  document.getElementById('srs-review-back').style.display = 'block';

  const { pair } = S.srsCurrentReview;
  // Bild laden
  srsLoadImage(pair.card.de, document.querySelector('#srs-review-back .srs-card-image'));
  // Always speak RU on flip
  speak(pair.card.ru);
}

function srsReviewGewusst() {
  if (S.state !== 'srs-review-back') return;
  S.state = 'srs-review-animating'; // prevent double-press
  const { pair, direction } = S.srsCurrentReview;

  // Mark this direction as correct
  if (direction === 'ru-de') pair.ruDeOk = true;
  else pair.deRuOk = true;

  // Both directions correct? → pair is done, remove from pool
  if (pair.ruDeOk && pair.deRuOk) {
    S.srsReviewPool.splice(S.srsReviewPool.indexOf(pair), 1);
    S.srsReviewDone++;

    // Only update SRS level if this card was never wrong this session
    if (!S.srsReviewFailed.has(pair.key)) {
      const change = srsUpdateCard(pair.key, true);
      if (change !== 0) {
        srsShowStageOverlay(change > 0, pair.key);
        setTimeout(() => { srsHideStageOverlay(); srsPickNextReviewCard(); }, 1200);
        return;
      }
    }
  }

  srsPickNextReviewCard();
}

function srsReviewNochmal() {
  if (S.state !== 'srs-review-back') return;
  S.state = 'srs-review-animating';
  const { pair, direction } = S.srsCurrentReview;

  // Show merksatz on nochmal
  const mEl = document.getElementById('srs-review-merksatz');
  mEl.innerHTML = highlightRu(pair.card.m || '');
  mEl.style.display = 'block';

  // Mark as failed — level drops, and no level-up on retry
  if (!S.srsReviewFailed.has(pair.key)) {
    S.srsReviewFailed.add(pair.key);
    const change = srsUpdateCard(pair.key, false);
    if (change !== 0) {
      // Reset both directions so user must redo both
      pair.ruDeOk = false;
      pair.deRuOk = false;
      srsShowStageOverlay(false, pair.key);
      setTimeout(() => { srsHideStageOverlay(); srsPickNextReviewCard(); }, 1200);
      return;
    }
  }

  // Reset both directions so user must redo both
  pair.ruDeOk = false;
  pair.deRuOk = false;

  srsPickNextReviewCard();
}

function srsUpdateCard(key, correct) {
  if (!S.srsData.cards[key]) {
    S.srsData.cards[key] = { srs: 0, nextReview: new Date().toISOString() };
  }
  const card = S.srsData.cards[key];
  const oldSrs = card.srs;

  if (correct) {
    card.srs = Math.min(9, card.srs + 1);
  } else {
    // New cards stay at 0, existing cards drop by 2 (min Apprentice 1)
    card.srs = oldSrs === 0 ? 0 : Math.max(1, card.srs - 2);
  }

  if (card.srs >= 9) {
    card.nextReview = null; // Burned
    S.srsSessionStats.burned++;
  } else {
    // Auf volle Stunde abrunden, damit alle Karten einer Stunde gleichzeitig fällig werden
    const due = new Date(Date.now() + SRS_STAGES[card.srs].interval);
    due.setMinutes(0, 0, 0);
    card.nextReview = due.toISOString();
  }

  if (card.srs > oldSrs) { S.srsSessionStats.up++; return 1; }
  else if (card.srs < oldSrs) { S.srsSessionStats.down++; return -1; }
  return 0; // no change (e.g. new card failed, stays at 0)
}

function srsShowStageOverlay(up, key) {
  const overlay = document.getElementById('srs-stage-overlay');
  const arrow = document.getElementById('srs-stage-arrow');
  const label = document.getElementById('srs-stage-label');

  const cardData = S.srsData.cards[key];
  const stageName = cardData ? SRS_STAGES[cardData.srs].name : '';
  const stageColor = cardData ? SRS_STAGES[cardData.srs].color : '';

  const color = up ? 'var(--green)' : 'var(--red)';
  const borderColor = up ? 'rgba(46,204,113,0.3)' : 'rgba(230,51,41,0.3)';
  const bgColor = up ? 'rgba(46,204,113,0.1)' : 'rgba(230,51,41,0.1)';

  arrow.textContent = up ? '↑' : '↓';
  arrow.style.color = color;
  arrow.style.animation = up ? 'srsArrowUp 0.4s ease' : 'srsArrowDown 0.4s ease';

  label.innerHTML = `<span style="color:${stageColor};font-weight:700;">${stageName}</span>`;
  label.style.background = bgColor;
  label.style.border = `1px solid ${borderColor}`;
  label.style.borderRadius = '6px';
  label.style.padding = '6px 16px';
  label.style.marginTop = '12px';

  overlay.style.display = 'flex';
  overlay.classList.add('show');
}

function srsHideStageOverlay() {
  const overlay = document.getElementById('srs-stage-overlay');
  overlay.classList.remove('show');
  overlay.style.display = 'none';
}

async function srsFinishBatch() {
  // BUG-FIX: Level-Up VOR dem Speichern prüfen — vorher ging ein frisch
  // freigeschaltetes Level beim nächsten Neuladen wieder verloren
  srsCheckLevelUp();
  await srsSave();

  if (S.srsLessonPhase === 'review') {
    // Lesson review done — cards were already updated during review via srsUpdateCard
    srsShowResult();
    return;
  }

  S.srsBatchIdx++;
  if (S.srsBatchIdx < S.srsBatchQueue.length) {
    // More batches — show pause screen
    srsShowPause();
  } else {
    srsShowResult();
  }
}

function srsShowPause() {
  S.state = 'srs-pause';
  show('srs-pause-screen');
  S.srsPauseCursor = 0;

  const remaining = S.srsBatchQueue.length - S.srsBatchIdx;
  document.getElementById('srs-pause-info').textContent =
    `Batch ${S.srsBatchIdx} von ${S.srsBatchQueue.length} fertig — noch ${remaining} Batch${remaining > 1 ? 'es' : ''}`;

  const list = document.getElementById('srs-pause-list');
  list.innerHTML = '';
  [{ label: 'Weiter', desc: `nächste ${Math.min(10, S.srsBatchQueue[S.srsBatchIdx]?.length || 0)} Karten` },
   { label: 'Fertig für jetzt', desc: 'Fortschritt gespeichert' }
  ].forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'menu-item' + (i === S.srsPauseCursor ? ' selected' : '');
    div.innerHTML = `
      <span class="cursor-arrow" style="color:var(--green)">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${item.label}</span>
        <span class="menu-item-desc">${item.desc}</span>
      </span>`;
    list.appendChild(div);
  });
}

function srsPauseMove(dir) {
  S.srsPauseCursor = Math.max(0, Math.min(1, S.srsPauseCursor + dir));
  srsShowPause();
}

function srsPauseSelect() {
  if (S.srsPauseCursor === 0) {
    srsStartBatch();
  } else {
    srsShowResult();
  }
}

function srsShowResult() {
  S.state = 'srs-result';
  show('srs-result-screen');
  S.srsResultCursor = 0;

  document.getElementById('srs-result-up').textContent = S.srsSessionStats.up;
  document.getElementById('srs-result-down').textContent = S.srsSessionStats.down;
  document.getElementById('srs-result-burned').textContent = S.srsSessionStats.burned;

  document.getElementById('srs-result-title').textContent =
    S.srsLessonPhase === 'review' ? 'LESSON FERTIG' : 'REVIEW FERTIG';

  const list = document.getElementById('srs-result-list');
  list.innerHTML = '';
  [{ label: 'Zurück zum Dashboard' }].forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'menu-item' + (i === S.srsResultCursor ? ' selected' : '');
    div.innerHTML = `
      <span class="cursor-arrow" style="color:var(--green)">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${item.label}</span>
      </span>`;
    list.appendChild(div);
  });
}

function srsResultSelect() {
  S.srsLessonPhase = 'show';
  srsShowDashboard();
}

// ── SRS Browse (Vokabel-Übersicht) ──

function srsShowBrowse() {
  S.state = 'srs-browse';
  show('srs-browse-screen');

  const content = document.getElementById('srs-browse-content');
  content.innerHTML = '';

  if (typeof SRS_LEVELS === 'undefined') return;

  // Summary
  const counts = srsGetStageCounts();
  const totalLearned = counts.apprentice + counts.guru + counts.master + counts.enlightened + counts.burned;
  document.getElementById('srs-browse-summary').textContent =
    `${totalLearned} / ${SRS_LEVELS.flat().length} gelernt`;

  for (let lvl = 0; lvl < SRS_LEVELS.length; lvl++) {
    const keys = SRS_LEVELS[lvl];
    const stats = srsGetLevelStats(lvl);
    const locked = lvl >= S.srsData.unlockedLevel;

    // Level header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin:20px 0 8px;';
    const headerLeft = document.createElement('div');
    headerLeft.style.cssText = 'font-family:var(--display);font-size:13px;font-weight:700;';
    headerLeft.textContent = `Level ${lvl + 1}`;
    if (locked) headerLeft.style.color = 'var(--muted)';

    const headerRight = document.createElement('div');
    headerRight.style.cssText = 'font-family:var(--mono);font-size:10px;color:var(--muted);';
    headerRight.textContent = locked ? '🔒 gesperrt' : `${stats.guru}/${stats.total} Guru+ (${stats.pct}%)`;

    header.appendChild(headerLeft);
    header.appendChild(headerRight);
    content.appendChild(header);

    // Progress bar for this level
    const bar = document.createElement('div');
    bar.style.cssText = 'height:3px;background:var(--border);margin-bottom:10px;border-radius:2px;overflow:hidden;';
    const fill = document.createElement('div');
    fill.style.cssText = `height:100%;background:var(--green);width:${stats.pct}%;transition:width 0.3s;`;
    bar.appendChild(fill);
    content.appendChild(bar);

    // Vocab boxes
    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';

    for (const key of keys) {
      const card = S.srsCardMap[key];
      if (!card) continue;

      const data = S.srsData.cards[key];
      const srs = data ? data.srs : -1; // -1 = never touched
      let bgColor, textColor;

      if (locked || srs < 0) {
        bgColor = '#2a2a2a'; textColor = '#555';
      } else if (srs === 0) {
        bgColor = '#333'; textColor = '#888';
      } else if (srs <= 4) {
        bgColor = 'rgba(224,80,128,0.2)'; textColor = '#e05080';
      } else if (srs <= 6) {
        bgColor = 'rgba(155,89,182,0.2)'; textColor = '#9b59b6';
      } else if (srs === 7) {
        bgColor = 'rgba(52,152,219,0.2)'; textColor = '#3498db';
      } else if (srs === 8) {
        bgColor = 'rgba(46,204,113,0.2)'; textColor = '#2ecc71';
      } else {
        bgColor = 'rgba(149,165,166,0.15)'; textColor = '#95a5a6';
      }

      // Ticks: Apprentice 1-4 = 1-4 ticks, Guru 1-2 = 1-2 ticks
      let ticks = '';
      if (srs >= 1 && srs <= 4) {
        const filled = srs;
        const empty = 4 - srs;
        ticks = `<span style="font-size:9px;margin-left:4px;letter-spacing:-1px;opacity:0.8;">${'│'.repeat(filled)}<span style="opacity:0.3;">${'│'.repeat(empty)}</span></span>`;
      } else if (srs >= 5 && srs <= 6) {
        const filled = srs - 4;
        const empty = 2 - filled;
        ticks = `<span style="font-size:9px;margin-left:4px;letter-spacing:-1px;opacity:0.8;">${'│'.repeat(filled)}<span style="opacity:0.3;">${'│'.repeat(empty)}</span></span>`;
      }

      const box = document.createElement('div');
      box.style.cssText = `
        background:${bgColor};color:${textColor};
        padding:6px 10px;border-radius:3px;
        font-family:var(--sans);font-weight:500;
        white-space:nowrap;border:1px solid ${textColor}22;
        display:inline-flex;flex-direction:column;gap:1px;
      `;
      box.innerHTML = `
        <div style="display:flex;align-items:center;font-size:13px;"><span>${card.ru}</span>${ticks}</div>
        <div style="font-size:10px;opacity:0.6;">${card.de}</div>
      `;
      box.title = `${card.ru} — ${card.de}${data ? ' | ' + SRS_STAGES[Math.max(0,srs)].name : ''}`;
      grid.appendChild(box);
    }

    content.appendChild(grid);
  }

  // Scroll to top
  document.getElementById('srs-browse-screen').scrollTop = 0;
  window.scrollTo(0, 0);
}
// ── Inline-onclick-Handler aus index.html brauchen globalen Zugriff ────────
Object.assign(window, {
  srsReviewGewusst,
  srsReviewNochmal,
  srsLessonFlip,
  srsLessonNext,
  srsReviewFlip,
  renderSprachenGlobal: renderSprachen,
});

export {
  renderSprachen, sprachenMove, sprachenSelect,
  srsBuildCardMap, srsLoad,
  srsShowDashboard, srsDashboardMove, srsDashboardSelect,
  srsLessonFlip, srsLessonNext,
  srsReviewFlip, srsReviewGewusst, srsReviewNochmal,
  srsPauseMove, srsPauseSelect, srsResultSelect,
  srsShowForecastDetail, srsShowBrowse,
};
