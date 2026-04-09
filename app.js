// ── State ──────────────────────────────────────────────────────────────────
// state: 'sprachen-menu' | 'menu' | 'richtung-wahl' | 'karte-front' | 'karte-back' |
//        'hoeren-lauschen' | 'hoeren-frage' | 'hoeren-beantwortet' |
//        'theorie' | 'dialog-lesen' | 'dialog-fertig' | 'text-lesen' |
//        'quiz-answering' | 'quiz-answered' | 'end'
let state = 'sprachen-menu';
let menuCursor = 0;
let endCursor = 0;

// Mehrsprachen-Modus Vars
let sprachenData = [];
let aktiveSprache = null;      // {id, sprache, icon, kapitel[]}
let sprachenCursor = 0;
let hierarchiePfad = [];       // Stack für Zurück-Navigation
let aktiveKapitelEbene = null; // Current level in hierarchy
let cursorStack = [];          // Speichert menuCursor für jeden Level
let einheitenCursorStack = []; // Speichert einheitenCursor für jeden Unterkapitel

// Kapitel-Modus Vars
let aktivesKapitel = null;
let einheitIdx = 0;
let einheitenModus = false;
let aktiveEinheit = null;
let einheitenCursor = 0;
let isKapiteltest = false;
let kapiteltestConfig = null;
let kapiteltestPhase = null; // 'vokabeln' | 'grammatik' | 'dialog-text' | 'hoeren' | 'result'
let kapiteltestUnitsQueue = [];
let kapiteltestPhaseResults = {};
let _kapiteltestScoreKey = null;

// Karteikarten Vars
let karteiStapel = [];
let nochmalStapel = [];
let karteiGewusst = 0;
let karteiPaketGroesse = 0;
let aktiveKarte = null;
let aktiveRichtung = 'ru-de';  // 'ru-de' | 'de-ru' | 'mc'
let karteRichtung = 'ru-de';

// Pakete Vars
let paketeCursor = 0;
let aktivesPaket = [];  // aktuelle 5er-Auswahl (leer = alle)

// Theorie Vars
let theorieKarteIdx = 0;

// Hören Vars
let hoerenIdx = 0;
let hoerenAnswered = false;

// Dialog Vars
let dialogZeileIdx = 0;

// Quiz Vars
let shuffled = [];
let current = 0;
let answered = false;
let scores = {};
let totals = {};

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

// ── Sprachen Menu ──────────────────────────────────────────────────────────
function renderSprachen() {
  state = 'sprachen-menu';
  show('sprachen-screen');
  const list = document.getElementById('sprachen-list');
  list.innerHTML = '';
  menuCursor = 0;

  sprachenData.forEach((sprache, i) => {
    const div = document.createElement('div');
    div.className = 'menu-item' + (i === sprachenCursor ? ' selected' : '');
    div.innerHTML = `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${sprache.icon} ${sprache.sprache}</span>
        <span class="menu-item-desc">${sprache.kapitel?.length || 0} Kapitel</span>
      </span>`;
    list.appendChild(div);
  });
}

function sprachenMove(dir) {
  sprachenCursor = (sprachenCursor + dir + sprachenData.length) % sprachenData.length;
  renderSprachen();
}

function sprachenSelect() {
  aktiveSprache = sprachenData[sprachenCursor];
  hierarchiePfad = [];
  aktiveKapitelEbene = aktiveSprache;
  menuCursor = 0;
  renderMenu();
}

// ── Menu ───────────────────────────────────────────────────────────────────
function getMenuItems() {
  const items = [];

  if (!aktiveKapitelEbene) return items;

  // Add back button at top if we can go back
  if (hierarchiePfad.length > 0) {
    const parent = hierarchiePfad[hierarchiePfad.length - 1];
    items.push({
      id: '__back__',
      name: '← ' + (parent.name || parent.sprache || 'Zurück'),
      beschreibung: '',
      schwierigkeit: null,
      isKapitel: false,
      isBack: true,
      kapitel: null,
      itemCount: 0
    });
  } else if (aktiveSprache) {
    // At kapitel level, can go back to sprachen
    items.push({
      id: '__back__',
      name: '← Sprachen',
      beschreibung: '',
      schwierigkeit: null,
      isKapitel: false,
      isBack: true,
      kapitel: null,
      itemCount: 0
    });
  }

  // SRS entry at top level (right after back button)
  if (hierarchiePfad.length === 0 && aktiveSprache && aktiveSprache.id === 'russian') {
    const due = srsGetDueCards().length;
    const dueText = due > 0 ? `${due} Reviews fällig` : 'Keine Reviews fällig';
    items.push({
      id: '__srs__',
      name: 'SRS Vokabeltrainer',
      beschreibung: dueText + ' · Level ' + srsData.unlockedLevel,
      schwierigkeit: null,
      isKapitel: false,
      isSrs: true,
      kapitel: null,
      itemCount: 0
    });
  }

  const itemsToShow = aktiveKapitelEbene.kapitel || aktiveKapitelEbene.unterkapitel || [];

  itemsToShow.forEach(item => {
    const isFolder = !!(item.kapitel || item.unterkapitel);

    let itemCount = 0;
    if (item.einheiten) {
      itemCount = item.einheiten.reduce((n, e) =>
        n + (e.karten ? e.karten.length : e.fragen ? e.fragen.length : 1), 0);
    } else if (item.unterkapitel) {
      itemCount = item.unterkapitel.reduce((n, uk) =>
        n + (uk.einheiten?.reduce((s, e) =>
          s + (e.karten ? e.karten.length : e.fragen ? e.fragen.length : 1), 0) || 0), 0);
    }

    items.push({
      id: item.id,
      name: item.name,
      beschreibung: item.beschreibung || '',
      schwierigkeit: isFolder ? null : 1,
      isKapitel: isFolder,
      kapitel: item,
      itemCount: itemCount
    });
  });

  return items;
}

