// SRS Vars
let srsData = { cards: {}, unlockedLevel: 1 };
let srsAllCards = [];        // Flat array of all vocab cards from loaded data
let srsCardMap = {};         // Key "ru|de" → card object {ru, de, m}
let srsDashboardCursor = 0;
let srsReviewPool = [];      // Pool of {key, card, ruDeOk: false, deRuOk: false}
let srsReviewFailed = new Set(); // Keys that were wrong this session → no level-up on retry
let srsReviewDone = 0;       // Count of pairs completed successfully
let srsReviewTotal = 0;      // Total pairs at start of batch
let srsLessonCards = [];     // Cards being learned in current lesson
let srsLessonIdx = 0;
let srsLessonPhase = 'show'; // 'show' or 'review'
let srsBatchQueue = [];      // All due cards, split into batches
let srsBatchIdx = 0;
let srsResultCursor = 0;
let srsPauseCursor = 0;
let srsSessionStats = { up: 0, down: 0, burned: 0 };
let srsCurrentReview = null;  // {poolIdx, pair, direction}

const SRS_STAGES = [
  { name: 'Neu',         interval: 0,           color: '#666' },
  { name: 'Apprentice 1', interval: 4*3600000,   color: '#e05080' },
  { name: 'Apprentice 2', interval: 8*3600000,   color: '#e05080' },
  { name: 'Apprentice 3', interval: 24*3600000,  color: '#e05080' },
  { name: 'Apprentice 4', interval: 48*3600000,  color: '#e05080' },
  { name: 'Guru 1',       interval: 7*24*3600000, color: '#9b59b6' },
  { name: 'Guru 2',       interval: 14*24*3600000, color: '#9b59b6' },
  { name: 'Master',       interval: 30*24*3600000, color: '#3498db' },
  { name: 'Enlightened',  interval: 120*24*3600000, color: '#2ecc71' },
  { name: 'Burned',       interval: Infinity,    color: '#95a5a6' },
];

// ── SRS Image Loading ─────────────────────────────────────────────────────
const _srsImageCache = {}; // de → {url, credit, link} or null

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
  srsAllCards = [];
  srsCardMap = {};
  if (!sprachenData || !sprachenData.length) return;

  for (const sprache of sprachenData) {
    if (sprache.id !== 'russian') continue;
    for (const kap of (sprache.kapitel || [])) {
      for (const uk of (kap.unterkapitel || [])) {
        for (const einheit of (uk.einheiten || [])) {
          if (einheit.typ !== 'vokabeln' || !einheit.karten) continue;
          for (const karte of einheit.karten) {
            const key = srsCardKey(karte);
            if (!srsCardMap[key]) {
              srsCardMap[key] = karte;
              srsAllCards.push(karte);
            }
          }
        }
      }
    }
  }
}

async function srsLoad() {
  try {
    const res = await fetch('/api/srs/russian');
    srsData = await res.json();
    if (!srsData.cards) srsData.cards = {};
    if (!srsData.unlockedLevel) srsData.unlockedLevel = 1;
  } catch (e) {
    console.warn('SRS-Daten nicht geladen:', e.message);
    srsData = { cards: {}, unlockedLevel: 1 };
  }
}

async function srsSave() {
  try {
    await fetch('/api/srs/russian', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(srsData)
    });
  } catch (e) {
    console.error('SRS-Speichern fehlgeschlagen:', e.message);
  }
}

function srsGetDueCards() {
  const now = Date.now();
  const due = [];
  for (const [key, data] of Object.entries(srsData.cards)) {
    if (data.srs >= 9) continue; // Burned
    if (data.srs === 0) continue; // Not yet learned
    if (new Date(data.nextReview).getTime() <= now) {
      const card = srsCardMap[key];
      if (card) due.push({ key, card, data });
    }
  }
  return due;
}

function srsGetNewCards() {
  const newCards = [];
  if (typeof SRS_LEVELS === 'undefined') return newCards;

  for (let lvl = 0; lvl < Math.min(srsData.unlockedLevel, SRS_LEVELS.length); lvl++) {
    for (const key of SRS_LEVELS[lvl]) {
      if (!srsData.cards[key] || srsData.cards[key].srs === 0) {
        const card = srsCardMap[key];
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
    const data = srsData.cards[key];
    if (data && data.srs >= 5) guru++;
  }
  return { total: keys.length, guru, pct: keys.length ? Math.round((guru / keys.length) * 100) : 0 };
}

function srsGetStageCounts() {
  const counts = { apprentice: 0, guru: 0, master: 0, enlightened: 0, burned: 0, neu: 0 };
  for (const data of Object.values(srsData.cards)) {
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
  const currentLvl = srsData.unlockedLevel - 1;
  if (typeof SRS_LEVELS === 'undefined') return;
  if (currentLvl >= SRS_LEVELS.length - 1) return;
  const stats = srsGetLevelStats(currentLvl);
  if (stats.pct >= 80) {
    srsData.unlockedLevel = Math.min(srsData.unlockedLevel + 1, SRS_LEVELS.length);
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

    for (const data of Object.values(srsData.cards)) {
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
  state = 'srs-forecast-detail';
  show('srs-forecast-screen');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const content = document.getElementById('srs-forecast-content');
  let html = '';

  // Show 7 days, each with hourly breakdown
  for (let d = 0; d < 7; d++) {
    const dayStart = new Date(today.getTime() + d * 86400000);
    const dayLabels = ['Heute', 'Morgen'];
    const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const dayLabel = d < 2 ? dayLabels[d] : weekdays[dayStart.getDay()] + ' ' + dayStart.getDate() + '.';

    // Collect hourly data for this day
    const hours = [];
    let dayTotal = 0;
    for (let h = 0; h < 24; h++) {
      const hourStart = new Date(dayStart.getTime() + h * 3600000);
      const hourEnd = new Date(hourStart.getTime() + 3600000);
      let count = 0;
      const stages = { apprentice: 0, guru: 0, master: 0, enlightened: 0 };

      for (const data of Object.values(srsData.cards)) {
        if (data.srs >= 9 || data.srs === 0 || !data.nextReview) continue;
        const t = new Date(data.nextReview).getTime();
        const inRange = (d === 0 && h === 0)
          ? t < hourEnd.getTime()
          : t >= hourStart.getTime() && t < hourEnd.getTime();
        if (inRange) {
          count++;
          if (data.srs <= 4) stages.apprentice++;
          else if (data.srs <= 6) stages.guru++;
          else if (data.srs === 7) stages.master++;
          else stages.enlightened++;
        }
      }

      if (count > 0) {
        hours.push({ label: `${String(hourStart.getHours()).padStart(2,'0')}:00`, count, stages });
        dayTotal += count;
      }
    }

    // Day header
    html += `<div style="font-family:var(--display);font-size:14px;font-weight:900;margin-top:${d > 0 ? '16px' : '0'};padding:6px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;">
      <span>${dayLabel}</span><span style="color:${dayTotal > 0 ? 'var(--green)' : 'var(--muted)'}">${dayTotal}</span>
    </div>`;

    if (hours.length === 0) {
      html += `<div style="font-family:var(--mono);font-size:10px;color:var(--muted);padding:4px 0;">—</div>`;
    } else {
      for (const h of hours) {
        const parts = [];
        if (h.stages.apprentice) parts.push(`<span style="color:#e05080">${h.stages.apprentice}</span>`);
        if (h.stages.guru) parts.push(`<span style="color:#9b59b6">${h.stages.guru}</span>`);
        if (h.stages.master) parts.push(`<span style="color:#3498db">${h.stages.master}</span>`);
        if (h.stages.enlightened) parts.push(`<span style="color:#2ecc71">${h.stages.enlightened}</span>`);
        html += `<div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;padding:2px 8px;">
          <span style="color:var(--muted)">${h.label}</span>
          <span>${h.count} <span style="font-size:9px;margin-left:4px;">${parts.join(' ')}</span></span>
        </div>`;
      }
    }
  }

  content.innerHTML = html;
}

// ── SRS Dashboard ──

function srsShowDashboard() {
  state = 'srs-dashboard';
  show('srs-dashboard-screen');
  // Set cursor to first enabled item
  const items = srsGetDashboardItems();
  srsDashboardCursor = items.findIndex(it => it.enabled);
  if (srsDashboardCursor < 0) srsDashboardCursor = 0;
  srsRenderDashboard();
}

function srsRenderDashboard() {
  const dueCards = srsGetDueCards();
  const newCards = srsGetNewCards();
  const currentLvl = srsData.unlockedLevel;
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
    div.className = 'menu-item' + (i === srsDashboardCursor ? ' selected' : '');
    if (!item.enabled) div.style.opacity = '0.4';
    div.innerHTML = `
      <span class="cursor-arrow" style="color:var(--green)">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${item.label}</span>
        ${item.desc ? `<span class="menu-item-desc">${item.desc}</span>` : ''}
      </span>`;
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
    { label: `Review-Zeitplan`, desc: `Stündliche Übersicht`, enabled: true },
    { label: `Vokabel-Übersicht`, desc: `Alle Level & Fortschritt`, enabled: true },
    { label: '← Zurück', desc: '', enabled: true },
  ];
}

function srsDashboardMove(dir) {
  const items = srsGetDashboardItems();
  let next = srsDashboardCursor + dir;
  // Skip disabled items
  while (next >= 0 && next < items.length && !items[next].enabled) {
    next += dir;
  }
  if (next >= 0 && next < items.length) {
    srsDashboardCursor = next;
  }
  srsRenderDashboard();
}

function srsDashboardSelect() {
  if (srsDashboardCursor === 0) {
    const due = srsGetDueCards();
    if (due.length === 0) return;
    srsStartReviews(due);
  } else if (srsDashboardCursor === 1) {
    const newCards = srsGetNewCards();
    if (newCards.length === 0) return;
    srsStartLesson(newCards.slice(0, 5));
  } else if (srsDashboardCursor === 2) {
    srsShowForecastDetail();
  } else if (srsDashboardCursor === 3) {
    srsShowBrowse();
  } else {
    renderMenu();
  }
}

// ── SRS Lesson ──

function srsStartLesson(cards) {
  srsLessonCards = cards;
  srsLessonIdx = 0;
  srsLessonPhase = 'show';
  srsShowLessonCard();
}

function srsShowLessonCard() {
  state = 'srs-lesson-front';
  show('srs-lesson-screen');
  const { card } = srsLessonCards[srsLessonIdx];
  const total = srsLessonCards.length;

  document.getElementById('srs-lesson-progress').style.width = ((srsLessonIdx / total) * 100) + '%';
  document.getElementById('srs-lesson-counter').textContent = `${srsLessonIdx + 1} / ${total}`;

  // Genus bar
  const genus = getGenus(card);
  const genusColor = { m: 'var(--blue)', f: 'var(--red)', n: '#a78bfa' }[genus] || 'var(--border)';
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
  state = 'srs-lesson-back';
  const { card } = srsLessonCards[srsLessonIdx];
  const genus = getGenus(card);
  const genusColor = { m: 'var(--blue)', f: 'var(--red)', n: '#a78bfa' }[genus] || '';

  const backRu = document.getElementById('srs-lesson-back-ru');
  backRu.textContent = card.ru;
  backRu.style.color = genusColor;

  document.getElementById('srs-lesson-back-de').textContent = card.de;
  document.getElementById('srs-lesson-m').innerHTML = highlightRu(card.m || '');

  // Bild laden
  const imgEl = document.querySelector('#srs-lesson-back .srs-card-image');
  srsLoadImage(card.de, imgEl);

  document.getElementById('srs-lesson-front').style.display = 'none';
  document.getElementById('srs-lesson-back').style.display = 'block';

  speak(card.ru);
}

function srsLessonNext() {
  srsLessonIdx++;
  if (srsLessonIdx >= srsLessonCards.length) {
    // Phase 1 done, start review of these cards
    srsStartLessonReview();
  } else {
    srsShowLessonCard();
  }
}

function srsStartLessonReview() {
  srsReviewPool = srsLessonCards.map(({ key, card }) => ({ key, card, ruDeOk: false, deRuOk: false }));
  srsReviewDone = 0;
  srsReviewTotal = srsReviewPool.length;
  srsReviewFailed = new Set();
  srsSessionStats = { up: 0, down: 0, burned: 0 };
  srsLessonPhase = 'review';
  srsPickNextReviewCard();
}

// ── SRS Reviews ──

function srsStartReviews(dueCards) {
  srsSessionStats = { up: 0, down: 0, burned: 0 };
  srsReviewFailed = new Set();

  // Split into batches of 10
  const shuffledDue = shuffle(dueCards);
  srsBatchQueue = [];
  for (let i = 0; i < shuffledDue.length; i += 10) {
    srsBatchQueue.push(shuffledDue.slice(i, i + 10));
  }
  srsBatchIdx = 0;
  srsStartBatch();
}

function srsStartBatch() {
  const batch = srsBatchQueue[srsBatchIdx];
  srsReviewPool = batch.map(({ key, card }) => ({ key, card, ruDeOk: false, deRuOk: false }));
  srsReviewDone = 0;
  srsReviewTotal = srsReviewPool.length;
  srsPickNextReviewCard();
}

// Pick a random card from the pool and a direction that still needs answering
function srsPickNextReviewCard() {
  if (srsReviewPool.length === 0) {
    srsFinishBatch();
    return;
  }

  // Pick random pair from pool
  const poolIdx = Math.floor(Math.random() * srsReviewPool.length);
  const pair = srsReviewPool[poolIdx];

  // Pick a direction that hasn't been answered correctly yet
  let direction;
  if (!pair.ruDeOk && !pair.deRuOk) {
    direction = Math.random() < 0.5 ? 'ru-de' : 'de-ru';
  } else if (!pair.ruDeOk) {
    direction = 'ru-de';
  } else {
    direction = 'de-ru';
  }

  srsCurrentReview = { poolIdx, pair, direction };
  srsShowReviewCard();
}

function srsShowReviewCard() {
  const { pair, direction } = srsCurrentReview;
  state = 'srs-review-front';
  show('srs-review-screen');

  // Counter: "noch X | Y geschafft"
  const remaining = srsReviewPool.length;
  document.getElementById('srs-review-progress').style.width = ((srsReviewDone / srsReviewTotal) * 100) + '%';
  document.getElementById('srs-review-counter').textContent = `noch ${remaining} · ${srsReviewDone} ✓`;

  // Direction label
  const dirLabel = direction === 'ru-de' ? 'РУ → DE' : 'DE → РУ';
  document.getElementById('srs-review-direction').textContent = dirLabel;

  // SRS badge
  const cardData = srsData.cards[pair.key];
  const srsStage = cardData ? cardData.srs : 0;
  const badge = document.getElementById('srs-review-srs-badge');
  badge.textContent = SRS_STAGES[srsStage].name;
  badge.style.background = SRS_STAGES[srsStage].color;
  badge.style.color = '#fff';

  // Genus
  const genus = getGenus(pair.card);
  const genusColor = { m: 'var(--blue)', f: 'var(--red)', n: '#a78bfa' }[genus] || 'var(--border)';
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

  // TTS — nur Russisch vorlesen
  if (direction === 'ru-de') {
    speak(pair.card.ru);
  }
}

function srsReviewFlip() {
  state = 'srs-review-back';
  document.getElementById('srs-review-front').style.display = 'none';
  document.getElementById('srs-review-back').style.display = 'block';

  const { pair } = srsCurrentReview;
  // Bild laden
  const imgEl = document.querySelector('#srs-review-back .srs-card-image');
  srsLoadImage(pair.card.de, imgEl);

  // Always speak RU on flip
  speak(pair.card.ru);
}

function srsReviewGewusst() {
  if (state !== 'srs-review-back') return;
  state = 'srs-review-animating'; // prevent double-press
  const { pair, direction } = srsCurrentReview;

  // Mark this direction as correct
  if (direction === 'ru-de') pair.ruDeOk = true;
  else pair.deRuOk = true;

  // Both directions correct? → pair is done, remove from pool
  if (pair.ruDeOk && pair.deRuOk) {
    srsReviewPool.splice(srsReviewPool.indexOf(pair), 1);
    srsReviewDone++;

    // Only update SRS level if this card was never wrong this session
    if (!srsReviewFailed.has(pair.key)) {
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
  if (state !== 'srs-review-back') return;
  state = 'srs-review-animating';
  const { pair, direction } = srsCurrentReview;

  // Show merksatz on nochmal
  const mEl = document.getElementById('srs-review-merksatz');
  mEl.innerHTML = highlightRu(pair.card.m || '');
  mEl.style.display = 'block';

  // Mark as failed — level drops, and no level-up on retry
  if (!srsReviewFailed.has(pair.key)) {
    srsReviewFailed.add(pair.key);
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
  if (!srsData.cards[key]) {
    srsData.cards[key] = { srs: 0, nextReview: new Date().toISOString() };
  }
  const card = srsData.cards[key];
  const oldSrs = card.srs;

  if (correct) {
    card.srs = Math.min(9, card.srs + 1);
  } else {
    // New cards stay at 0, existing cards drop by 2 (min Apprentice 1)
    card.srs = oldSrs === 0 ? 0 : Math.max(1, card.srs - 2);
  }

  if (card.srs >= 9) {
    card.nextReview = null; // Burned
    srsSessionStats.burned++;
  } else {
    // Auf volle Stunde abrunden, damit alle Karten einer Stunde gleichzeitig fällig werden
    const due = new Date(Date.now() + SRS_STAGES[card.srs].interval);
    due.setMinutes(0, 0, 0);
    card.nextReview = due.toISOString();
  }

  if (card.srs > oldSrs) { srsSessionStats.up++; return 1; }
  else if (card.srs < oldSrs) { srsSessionStats.down++; return -1; }
  return 0; // no change (e.g. new card failed, stays at 0)
}

function srsShowStageOverlay(up, key) {
  const overlay = document.getElementById('srs-stage-overlay');
  const arrow = document.getElementById('srs-stage-arrow');
  const label = document.getElementById('srs-stage-label');

  const cardData = srsData.cards[key];
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
  await srsSave();
  srsCheckLevelUp();

  srsBatchIdx++;
  if (srsBatchIdx < srsBatchQueue.length) {
    // More batches — show pause screen
    srsShowPause();
  } else if (srsLessonPhase === 'review') {
    // Lesson review done — cards were already updated during review via srsUpdateCard
    await srsSave();
    srsShowResult();
  } else {
    srsShowResult();
  }
}

function srsShowPause() {
  state = 'srs-pause';
  show('srs-pause-screen');
  srsPauseCursor = 0;

  const remaining = srsBatchQueue.length - srsBatchIdx;
  document.getElementById('srs-pause-info').textContent =
    `Batch ${srsBatchIdx} von ${srsBatchQueue.length} fertig — noch ${remaining} Batch${remaining > 1 ? 'es' : ''}`;

  const list = document.getElementById('srs-pause-list');
  list.innerHTML = '';
  [{ label: 'Weiter', desc: `nächste ${Math.min(10, srsBatchQueue[srsBatchIdx]?.length || 0)} Karten` },
   { label: 'Fertig für jetzt', desc: 'Fortschritt gespeichert' }
  ].forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'menu-item' + (i === srsPauseCursor ? ' selected' : '');
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
  srsPauseCursor = Math.max(0, Math.min(1, srsPauseCursor + dir));
  srsShowPause();
}

function srsPauseSelect() {
  if (srsPauseCursor === 0) {
    srsStartBatch();
  } else {
    srsShowResult();
  }
}

function srsShowResult() {
  state = 'srs-result';
  show('srs-result-screen');
  srsResultCursor = 0;

  document.getElementById('srs-result-up').textContent = srsSessionStats.up;
  document.getElementById('srs-result-down').textContent = srsSessionStats.down;
  document.getElementById('srs-result-burned').textContent = srsSessionStats.burned;

  document.getElementById('srs-result-title').textContent =
    srsLessonPhase === 'review' ? 'LESSON FERTIG' : 'REVIEW FERTIG';

  const list = document.getElementById('srs-result-list');
  list.innerHTML = '';
  [{ label: 'Zurück zum Dashboard' }].forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'menu-item' + (i === srsResultCursor ? ' selected' : '');
    div.innerHTML = `
      <span class="cursor-arrow" style="color:var(--green)">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${item.label}</span>
      </span>`;
    list.appendChild(div);
  });
}

function srsResultSelect() {
  srsLessonPhase = 'show';
  srsShowDashboard();
}

// ── SRS Browse (Vokabel-Übersicht) ──

function srsShowBrowse() {
  state = 'srs-browse';
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
    const locked = lvl >= srsData.unlockedLevel;

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
      const card = srsCardMap[key];
      if (!card) continue;

      const data = srsData.cards[key];
      const srs = data ? data.srs : -1; // -1 = never touched
      let bgColor, textColor;

      if (locked || srs < 0) {
        bgColor = '#e8e4dd'; textColor = '#bbb';
      } else if (srs === 0) {
        bgColor = '#ddd8d0'; textColor = '#999';
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

// ── Keyboard handler ───────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  const key = e.key.toUpperCase();
  if (key !== 'A' && key !== 'B' && key !== 'C') return;
  e.preventDefault();

  if (state === 'sprachen-menu') {
    if (key === 'A') sprachenMove(-1);
    else if (key === 'C') sprachenMove(1);
    else if (key === 'B') sprachenSelect();

  } else if (state === 'menu') {
    if (key === 'A') menuMove(-1);
    else if (key === 'C') menuMove(1);
    else if (key === 'B') menuSelect();

  } else if (state === 'einheiten-menu') {
    if (key === 'A') einheitenMenuMove(-1);
    else if (key === 'C') einheitenMenuMove(1);
    else if (key === 'B') einheitenMenuSelect();

  } else if (state === 'pakete-menu') {
    if (key === 'A') paketeMove(-1);
    else if (key === 'C') paketeMove(1);
    else if (key === 'B') paketeSelect();

  } else if (state === 'richtung-wahl') {
    if (key === 'A') startKarteikartenMitRichtung('ru-de');
    else if (key === 'B') startKarteikartenMitRichtung('mc');
    else if (key === 'C') startKarteikartenMitRichtung('de-ru');

  } else if (state === 'karte-front') {
    aufdecken();

  } else if (state === 'karte-back') {
    if (key === 'A') karteGewusst();
    else if (key === 'C') karteNochmal();
    else karteGewusst(); // B = auch als gewusst

  } else if (state === 'hoeren-lauschen') {
    if (key === 'B') zeigeHoerenFrage();
    else speak(aktiveEinheit.aufgaben[hoerenIdx].audio);

  } else if (state === 'hoeren-frage') {
    if (key === 'A') selectHoerenAnswer(0);
    else if (key === 'B') selectHoerenAnswer(1);
    else if (key === 'C') selectHoerenAnswer(2);

  } else if (state === 'hoeren-beantwortet') {
    if (key === 'B') nextHoeren();

  } else if (state === 'theorie') {
    if (key === 'A') { window.scrollBy({ top: -120, behavior: 'smooth' }); }
    else if (key === 'C') { window.scrollBy({ top: 120, behavior: 'smooth' }); }
    else if (key === 'B') {
      if (theorieKarteIdx < aktiveEinheit.karten.length - 1) {
        theorieKarteIdx++;
        zeigeTheorieKarte();
      } else {
        nextEinheit();
      }
    }

  } else if (state === 'dialog-lesen') {
    if (key === 'B') zeigeDialogZeile();
    else if (key === 'A') { window.scrollBy({ top: -120, behavior: 'smooth' }); }
    else if (key === 'C') { window.scrollBy({ top: 120, behavior: 'smooth' }); }

  } else if (state === 'dialog-fertig') {
    if (key === 'B') startEinheitenQuiz(aktiveEinheit.fragen);
    else if (key === 'A') { window.scrollBy({ top: -120, behavior: 'smooth' }); }
    else if (key === 'C') { window.scrollBy({ top: 120, behavior: 'smooth' }); }

  } else if (state === 'dialog-review') {
    if (key === 'B') nextEinheit();
    else if (key === 'A') { window.scrollBy({ top: -120, behavior: 'smooth' }); }
    else if (key === 'C') { window.scrollBy({ top: 120, behavior: 'smooth' }); }

  } else if (state === 'text-review') {
    if (key === 'B') nextEinheit();
    else if (key === 'A') { window.scrollBy({ top: -120, behavior: 'smooth' }); }
    else if (key === 'C') { window.scrollBy({ top: 120, behavior: 'smooth' }); }

  } else if (state === 'text-lesen') {
    if (key === 'B') {
      if (aktiveEinheit.fragen && aktiveEinheit.fragen.length > 0) {
        startEinheitenQuiz(aktiveEinheit.fragen);
      } else {
        nextEinheit();
      }
    } else if (key === 'A') { window.scrollBy({ top: -100, behavior: 'smooth' }); }
    else if (key === 'C') { window.scrollBy({ top: 100, behavior: 'smooth' }); }

  } else if (state === 'quiz-answering') {
    if (key === 'A') selectAnswer(0);
    else if (key === 'B') selectAnswer(1);
    else if (key === 'C') selectAnswer(2);

  } else if (state === 'quiz-answered') {
    nextQuestion();

  } else if (state === 'end') {
    if (key === 'A') endMove(-1);
    else if (key === 'C') endMove(1);
    else if (key === 'B') endSelect();

  } else if (state === 'srs-dashboard') {
    if (key === 'A') srsDashboardMove(-1);
    else if (key === 'C') srsDashboardMove(1);
    else if (key === 'B') srsDashboardSelect();

  } else if (state === 'srs-lesson-front') {
    srsLessonFlip();

  } else if (state === 'srs-lesson-back') {
    srsLessonNext();

  } else if (state === 'srs-review-front') {
    srsReviewFlip();

  } else if (state === 'srs-review-back') {
    if (key === 'A') srsReviewGewusst();
    else if (key === 'C') srsReviewNochmal();
    else srsReviewGewusst(); // B = gewusst

  } else if (state === 'srs-pause') {
    if (key === 'A') srsPauseMove(-1);
    else if (key === 'C') srsPauseMove(1);
    else if (key === 'B') srsPauseSelect();

  } else if (state === 'srs-result') {
    if (key === 'B') srsResultSelect();

  } else if (state === 'srs-forecast-detail') {
    if (key === 'A') window.scrollBy({ top: -200, behavior: 'smooth' });
    else if (key === 'C') window.scrollBy({ top: 200, behavior: 'smooth' });
    else if (key === 'B') srsShowDashboard();

  } else if (state === 'srs-browse') {
    if (key === 'A') window.scrollBy({ top: -200, behavior: 'smooth' });
    else if (key === 'C') window.scrollBy({ top: 200, behavior: 'smooth' });
    else if (key === 'B') srsShowDashboard();
  }
});

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch('/api/sprachen');
    sprachenData = await res.json();
  } catch (e) {
    console.warn('Sprachen nicht geladen (Server läuft?):', e.message);
  }
  srsBuildCardMap();
  await srsLoad();
  renderSprachen();
}

init();