function renderMenu() {
  state = 'menu';
  show('menu-screen');
  const items = getMenuItems();
  const list = document.getElementById('menu-list');
  list.innerHTML = '';

  // Update header badge and title
  if (aktiveSprache) {
    document.getElementById('menu-sprache-badge').textContent = aktiveSprache.icon || '🌍';
    document.getElementById('menu-sprache-name').textContent = aktiveSprache.sprache || 'Sprache';
  }

  // Update breadcrumb — Icon + Sprache + Unterordner + aktuelle Ebene
  const breadcrumbWrapper = document.getElementById('breadcrumb-wrapper');
  const breadcrumbText = document.getElementById('breadcrumb-text');

  if (aktiveSprache) {
    breadcrumbWrapper.style.display = 'block';
    const path = [(aktiveSprache?.icon || '🌍') + ' ' + (aktiveSprache?.sprache || 'Sprache')];
    for (let i = 0; i < hierarchiePfad.length; i++) {
      const item = hierarchiePfad[i];
      if (item.id === aktiveSprache?.id) continue;
      path.push(item.name || item.sprache || '');
    }
    // Add current level (aktiveKapitelEbene)
    if (aktiveKapitelEbene && aktiveKapitelEbene.id !== aktiveSprache?.id) {
      path.push(aktiveKapitelEbene.name || '');
    }
    breadcrumbText.textContent = path.join(' > ');
  } else {
    breadcrumbWrapper.style.display = 'none';
  }

  items.forEach((item, i) => {
    const div = document.createElement('div');
    const isBackButton = item.isBack;
    div.className = 'menu-item' + (i === menuCursor ? ' selected' : '') + (item.isKapitel ? ' kapitel-item' : '') + (isBackButton ? ' back-item' : '');
    if (item.isSrs) {
      div.style.borderColor = i === menuCursor ? 'var(--green)' : 'var(--green-dim)';
      if (i === menuCursor) div.style.background = 'rgba(46,204,113,0.06)';
    }

    let diffHtml = '';
    if (item.schwierigkeit !== null && item.schwierigkeit !== undefined) {
      const filled = '★'.repeat(item.schwierigkeit);
      const empty = '☆'.repeat(3 - item.schwierigkeit);
      diffHtml = `<span class="diff-stars">${filled}<span class="dim">${empty}</span></span>`;
    }

    const countLabel = item.itemCount > 0 ? `${item.itemCount} Items` : '';

    div.innerHTML = `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${item.name}</span>
        <span class="menu-item-desc">${item.beschreibung || ''}</span>
      </span>
      <span class="menu-item-meta">
        ${diffHtml}
        <span class="q-count">${countLabel}</span>
      </span>`;
    list.appendChild(div);
  });
}

function menuMove(dir) {
  const items = getMenuItems();
  menuCursor = (menuCursor + dir + items.length) % items.length;
  renderMenu();
  document.querySelector('#menu-list .selected')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function menuSelect() {
  const items = getMenuItems();
  const chosen = items[menuCursor];
  if (!chosen) return;

  // Handle back button
  if (chosen.isBack) {
    zurueckZumMenu();
    return;
  }

  // Handle SRS entry
  if (chosen.isSrs) {
    srsShowDashboard();
    return;
  }

  // If item has children (folder), navigate deeper
  if (chosen.isKapitel && (chosen.kapitel.kapitel || chosen.kapitel.unterkapitel)) {
    // Speichere aktuellen Cursor bevor wir runter navigieren
    cursorStack.push(menuCursor);
    hierarchiePfad.push(aktiveKapitelEbene);
    aktiveKapitelEbene = chosen.kapitel;
    menuCursor = 0;
    renderMenu();
  } else if (chosen.kapitel.einheiten) {
    // Item has einheiten, start learning
    startKapitel(chosen.kapitel);
  }
}

// ── Navigation ─────────────────────────────────────────────────────────────
function zurueckZumMenu() {
  if (hierarchiePfad.length > 0) {
    // Go back one level in hierarchy
    aktiveKapitelEbene = hierarchiePfad.pop();
    // Restore saved cursor for this level
    menuCursor = cursorStack.pop() || 0;
    renderMenu();
  } else if (aktiveSprache) {
    // Back from kapitel level to sprachen selection
    sprachenCursor = sprachenData.findIndex(s => s.id === aktiveSprache.id);
    aktiveSprache = null;
    aktiveKapitelEbene = null;
    menuCursor = 0;
    cursorStack = [];
    einheitenCursorStack = [];
    renderSprachen();
  }
}

function zurueckZuEinheiten() {
  showEinheitenMenu();
}

// ── Kapitel-Modus ──────────────────────────────────────────────────────────
function startKapitel(kapitel) {
  aktivesKapitel = kapitel;
  einheitenModus = false;
  // Speichere aktuellen menuCursor bevor wir in Einheiten gehen
  cursorStack.push(menuCursor);
  showEinheitenMenu();
}

function showEinheitenMenu() {
  state = 'einheiten-menu';
  show('einheiten-screen');
  document.getElementById('einheiten-kapitel-name').textContent = aktivesKapitel.name;

  // Update breadcrumb for einheiten — Icon + Sprache + Unterordner + Kapitel + Unterkapitel
  const breadcrumbWrapper = document.getElementById('einheiten-breadcrumb-wrapper');
  const breadcrumbText = document.getElementById('einheiten-breadcrumb-text');
  breadcrumbWrapper.style.display = 'block';

  const path = [(aktiveSprache?.icon || '🌍') + ' ' + (aktiveSprache?.sprache || 'Sprache')];
  for (let i = 0; i < hierarchiePfad.length; i++) {
    const item = hierarchiePfad[i];
    if (item.id === aktiveSprache?.id) continue;
    path.push(item.name || item.sprache || '');
  }
  // Add aktuelles Kapitel (z.B. A1)
  if (aktiveKapitelEbene && aktiveKapitelEbene.id !== aktiveSprache?.id) {
    path.push(aktiveKapitelEbene.name || '');
  }
  // Add aktuelles Unterkapitel (z.B. A1.1)
  path.push(aktivesKapitel?.name || '');
  breadcrumbText.textContent = path.join(' > ');

  const list = document.getElementById('einheiten-list');
  list.innerHTML = '';

  // Zurück-Eintrag (Cursor -1) — automatisch zum parent Unterkapitel
  const backDiv = document.createElement('div');
  backDiv.className = 'menu-item' + (einheitenCursor === -1 ? ' selected' : '');
  backDiv.innerHTML = `
    <span class="cursor-arrow">›</span>
    <span class="menu-item-body">
      <span class="menu-item-name">← ${aktivesKapitel.name}</span>
    </span>`;
  list.appendChild(backDiv);

  const TYP_LABELS = {
    vokabeln:    'Vokabeln',
    grammatik:   'Grammatik',
    theorie:     'Theorie',
    hoeren:      'Hören',
    dialog:      'Dialog',
    text:        'Text',
    kapiteltest: 'TEST',
  };

  aktivesKapitel.einheiten.forEach((einheit, i) => {
    const itemCount = einheit.karten
      ? `${einheit.karten.length} Karten`
      : einheit.fragen
        ? `${einheit.fragen.length} Fragen`
        : einheit.zeilen
          ? `${einheit.zeilen.length} Zeilen`
          : '';

    const div = document.createElement('div');
    div.className = 'menu-item kapitel-item' + (i === einheitenCursor ? ' selected' : '');
    div.innerHTML = `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${einheit.titel}</span>
        <span class="menu-item-desc">${TYP_LABELS[einheit.typ] || einheit.typ}</span>
      </span>
      <span class="menu-item-meta">
        <span class="q-count">${itemCount}</span>
      </span>`;
    list.appendChild(div);
  });

  // Cursor immer sichtbar machen (auch beim Zurückkehren)
  setTimeout(() =>
    document.querySelector('#einheiten-list .selected')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  , 0);
}

function einheitenMenuMove(dir) {
  const n = aktivesKapitel.einheiten.length;
  // Cursor reicht von -1 (Zurück) bis n-1
  einheitenCursor = Math.max(-1, Math.min(n - 1, einheitenCursor + dir));
  showEinheitenMenu();
  document.querySelector('#einheiten-list .selected')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function einheitenMenuSelect() {
  if (einheitenCursor === -1) { zurueckVonEinheiten(); return; }
  einheitIdx = einheitenCursor;
  einheitenModus = true;
  startEinheit(einheitIdx);
}

function zurueckVonEinheiten() {
  // Zurück zur Unterkapitel-Auswahl (menu-screen) — OHNE hierarchiePfad zu ändern!
  state = 'menu';
  show('menu-screen');
  // Restore saved cursor für diesen Unterkapitel-Level
  menuCursor = cursorStack.pop() || 0;
  renderMenu();
}

function startEinheit(idx) {
  einheitIdx = idx;
  aktiveEinheit = aktivesKapitel.einheiten[idx];

  switch (aktiveEinheit.typ) {
    case 'vokabeln':    startKarteikarten(aktiveEinheit); break;
    case 'grammatik':   startKarteikarten(aktiveEinheit); break;
    case 'theorie':     startTheorieScreen(aktiveEinheit); break;
    case 'hoeren':      startHoerenScreen(aktiveEinheit); break;
    case 'dialog':      startDialogScreen(aktiveEinheit); break;
    case 'text':        startTextScreen(aktiveEinheit); break;
    case 'kapiteltest': startKapiteltest(aktiveEinheit); break;
    default: zurueckZuEinheiten();
  }
}

// ── Dialog-Review (nach Dialog-Fragen) ──────────────────────────────────────
function showDialogReview() {
  state = 'dialog-review';
  show('dialog-review-screen');

  document.getElementById('dialog-review-titel').textContent = aktiveEinheit.titel;

  const container = document.getElementById('dialog-review-zeilen');
  container.innerHTML = '';

  aktiveEinheit.zeilen.forEach(zeile => {
    const div = document.createElement('div');
    div.className = 'dialog-zeile';
    // Format: Sprecher: RUSSISCH (Deutsch)
    const text = zeile.de ? `${zeile.text} (${zeile.de})` : zeile.text;
    div.innerHTML = `<span class="dialog-sprecher">${zeile.sprecher}</span><span class="dialog-text">${text}</span>`;
    container.appendChild(div);
  });
}

// ── Text-Review (nach Text-Fragen) ──────────────────────────────────────────
function showTextReview() {
  state = 'text-review';
  show('text-review-screen');

  document.getElementById('text-review-titel').textContent = aktiveEinheit.titel;

  const container = document.getElementById('text-review-absaetze');
  container.innerHTML = '';

  if (aktiveEinheit.absaetze && aktiveEinheit.absaetze.length > 0) {
    // Mit Absätze (ru + de untereinander)
    aktiveEinheit.absaetze.forEach(abs => {
      const div = document.createElement('div');
      div.style.cssText = 'padding: 20px; border-left: 3px solid var(--blue); background: var(--surface);';
      div.innerHTML = `
        <div style="font-size: 16px; line-height: 1.6; margin-bottom: 12px; color: var(--text);">${abs.ru}</div>
        <div style="font-size: 14px; line-height: 1.6; color: var(--muted); font-style: italic;">${abs.de}</div>
      `;
      container.appendChild(div);
    });
  } else {
    // Fallback: einfach den Text anzeigen
    const div = document.createElement('div');
    div.style.cssText = 'padding: 20px; border-left: 3px solid var(--blue); background: var(--surface);';
    div.innerHTML = `<div style="font-size: 16px; line-height: 1.6; color: var(--text);">${aktiveEinheit.inhalt}</div>`;
    container.appendChild(div);
  }
}

function nextEinheit() {
  // Kapiteltest: nach Dialog/Text/Hoeren-Quiz: speichert Scores mit _kapiteltestScoreKey
  // und geht zu startKapiteltestUnit() (nächste Einheit oder Phase).
  // Normale Einheiten: geht zurück zu Menü.
  if (isKapiteltest && aktiveEinheit && aktiveEinheit._kapiteltestCategory) {
    // Speichere Scores aus dieser Einheit
    const category = aktiveEinheit._kapiteltestCategory;
    const scoreKey = _kapiteltestScoreKey || aktiveEinheit.titel;
    kapiteltestPhaseResults[category].correct += (scores[scoreKey] || 0);
    kapiteltestPhaseResults[category].total += (totals[scoreKey] || 0);
    _kapiteltestScoreKey = null; // Reset für nächste Einheit
    // Gehe zur nächsten Einheit
    startKapiteltestUnit();
  } else {
    // Nach jeder Einheit: zurück zum Einheiten-Menü, nicht auto-weiter
    einheitenModus = false;
    einheitenCursor = einheitIdx;
    showEinheitenMenu();
  }
}

// ── Pakete ─────────────────────────────────────────────────────────────────
function startKarteikarten(einheit) {
  paketeCursor = 0;
  aktivesPaket = [];
  showPaketeScreen();
}

function getPakete() {
  const pool = aktiveEinheit.typ === 'grammatik' ? aktiveEinheit.fragen : aktiveEinheit.karten;
  const pakete = [];
  for (let i = 0; i < pool.length; i += 5) {
    pakete.push(pool.slice(i, i + 5));
  }
  return pakete;
}

function showPaketeScreen() {
  state = 'pakete-menu';
  show('pakete-screen');
  document.getElementById('pakete-einheit-name').textContent = aktiveEinheit.titel;
  renderPaketeList();
}

function renderPaketeList() {
  // Update breadcrumb for pakete — Icon + Sprache + alles
  const breadcrumbWrapper = document.getElementById('pakete-breadcrumb-wrapper');
  const breadcrumbText = document.getElementById('pakete-breadcrumb-text');
  breadcrumbWrapper.style.display = 'block';

  const path = [(aktiveSprache?.icon || '🌍') + ' ' + (aktiveSprache?.sprache || 'Sprache')];
  for (let i = 0; i < hierarchiePfad.length; i++) {
    const item = hierarchiePfad[i];
    if (item.id === aktiveSprache?.id) continue;
    path.push(item.name || item.sprache || '');
  }
  // Add aktuelles Kapitel (z.B. A1)
  if (aktiveKapitelEbene && aktiveKapitelEbene.id !== aktiveSprache?.id) {
    path.push(aktiveKapitelEbene.name || '');
  }
  // Add aktuelles Unterkapitel (z.B. A1.1)
  path.push(aktivesKapitel?.name || '');
  // Add aktuelle Einheit (z.B. Vokabeln)
  path.push(aktiveEinheit?.titel || '');
  breadcrumbText.textContent = path.join(' > ');

  const pakete = getPakete();
  const list = document.getElementById('pakete-list');
  list.innerHTML = '';

  // Zurück-Eintrag (Cursor -1) — automatisch zum parent Unterkapitel
  const backDiv = document.createElement('div');
  backDiv.className = 'menu-item' + (paketeCursor === -1 ? ' selected' : '');
  backDiv.innerHTML = `
    <span class="cursor-arrow">›</span>
    <span class="menu-item-body">
      <span class="menu-item-name">← ${aktivesKapitel.name}</span>
    </span>`;
  list.appendChild(backDiv);

  pakete.forEach((p, i) => {
    const von = i * 5 + 1;
    const bis = von + p.length - 1;
    const div = document.createElement('div');
    div.className = 'menu-item kapitel-item' + (i === paketeCursor ? ' selected' : '');
    div.innerHTML = `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">Paket ${i + 1}</span>
        <span class="menu-item-desc">${aktiveEinheit.typ === 'grammatik' ? 'Fragen' : 'Karten'} ${von}–${bis}</span>
      </span>
      <span class="menu-item-meta"><span class="q-count">${p.length} ${aktiveEinheit.typ === 'grammatik' ? 'Fragen' : 'Karten'}</span></span>`;
    list.appendChild(div);
  });

  // Alle-Option
  const alleIdx = pakete.length;
  const alleDiv = document.createElement('div');
  alleDiv.className = 'menu-item kapitel-item' + (alleIdx === paketeCursor ? ' selected' : '');
  alleDiv.innerHTML = `
    <span class="cursor-arrow">›</span>
    <span class="menu-item-body">
      <span class="menu-item-name">${aktiveEinheit.typ === 'grammatik' ? 'Alle Fragen' : 'Alle Karten'}</span>
      <span class="menu-item-desc">gesamter Stapel</span>
    </span>
    <span class="menu-item-meta"><span class="q-count">${(aktiveEinheit.typ === 'grammatik' ? aktiveEinheit.fragen : aktiveEinheit.karten).length} ${aktiveEinheit.typ === 'grammatik' ? 'Fragen' : 'Karten'}</span></span>`;
  list.appendChild(alleDiv);
}

function paketeMove(dir) {
  const n = getPakete().length + 1; // +1 für Alle
  paketeCursor = Math.max(-1, Math.min(n - 1, paketeCursor + dir));
  renderPaketeList();
  document.querySelector('#pakete-list .selected')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function paketeSelect() {
  if (paketeCursor === -1) { zurueckZuEinheiten(); return; }
  const pakete = getPakete();
  if (paketeCursor < pakete.length) {
    aktivesPaket = pakete[paketeCursor];
  } else {
    aktivesPaket = aktiveEinheit.typ === 'grammatik' ? aktiveEinheit.fragen : aktiveEinheit.karten;
  }
  if (aktiveEinheit.typ === 'grammatik') {
    startEinheitenQuiz(aktivesPaket);
  } else {
    state = 'richtung-wahl';
    show('richtung-screen');
    // Update back button label to show current Unterkapitel
    document.getElementById('richtung-back-btn').textContent = '← ' + aktivesKapitel.name;
  }
}

function startKarteikartenMitRichtung(richtung) {
  aktiveRichtung = richtung;
  const pool = aktivesPaket.length > 0 ? aktivesPaket : aktiveEinheit.karten;

  if (richtung === 'mc') {
    startMCModus(pool);
    return;
  }

  karteiStapel = shuffle([...pool]);
  nochmalStapel = [];
  karteiGewusst = 0;
  karteiPaketGroesse = pool.length;
  zeigeKarte();
}

function startMCModus(pool) {
  const alleKarten = aktiveEinheit.karten;
  shuffled = shuffle([...pool]).map(karte => {
    const falsche = shuffle(alleKarten.filter(k => k.ru !== karte.ru)).slice(0, 2);
    const optionen = shuffle([karte.de, falsche[0].de, falsche[1].de]);
    return {
      q: karte.ru,
      a: optionen,
      c: optionen.indexOf(karte.de),
      m: karte.m,
      _quizName: aktiveEinheit.titel,
      _karte: karte
    };
  });
  current = 0;
  answered = false;
  scores = { [aktiveEinheit.titel]: 0 };
  totals = { [aktiveEinheit.titel]: shuffled.length };
  einheitenModus = true;
  show('quiz-screen');
  renderQuestion();
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

function zeigeKarte() {
  // Wenn Stapel leer: Nochmal-Stapel nachladen oder fertig
  if (karteiStapel.length === 0) {
    if (nochmalStapel.length === 0) {
      nextEinheit();
      return;
    }
    karteiStapel = [...nochmalStapel];
    nochmalStapel = [];
  }

  aktiveKarte = karteiStapel.shift();
  state = 'karte-front';

  // Richtung für diese Karte bestimmen
  karteRichtung = aktiveRichtung === 'gemischt'
    ? (Math.random() < 0.5 ? 'ru-de' : 'de-ru')
    : aktiveRichtung;

  const total = karteiPaketGroesse || aktiveEinheit.karten.length;
  const verbleibend = karteiStapel.length + nochmalStapel.length + 1;
  const done = total - verbleibend;

  document.getElementById('karte-progress').style.width = Math.max(0, (done / total) * 100) + '%';
  document.getElementById('karte-kapitel').textContent = aktivesKapitel.name;
  document.getElementById('karte-counter').textContent = `${karteiGewusst} / ${total} ✓`;

  // Vorderseite: je nach Richtung RU oder DE
  const frontText = karteRichtung === 'ru-de' ? aktiveKarte.ru : aktiveKarte.de;
  const frontLang = karteRichtung === 'ru-de' ? 'RU → DE' : 'DE → RU';
  // Genus-Farbe — Bar + Badge + Textfarbe
  const genus = getGenus(aktiveKarte);
  const genusColor = { m: 'var(--blue)', f: 'var(--red)', n: '#a78bfa' }[genus] || 'var(--border)';
  const genusLabel = { m: 'м. — männlich', f: 'ж. — weiblich', n: 'с. — sächlich' }[genus];
  const bar = document.getElementById('karte-genus-bar');
  bar.style.background = genus ? genusColor : 'var(--border)';
  bar.style.opacity = genus ? '1' : '0.3';
  const badge = document.getElementById('karte-genus-badge');
  if (genus && karteRichtung === 'ru-de') {
    badge.textContent = genusLabel;
    badge.style.color = genusColor;
    badge.style.borderColor = genusColor;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
  const genusClass = genus ? `genus-${genus}` : '';
  const ruColor = genus ? genusColor : '';
  const frontEl = document.getElementById('karte-front-wort');
  frontEl.textContent = frontText;
  frontEl.className = 'karte-wort';
  frontEl.style.color = karteRichtung === 'ru-de' ? ruColor : '';

  document.getElementById('karte-front-richtung').textContent = frontLang;

  // Rückseite vorbereiten
  const backObenEl = document.getElementById('karte-back-oben');
  backObenEl.textContent = frontText;
  backObenEl.className = 'karte-wort karte-back-klein';
  backObenEl.style.color = karteRichtung === 'ru-de' ? ruColor : '';

  const backUntenEl = document.getElementById('karte-back-unten');
  backUntenEl.textContent = karteRichtung === 'ru-de' ? aktiveKarte.de : aktiveKarte.ru;
  backUntenEl.className = 'karte-de';
  backUntenEl.style.color = karteRichtung === 'de-ru' ? ruColor : '';

  // Merksatz mit Wortfamilien-Highlight
  const mEl = document.getElementById('karte-m');
  mEl.innerHTML = highlightRu(aktiveKarte.m || '');

  document.getElementById('karte-front-side').style.display = 'block';
  document.getElementById('karte-back-side').style.display = 'none';

  show('karteikarten-screen');
  if (karteRichtung === 'ru-de') speak(aktiveKarte.ru);
}

function aufdecken() {
  if (state !== 'karte-front') return;
  state = 'karte-back';
  document.getElementById('karte-front-side').style.display = 'none';
  document.getElementById('karte-back-side').style.display = 'block';
  // Bei RU→DE: beim Aufdecken RU nochmal sprechen; bei DE→RU: RU sprechen (das ist die Lösung)
  speak(aktiveKarte.ru);
}

function karteGewusst() {
  if (state !== 'karte-back') return;
  karteiGewusst++;
  zeigeKarte();
}

function karteNochmal() {
  if (state !== 'karte-back') return;
  nochmalStapel.push(aktiveKarte);
  zeigeKarte();
}

// ── Hören ─────────────────────────────────────────────────────────────────
function startHoerenScreen(einheit) {
  hoerenIdx = 0;
  document.getElementById('hoeren-kapitel').textContent = aktivesKapitel.name;
  show('hoeren-screen');
  zeigeHoerenLauschen();
}

function zeigeHoerenLauschen() {
  hoerenAnswered = false;
  state = 'hoeren-lauschen';
  const aufgaben = aktiveEinheit.aufgaben;
  const aufgabe = aufgaben[hoerenIdx];
  const total = aufgaben.length;

  document.getElementById('hoeren-progress').style.width = ((hoerenIdx / total) * 100) + '%';
  document.getElementById('hoeren-counter').textContent = `${hoerenIdx + 1} / ${total}`;
  document.getElementById('hoeren-aufgabe-nr').textContent = `Aufgabe ${hoerenIdx + 1} von ${total}`;

  document.getElementById('hoeren-lauschen-phase').style.display = 'block';
  document.getElementById('hoeren-frage-phase').style.display = 'none';
  document.getElementById('hoeren-welle').classList.add('playing');

  speak(aufgabe.audio);
}

function zeigeHoerenFrage() {
  state = 'hoeren-frage';
  const aufgabe = aktiveEinheit.aufgaben[hoerenIdx];

  document.getElementById('hoeren-lauschen-phase').style.display = 'none';
  document.getElementById('hoeren-frage-phase').style.display = 'block';
  document.getElementById('hoeren-merksatz-box').classList.remove('show');
  document.getElementById('hoeren-result-row').classList.remove('show');

  const container = document.getElementById('hoeren-answers');
  container.innerHTML = '';
  ['A', 'B', 'C'].forEach((key, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.disabled = false;
    btn.innerHTML = `<span class="key-badge">${key}</span><span>${aufgabe.a[i]}</span>`;
    btn.onclick = () => selectHoerenAnswer(i);
    container.appendChild(btn);
  });
}

function selectHoerenAnswer(idx) {
  if (hoerenAnswered) return;
  hoerenAnswered = true;
  state = 'hoeren-beantwortet';
  const aufgabe = aktiveEinheit.aufgaben[hoerenIdx];
  const btns = document.querySelectorAll('#hoeren-answers .answer-btn');

  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === aufgabe.c) btn.classList.add('correct');
    else if (i === idx && idx !== aufgabe.c) btn.classList.add('wrong');
    else btn.classList.add('dim');
  });

  const correct = idx === aufgabe.c;
  const verdict = document.getElementById('hoeren-result-verdict');
  verdict.textContent = correct ? '✓ Richtig!' : '✗ Falsch';
  verdict.className = 'result-verdict ' + (correct ? 'ok' : 'fail');
  document.getElementById('hoeren-result-row').classList.add('show');

  if (aufgabe.m) {
    document.getElementById('hoeren-merksatz').textContent = aufgabe.m;
    document.getElementById('hoeren-merksatz-box').classList.add('show');
  }

  // Korrekte Antwort nochmal sprechen
  setTimeout(() => speak(aufgabe.audio), 400);
}

function nextHoeren() {
  hoerenIdx++;
  if (hoerenIdx >= aktiveEinheit.aufgaben.length) {
    nextEinheit();
  } else {
    zeigeHoerenLauschen();
  }
}

// ── Theorie ───────────────────────────────────────────────────────────────
function startTheorieScreen(einheit) {
  theorieKarteIdx = 0;
  state = 'theorie';
  document.getElementById('theorie-kapitel').textContent = aktivesKapitel.name;
  show('theorie-screen');
  zeigeTheorieKarte();
}

function zeigeTheorieKarte() {
  const karten = aktiveEinheit.karten;
  const karte = karten[theorieKarteIdx];
  const total = karten.length;

  document.getElementById('theorie-progress').style.width = ((theorieKarteIdx + 1) / total * 100) + '%';
  document.getElementById('theorie-counter').textContent = `${theorieKarteIdx + 1} / ${total}`;
  document.getElementById('theorie-titel').textContent = karte.titel;
  document.getElementById('theorie-erklaerung').textContent = karte.erklaerung;

  // Tabelle
  const tbl = document.getElementById('theorie-tabelle');
  if (karte.tabelle && karte.tabelle.length > 0) {
    const [kopf, ...zeilen] = karte.tabelle;
    tbl.innerHTML = `<thead><tr>${kopf.map(h => `<th>${h}</th>`).join('')}</tr></thead>`
      + `<tbody>${zeilen.map(z => `<tr>${z.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
    tbl.style.display = 'table';
  } else {
    tbl.style.display = 'none';
  }

  // Beispiele
  const bsp = document.getElementById('theorie-beispiele');
  if (karte.beispiele && karte.beispiele.length > 0) {
    bsp.innerHTML = karte.beispiele.map(b => `<div class="theorie-beispiel">${b}</div>`).join('');
    bsp.style.display = 'flex';
  } else {
    bsp.style.display = 'none';
  }

  // Merksatz
  const mBox = document.getElementById('theorie-merksatz-box');
  if (karte.m) {
    document.getElementById('theorie-merksatz').textContent = karte.m;
    mBox.style.display = 'block';
    mBox.classList.add('show');
  } else {
    mBox.style.display = 'none';
    mBox.classList.remove('show');
  }

  // B-Hint: letzte Karte → "Einheit beenden"
  document.getElementById('theorie-hint-b').innerHTML =
    theorieKarteIdx === total - 1
      ? `<kbd>B</kbd> Einheit beenden`
      : `<kbd>B</kbd> nächste Karte (${theorieKarteIdx + 1}/${total})`;

  // Seite nach oben scrollen
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Dialog ────────────────────────────────────────────────────────────────
function startDialogScreen(einheit) {
  dialogZeileIdx = 0;
  state = 'dialog-lesen';

  document.getElementById('dialog-kapitel').textContent = aktivesKapitel.name;
  document.getElementById('dialog-titel').textContent = einheit.titel;
  document.getElementById('dialog-counter').textContent = `0 / ${einheit.zeilen.length}`;
  document.getElementById('dialog-progress').style.width = '0%';
  document.getElementById('dialog-zeilen').innerHTML = '';
  document.getElementById('dialog-hint').innerHTML = `<kbd>B</kbd> nächste Zeile &nbsp;·&nbsp; <kbd>A</kbd>/<kbd>C</kbd> scrollen`;

  show('dialog-screen');
  zeigeDialogZeile();
}

function zeigeDialogZeile() {
  const zeilen = aktiveEinheit.zeilen;

  if (dialogZeileIdx >= zeilen.length) {
    // Dialog fertig
    document.getElementById('dialog-hint').innerHTML = `<kbd>B</kbd> zu den Fragen &nbsp;·&nbsp; <kbd>A</kbd>/<kbd>C</kbd> scrollen`;
    if (aktiveEinheit.fragen && aktiveEinheit.fragen.length > 0) {
      state = 'dialog-fertig';
    } else {
      nextEinheit();
    }
    return;
  }

  const zeile = zeilen[dialogZeileIdx];
  document.getElementById('dialog-progress').style.width =
    ((dialogZeileIdx + 1) / zeilen.length * 100) + '%';
  document.getElementById('dialog-counter').textContent =
    `${dialogZeileIdx + 1} / ${zeilen.length}`;

  const container = document.getElementById('dialog-zeilen');
  const div = document.createElement('div');
  div.className = 'dialog-zeile';
  div.innerHTML = `<span class="dialog-sprecher">${zeile.sprecher}</span><span class="dialog-text">${zeile.text}</span>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;

  if (aktiveEinheit.tts) speak(zeile.text);
  dialogZeileIdx++;
}

// ── Text ──────────────────────────────────────────────────────────────────
function startTextScreen(einheit) {
  state = 'text-lesen';
  document.getElementById('text-kapitel').textContent = aktivesKapitel.name;
  document.getElementById('text-titel').textContent = einheit.titel;
  document.getElementById('text-inhalt').textContent = einheit.inhalt;
  show('text-screen');

  if (einheit.tts && einheit.inhalt) {
    // Teile Text in Sätze auf und spiele sie der Reihe nach ab (Queue)
    const sentences = splitIntoSentences(einheit.inhalt);
    enqueueTTSQueue(sentences);
  }
}

function splitIntoSentences(text) {
  // Japanisch: 。で分割, Deutsch/Englisch: . ! ? で分割
  const sentences = text.split(/([。.!?])/);
  const result = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences[i] + (sentences[i + 1] || '');
    result.push(chunk);
  }
  return result.filter(s => s.trim());
}

// ── Einheiten-Quiz (Grammatik / Fragen nach Dialog & Text) ────────────────
// Wird für: Grammatik-Quiz, Dialog/Text/Hoeren-Fragen, alte Quizze verwendet.
// BUG-FIX: Dialog/Text/Hoeren in Kapiteltest hatten kein .cat → falscher Score-Key.
// LÖSUNG: _kapiteltestScoreKey speichert eindeutige Key, alle Fragen werden getaggt.
let isDialogQuiz = false; // Merkt sich ob wir gerade Dialog-Fragen machen
let isTextQuiz = false; // Merkt sich ob wir gerade Text-Fragen machen
function startEinheitenQuiz(fragen) {
  if (!fragen || fragen.length === 0) { nextEinheit(); return; }

  // Prüfe ob wir Dialog- oder Text-Fragen machen
  isDialogQuiz = aktiveEinheit && aktiveEinheit.typ === 'dialog';
  isTextQuiz = aktiveEinheit && aktiveEinheit.typ === 'text';

  // Für Kapiteltest Dialog/Text/Hoeren: setze Score-Key
  if (isKapiteltest && aktiveEinheit && aktiveEinheit._kapiteltestCategory &&
      (aktiveEinheit.typ === 'dialog' || aktiveEinheit.typ === 'text' || aktiveEinheit.typ === 'hoeren')) {
    _kapiteltestScoreKey = aktiveEinheit.titel;
  }

  shuffled = fragen.map(f => ({ ...f, _quizName: aktivesKapitel ? aktivesKapitel.name : 'Quiz' }));

  // Wenn Kapiteltest Score-Key gesetzt: tagge alle Fragen mit dieser Key
  if (_kapiteltestScoreKey) {
    shuffled = shuffled.map(f => ({ ...f, cat: _kapiteltestScoreKey }));
  }

  current = 0;
  answered = false;
  scores = {};
  totals = {};
  shuffled.forEach(q => {
    const key = q.cat || q._quizName;
    totals[key] = (totals[key] || 0) + 1;
    scores[key] = scores[key] || 0;
  });
  show('quiz-screen');
  renderQuestion();
}

// ── Quiz ──────────────────────────────────────────────────────────────────
function renderQuestion() {
  state = 'quiz-answering';
  answered = false;
  const q = shuffled[current];
  const total = shuffled.length;

  document.getElementById('progress-fill').style.width = ((current / total) * 100) + '%';
  document.getElementById('q-category').textContent = q.cat || q._quizName;
  document.getElementById('q-counter').textContent = `${current + 1} / ${total}`;
  document.getElementById('q-text').textContent = q.q;

  const container = document.getElementById('answers-container');
  container.innerHTML = '';
  ['A', 'B', 'C'].forEach((key, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.disabled = false;
    btn.innerHTML = `<span class="key-badge">${key}</span><span>${q.a[i]}</span>`;
    btn.onclick = () => selectAnswer(i);
    container.appendChild(btn);
  });

  document.getElementById('merksatz-box').classList.remove('show');
  document.getElementById('merksatz-text').textContent = '';
  document.getElementById('result-row').classList.remove('show');
  document.getElementById('result-verdict').textContent = '';
  document.getElementById('result-verdict').className = 'result-verdict';

  if (q.audio) {
    speak(q.audio);
  } else {
    const ru = extractRussian(q.q);
    if (ru) speak(ru);
  }
}

function selectAnswer(idx) {
  if (answered) return;
  answered = true;
  state = 'quiz-answered';
  const q = shuffled[current];
  const btns = document.querySelectorAll('.answer-btn');

  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.c) btn.classList.add('correct');
    else if (i === idx && idx !== q.c) btn.classList.add('wrong');
    else btn.classList.add('dim');
  });

  const correct = idx === q.c;
  const key = q.cat || q._quizName;
  if (correct) scores[key]++;

  const verdict = document.getElementById('result-verdict');
  verdict.textContent = correct ? '✓ Richtig!' : '✗ Falsch';
  verdict.className = 'result-verdict ' + (correct ? 'ok' : 'fail');
  document.getElementById('result-row').classList.add('show');

  if (q.m) {
    document.getElementById('merksatz-text').innerHTML = highlightRu(q.m);
    document.getElementById('merksatz-box').classList.add('show');
  }

  const correctRu = extractRussian(q.a[q.c]);
  if (correctRu) setTimeout(() => speak(correctRu), 400);
}

function nextQuestion() {
  // BUG-FIX: muss else-Branch für dialog-text/hoeren Phasen haben!
  // Wenn isKapiteltest && phase='dialog-text' → muss zu nextEinheit() gehen,
  // sonst passiert nichts (war Hauptbug).
  if (!answered) return;
  current++;
  if (current >= shuffled.length) {
    // Nach Dialog/Text-Fragen: zeige Review statt direkt zu nextEinheit()
    if (isDialogQuiz && einheitenModus) {
      showDialogReview();
    } else if (isTextQuiz && einheitenModus) {
      showTextReview();
    } else if (isKapiteltest) {
      // Speichere Scores der aktuellen Phase
      if (kapiteltestPhase === 'vokabeln') {
        kapiteltestPhaseResults['Vokabeln'].correct += (scores['Vokabeln'] || 0);
        kapiteltestPhaseResults['Vokabeln'].total += (totals['Vokabeln'] || 0);
        goToKapiteltestPhase('grammatik');
      } else if (kapiteltestPhase === 'grammatik') {
        kapiteltestPhaseResults['Grammatik'].correct += (scores['Grammatik'] || 0);
        kapiteltestPhaseResults['Grammatik'].total += (totals['Grammatik'] || 0);
        goToKapiteltestPhase('dialog-text');
      } else {
        // Dialog/Text/Hören-Phase: Einheit-Quiz fertig → zu nextEinheit
        nextEinheit();
      }
    } else if (einheitenModus) {
      nextEinheit();
    } else {
      showEndScreen();
    }
  } else {
    renderQuestion();
  }
}

// ── Kapitel-Ende (wird nicht mehr direkt aufgerufen — nextEinheit() geht zurück ins Menü) ──
function showKapitelEnd() {
  einheitenModus = false;
  einheitenCursor = 0;
  showEinheitenMenu();
}

// ── End screen (alte Quizze) ───────────────────────────────────────────────
function showEndScreen() {
  state = 'end';
  endCursor = 0;
  show('end-screen');

  const total = shuffled.length;
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const pct = Math.round((totalScore / total) * 100);

  document.getElementById('end-title').textContent = isKapiteltest ? kapiteltestConfig.titel : 'РЕЗУЛЬТАТ';
  document.getElementById('end-score').textContent = `${totalScore}/${total}`;
  document.getElementById('end-pct').textContent = `${pct}% korrekt`;

  const msgs = [
    [0,  40,  'Nicht schlecht als Anfang! Wiederhole die Merksätze – sie helfen wirklich. Давай!'],
    [41, 65,  'Guter Fortschritt! Du hast die Grundlagen. Fokussiere auf die schwächeren Kategorien.'],
    [66, 84,  'Sehr gut! Du hast ein solides Fundament. Die Etymologie-Tricks helfen langfristig.'],
    [85, 100, 'Ausgezeichnet! Молодец! Fast alles richtig. Bereit für die nächste Stufe!'],
  ];
  const [,,msg] = msgs.find(([lo, hi]) => pct >= lo && pct <= hi) || msgs[3];
  document.getElementById('end-message').textContent = msg;

  const breakdown = document.getElementById('cat-breakdown');
  breakdown.innerHTML = '';
  if (isKapiteltest) {
    kapiteltestConfig.sektionen.forEach(sek => {
      const s = scores[sek.name] || 0;
      const t = totals[sek.name] || 0;
      const p = t > 0 ? Math.round((s / t) * 100) : 0;
      const passed = p >= sek.minProzent;
      breakdown.innerHTML += `
        <div class="cat-row">
          <span class="cat-name">${sek.name}</span>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${p}%"></div></div>
          <span class="cat-score">${s}/${t}</span>
          <span class="cat-pass ${passed ? 'pass' : 'fail'}">${passed ? '✓' : '✗'} ${sek.minProzent}%</span>
        </div>`;
    });
  } else {
    Object.keys(totals).forEach(cat => {
      const s = scores[cat] || 0;
      const t = totals[cat];
      const p = Math.round((s / t) * 100);
      breakdown.innerHTML += `
        <div class="cat-row">
          <span class="cat-name">${cat}</span>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${p}%"></div></div>
          <span class="cat-score">${s}/${t}</span>
        </div>`;
    });
  }

  renderEndOptions();
}

function showKapiteltestResult() {
  // Finales Ergebnis: pro Sektion {correct/total, ✓/✗ Pass/Fail basierend auf minProzent}.
  // Nutzt bestehenden End-Screen mit angepasstem cat-breakdown Layout.
  state = 'end';
  endCursor = 0;
  show('end-screen');

  document.getElementById('end-title').textContent = kapiteltestConfig.titel;

  // Calc overall score
  let totalCorrect = 0, totalItems = 0;
  Object.values(kapiteltestPhaseResults).forEach(res => {
    totalCorrect += res.correct;
    totalItems += res.total;
  });

  const overallPct = totalItems > 0 ? Math.round((totalCorrect / totalItems) * 100) : 0;
  document.getElementById('end-score').textContent = `${totalCorrect}/${totalItems}`;
  document.getElementById('end-pct').textContent = `${overallPct}% korrekt`;

  const msgs = [
    [0,  40,  'Nicht schlecht als Anfang! Wiederhole die Merksätze – sie helfen wirklich. Давай!'],
    [41, 65,  'Guter Fortschritt! Du hast die Grundlagen. Fokussiere auf die schwächeren Kategorien.'],
    [66, 84,  'Sehr gut! Du hast ein solides Fundament. Die Etymologie-Tricks helfen langfristig.'],
    [85, 100, 'Ausgezeichnet! Молодец! Fast alles richtig. Bereit für die nächste Stufe!'],
  ];
  const [,,msg] = msgs.find(([lo, hi]) => overallPct >= lo && overallPct <= hi) || msgs[3];
  document.getElementById('end-message').textContent = msg;

  const breakdown = document.getElementById('cat-breakdown');
  breakdown.innerHTML = '';

  kapiteltestConfig.sektionen.forEach(sek => {
    const res = kapiteltestPhaseResults[sek.name];
    const s = res ? res.correct : 0;
    const t = res ? res.total : 0;
    const p = t > 0 ? Math.round((s / t) * 100) : 0;
    const passed = p >= sek.minProzent;
    breakdown.innerHTML += `
      <div class="cat-row">
        <span class="cat-name">${sek.name}</span>
        <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${p}%"></div></div>
        <span class="cat-score">${s}/${t}</span>
        <span class="cat-pass ${passed ? 'pass' : 'fail'}">${passed ? '✓' : '✗'} ${sek.minProzent}%</span>
      </div>`;
  });

  renderEndOptions();
}

function renderEndOptions() {
  document.querySelectorAll('.end-option').forEach((el, i) => {
    el.classList.toggle('selected', i === endCursor);
  });
}

function endMove(dir) {
  endCursor = (endCursor + dir + 2) % 2;
  renderEndOptions();
}

function endSelect() {
  isKapiteltest = false;
  kapiteltestConfig = null;
  if (endCursor === 0) {
    if (aktivesKapitel && !einheitenModus) {
      startKapitel(aktivesKapitel);
    } else {
      renderMenu();
    }
  } else {
    aktivesKapitel = null;
    renderMenu();
  }
}

// ── Kapiteltest ────────────────────────────────────────────────────────────
// Kapiteltest: Phasen-Sequenz [vokabeln→grammatik→dialog-text→hoeren→result]
// Jede Phase hat Fragen-Pool und Pass/Fail-Schwelle. Dialog/Text/Hoeren zeigen
// Inhalte VOR den Fragen (anders als reiner Quiz).
// Scores pro Phase in kapiteltestPhaseResults[sektion] = {correct, total}
function startKapiteltest(einheit) {
  kapiteltestConfig = einheit;
  isKapiteltest = true;
  kapiteltestPhase = 'vokabeln';
  kapiteltestPhaseResults = {
    'Vokabeln': {correct: 0, total: 0},
    'Grammatik': {correct: 0, total: 0},
    'Dialog & Text': {correct: 0, total: 0},
    'Hören': {correct: 0, total: 0},
  };
  goToKapiteltestPhase('vokabeln');
}

function goToKapiteltestPhase(phaseName) {
  // Steuert Phasen-Wechsel. Für vokabeln/grammatik: Quiz-Pool aufbauen + starten.
  // Für dialog-text/hoeren: Einheiten-Queue aufbauen + erste starten.
  kapiteltestPhase = phaseName;

  if (phaseName === 'vokabeln') {
    // Build 15 vokabeln MC questions
    const alleKarten = [];
    aktivesKapitel.einheiten.forEach(e => {
      if (e.typ === 'vokabeln') alleKarten.push(...e.karten);
    });
    const sampled = shuffle([...alleKarten]).slice(0, 15);
    const fragen = sampled.map(karte => {
      const decoys = shuffle(alleKarten.filter(k => k !== karte)).slice(0, 2).map(k => k.ru);
      const opts = shuffle([karte.ru, ...decoys]);
      return {
        q: `Wie heißt „${karte.de}" auf Russisch?`,
        a: opts,
        c: opts.indexOf(karte.ru),
        m: karte.m || `${karte.ru} = ${karte.de}`,
        cat: 'Vokabeln'
      };
    });
    startEinheitenQuiz(fragen);
  } else if (phaseName === 'grammatik') {
    // Build 20 grammatik questions
    const alleFragen = [];
    aktivesKapitel.einheiten.forEach(e => {
      if (e.typ === 'grammatik' && e.fragen) alleFragen.push(...e.fragen);
    });
    const sampled = shuffle([...alleFragen]).slice(0, 20);
    sampled.forEach(f => f.cat = 'Grammatik');
    startEinheitenQuiz(sampled);
  } else if (phaseName === 'dialog-text') {
    // Build queue: zufällige Dialog und Text einheiten
    kapiteltestUnitsQueue = [];
    const dialogs = shuffle(aktivesKapitel.einheiten.filter(e => e.typ === 'dialog')).slice(0, 1);
    const texts = shuffle(aktivesKapitel.einheiten.filter(e => e.typ === 'text')).slice(0, 1);
    dialogs.forEach(d => kapiteltestUnitsQueue.push({einheit: d, category: 'Dialog & Text'}));
    texts.forEach(t => kapiteltestUnitsQueue.push({einheit: t, category: 'Dialog & Text'}));

    if (kapiteltestUnitsQueue.length > 0) {
      startKapiteltestUnit();
    } else {
      goToKapiteltestPhase('hoeren');
    }
  } else if (phaseName === 'hoeren') {
    // Build queue: zufällige hoeren einheit(en)
    kapiteltestUnitsQueue = [];
    const hoerens = shuffle(aktivesKapitel.einheiten.filter(e => e.typ === 'hoeren')).slice(0, 1);
    hoerens.forEach(h => kapiteltestUnitsQueue.push({einheit: h, category: 'Hören'}));

    if (kapiteltestUnitsQueue.length > 0) {
      startKapiteltestUnit();
    } else {
      goToKapiteltestPhase('result');
    }
  } else if (phaseName === 'result') {
    showKapiteltestResult();
  }
}

function startKapiteltestUnit() {
  // Startet nächste Einheit (Dialog/Text/Hoeren) aus Queue nacheinander.
  // Jede Einheit: zeige Inhalt → Fragen → nextEinheit() speichert Scores.
  // WICHTIG: einheitenModus=true damit Quiz-Ende zu nextEinheit() führt.
  if (kapiteltestUnitsQueue.length === 0) {
    if (kapiteltestPhase === 'dialog-text') {
      goToKapiteltestPhase('hoeren');
    } else if (kapiteltestPhase === 'hoeren') {
      goToKapiteltestPhase('result');
    }
    return;
  }

  const {einheit, category} = kapiteltestUnitsQueue.shift();
  aktiveEinheit = einheit;
  aktiveEinheit._kapiteltestCategory = category;
  einheitenModus = true;

  if (einheit.typ === 'dialog') {
    startDialogScreen(einheit);
  } else if (einheit.typ === 'text') {
    startTextScreen(einheit);
  } else if (einheit.typ === 'hoeren') {
    startHoerenScreen(einheit);
  }
}

// ── TTS ────────────────────────────────────────────────────────────────────
let _currentAudio = null;
let _ttsPlaying = false;

function _ttsLang() {
  const langMap = { russian: 'ru', japanese: 'ja' };
  return langMap[aktiveSprache?.id] || 'ru';
}

function speak(text, lang) {
  if (!text) return;
  _ttsPlaying = false;
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  const l = lang || _ttsLang();
  const url = '/tts?q=' + encodeURIComponent(text) + '&lang=' + l;
  const audio = new Audio(url);
  _currentAudio = audio;
  audio.play().catch(() => {});
}

async function enqueueTTSQueue(sentences) {
  _ttsPlaying = true;
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }

  for (const sentence of sentences.filter(s => s.trim())) {
    if (!_ttsPlaying) break;

    try {
      const url = '/tts?q=' + encodeURIComponent(sentence) + '&lang=' + _ttsLang();
      const res = await fetch(url);
      if (!res.ok) continue;

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const audio = new Audio(blobUrl);
      _currentAudio = audio;

      audio.play().catch(() => {});

      // Warte bis Audio fertig ist
      await new Promise((resolve) => {
        const onended = () => { URL.revokeObjectURL(blobUrl); resolve(); };
        const timeout = setTimeout(onended, 10000); // 10s fallback
        audio.addEventListener('ended', () => { clearTimeout(timeout); onended(); }, { once: true });
        audio.addEventListener('error', () => { clearTimeout(timeout); onended(); }, { once: true });
      });

      // Kleine Pause zwischen Sätzen
      await new Promise(r => setTimeout(r, 150));
    } catch (e) {
      console.error('TTS Fehler:', e);
    }
  }

  _ttsPlaying = false;
}

function extractRussian(text) {
  const m = text.match(/[\u0400-\u04FF]+/g);
  return m ? m.join(' ') : null;
}
