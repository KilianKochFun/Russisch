// UI + Screen-Logik — alle Screens, Rendering und State-Übergänge.
// Reines Umsortieren aus russisch_quiz.html (Phase 1), Verhalten unverändert.
import { S, SRS_STAGES } from './state.js';
import { speak, enqueueTTSQueue, extractRussian } from './tts.js';
import {
  recordAnswer, getFaelligeKarten, einheitFortschritt,
  getSetting, setSetting, istEingeloggt, abmelden,
} from './progress.js';

const GENUS_FARBEN = { m: 'var(--blue)', f: 'var(--red)', n: '#a78bfa' };

// Breadcrumb: Icon + Sprache + Hierarchie-Pfad + aktuelle Ebene (+ optionale Extras)
function baueBreadcrumb(...extra) {
  const path = [(S.aktiveSprache?.icon || '🌍') + ' ' + (S.aktiveSprache?.sprache || 'Sprache')];
  for (const item of S.hierarchiePfad) {
    if (item.id === S.aktiveSprache?.id) continue;
    path.push(item.name || item.sprache || '');
  }
  if (S.aktiveKapitelEbene && S.aktiveKapitelEbene.id !== S.aktiveSprache?.id) {
    path.push(S.aktiveKapitelEbene.name || '');
  }
  path.push(...extra);
  return path;
}

const ERGEBNIS_MELDUNGEN = [
  [0,  40,  'Nicht schlecht als Anfang! Wiederhole die Merksätze – sie helfen wirklich. Давай!'],
  [41, 65,  'Guter Fortschritt! Du hast die Grundlagen. Fokussiere auf die schwächeren Kategorien.'],
  [66, 84,  'Sehr gut! Du hast ein solides Fundament. Die Etymologie-Tricks helfen langfristig.'],
  [85, 100, 'Ausgezeichnet! Молодец! Fast alles richtig. Bereit für die nächste Stufe!'],
];
function ergebnisMeldung(pct) {
  const [,,msg] = ERGEBNIS_MELDUNGEN.find(([lo, hi]) => pct >= lo && pct <= hi) || ERGEBNIS_MELDUNGEN[3];
  return msg;
}

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
function getSprachenItems() {
  const items = S.sprachenData.map(sprache => ({ sprache }));
  if (istEingeloggt()) items.push({ isLogout: true });
  return items;
}

function renderSprachen() {
  S.state = 'sprachen-menu';
  show('sprachen-screen');
  const list = document.getElementById('sprachen-list');
  list.innerHTML = '';
  S.menuCursor = 0;

  getSprachenItems().forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'menu-item' + (i === S.sprachenCursor ? ' selected' : '');
    div.innerHTML = item.isLogout
      ? `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name" style="color:var(--muted)">Abmelden</span>
        <span class="menu-item-desc">Fortschritt bleibt gespeichert</span>
      </span>`
      : `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${item.sprache.icon} ${item.sprache.sprache}</span>
        <span class="menu-item-desc">${item.sprache.kapitel?.length || 0} Kapitel</span>
      </span>`;
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
  S.aktiveSprache = item.sprache;
  S.hierarchiePfad = [];
  S.aktiveKapitelEbene = S.aktiveSprache;
  S.menuCursor = 0;
  renderMenu();
}

// ── Menu ───────────────────────────────────────────────────────────────────
function getMenuItems() {
  const items = [];

  if (!S.aktiveKapitelEbene) return items;

  // Add back button at top if we can go back
  if (S.hierarchiePfad.length > 0) {
    const parent = S.hierarchiePfad[S.hierarchiePfad.length - 1];
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
  } else if (S.aktiveSprache) {
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

  // "Weiter lernen" + "Fällige Karten" at top level (Phase 2)
  if (S.hierarchiePfad.length === 0 && S.aktiveSprache) {
    const letzte = findeEinheitPfad(getSetting('lastEinheitId'));
    if (letzte && letzte.sprache.id === S.aktiveSprache.id) {
      items.push({
        id: '__weiter__',
        name: '▶ Weiter lernen',
        beschreibung: `${letzte.uk.name} · ${letzte.uk.einheiten[letzte.idx].titel}`,
        schwierigkeit: null, isKapitel: false, isWeiter: true, kapitel: null, itemCount: 0
      });
    }
    const faellig = getFaelligeKarten(S.aktiveSprache).length;
    if (faellig > 0) {
      items.push({
        id: '__faellig__',
        name: 'Fällige Karten',
        beschreibung: `${faellig} Karten zur Wiederholung`,
        schwierigkeit: null, isKapitel: false, isFaellig: true, kapitel: null, itemCount: faellig
      });
    }
  }

  // SRS entry at top level (right after back button)
  if (S.hierarchiePfad.length === 0 && S.aktiveSprache && S.aktiveSprache.id === 'russian') {
    const due = srsGetDueCards().length;
    const dueText = due > 0 ? `${due} Reviews fällig` : 'Keine Reviews fällig';
    items.push({
      id: '__srs__',
      name: 'SRS Vokabeltrainer',
      beschreibung: dueText + ' · Level ' + S.srsData.unlockedLevel,
      schwierigkeit: null,
      isKapitel: false,
      isSrs: true,
      kapitel: null,
      itemCount: 0
    });
  }

  const itemsToShow = S.aktiveKapitelEbene.kapitel || S.aktiveKapitelEbene.unterkapitel || [];

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
  S.state = 'menu';
  show('menu-screen');
  const items = getMenuItems();
  const list = document.getElementById('menu-list');
  list.innerHTML = '';

  // Update header badge and title
  if (S.aktiveSprache) {
    document.getElementById('menu-sprache-badge').textContent = S.aktiveSprache.icon || '🌍';
    document.getElementById('menu-sprache-name').textContent = S.aktiveSprache.sprache || 'Sprache';
  }

  // Update breadcrumb — Icon + Sprache + Unterordner + aktuelle Ebene
  const breadcrumbWrapper = document.getElementById('breadcrumb-wrapper');
  const breadcrumbText = document.getElementById('breadcrumb-text');

  if (S.aktiveSprache) {
    breadcrumbWrapper.style.display = 'block';
    breadcrumbText.textContent = baueBreadcrumb().join(' > ');
  } else {
    breadcrumbWrapper.style.display = 'none';
  }

  items.forEach((item, i) => {
    const div = document.createElement('div');
    const isBackButton = item.isBack;
    div.className = 'menu-item' + (i === S.menuCursor ? ' selected' : '') + (item.isKapitel ? ' kapitel-item' : '') + (isBackButton ? ' back-item' : '');
    if (item.isSrs) {
      div.style.borderColor = i === S.menuCursor ? 'var(--green)' : 'var(--green-dim)';
      if (i === S.menuCursor) div.style.background = 'rgba(46,204,113,0.08)';
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
  S.menuCursor = (S.menuCursor + dir + items.length) % items.length;
  renderMenu();
  document.querySelector('#menu-list .selected')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function menuSelect() {
  const items = getMenuItems();
  const chosen = items[S.menuCursor];
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

  if (chosen.isWeiter) { weiterLernen(); return; }
  if (chosen.isFaellig) { starteFaelligeKarten(); return; }

  // If item has children (folder), navigate deeper
  if (chosen.isKapitel && (chosen.kapitel.kapitel || chosen.kapitel.unterkapitel)) {
    // Speichere aktuellen Cursor bevor wir runter navigieren
    S.cursorStack.push(S.menuCursor);
    S.hierarchiePfad.push(S.aktiveKapitelEbene);
    S.aktiveKapitelEbene = chosen.kapitel;
    S.menuCursor = 0;
    renderMenu();
  } else if (chosen.kapitel.einheiten) {
    // Item has einheiten, start learning
    startKapitel(chosen.kapitel);
  }
}

// ── Navigation ─────────────────────────────────────────────────────────────
function zurueckZumMenu() {
  if (S.hierarchiePfad.length > 0) {
    // Go back one level in hierarchy
    S.aktiveKapitelEbene = S.hierarchiePfad.pop();
    // Restore saved cursor for this level
    S.menuCursor = S.cursorStack.pop() || 0;
    renderMenu();
  } else if (S.aktiveSprache) {
    // Back from kapitel level to sprachen selection
    S.sprachenCursor = S.sprachenData.findIndex(s => s.id === S.aktiveSprache.id);
    S.aktiveSprache = null;
    S.aktiveKapitelEbene = null;
    S.menuCursor = 0;
    S.cursorStack = [];
    S.einheitenCursorStack = [];
    renderSprachen();
  }
}

function zurueckZuEinheiten() {
  // In einer "Fällige Karten"-Session gibt es kein echtes Einheiten-Menü
  if (S.dueSession) {
    S.dueSession = false;
    S.einheitenModus = false;
    renderMenu();
    return;
  }
  showEinheitenMenu();
}

// ── Weiter lernen & Fällige Karten (Phase 2) ───────────────────────────────
function findeEinheitPfad(einheitId) {
  if (!einheitId) return null;
  for (const sprache of S.sprachenData) {
    for (const kap of (sprache.kapitel || [])) {
      for (const uk of (kap.unterkapitel || [])) {
        const idx = (uk.einheiten || []).findIndex(e => e.id === einheitId);
        if (idx >= 0) return { sprache, kap, uk, idx };
      }
    }
  }
  return null;
}

function weiterLernen() {
  const ziel = findeEinheitPfad(getSetting('lastEinheitId'));
  if (!ziel) return;
  S.aktiveSprache = ziel.sprache;
  S.hierarchiePfad = [ziel.sprache];
  S.aktiveKapitelEbene = ziel.kap;
  S.cursorStack = [0, 0];
  S.aktivesKapitel = ziel.uk;
  S.einheitenCursor = ziel.idx;
  S.einheitenModus = false;
  showEinheitenMenu();
}

function starteFaelligeKarten() {
  const karten = getFaelligeKarten(S.aktiveSprache);
  if (!karten.length) return;
  S.aktiveEinheit = { typ: 'vokabeln', titel: 'Fällige Karten', karten };
  S.aktivesKapitel = { name: 'Wiederholung', einheiten: [S.aktiveEinheit] };
  S.dueSession = true;
  S.einheitenModus = true;
  S.aktivesPaket = karten;
  S.state = 'richtung-wahl';
  show('richtung-screen');
  document.getElementById('richtung-back-btn').textContent = '← Menü';
}

// ── Kapitel-Modus ──────────────────────────────────────────────────────────
function startKapitel(kapitel) {
  S.aktivesKapitel = kapitel;
  S.einheitenModus = false;
  // Speichere aktuellen S.menuCursor bevor wir in Einheiten gehen
  S.cursorStack.push(S.menuCursor);
  showEinheitenMenu();
}

function showEinheitenMenu() {
  S.state = 'einheiten-menu';
  show('einheiten-screen');
  document.getElementById('einheiten-kapitel-name').textContent = S.aktivesKapitel.name;

  // Update breadcrumb for einheiten — Icon + Sprache + Unterordner + Kapitel + Unterkapitel
  const breadcrumbWrapper = document.getElementById('einheiten-breadcrumb-wrapper');
  const breadcrumbText = document.getElementById('einheiten-breadcrumb-text');
  breadcrumbWrapper.style.display = 'block';

  breadcrumbText.textContent = baueBreadcrumb(S.aktivesKapitel?.name || '').join(' > ');

  const list = document.getElementById('einheiten-list');
  list.innerHTML = '';

  // Zurück-Eintrag (Cursor -1) — automatisch zum parent Unterkapitel
  const backDiv = document.createElement('div');
  backDiv.className = 'menu-item' + (S.einheitenCursor === -1 ? ' selected' : '');
  backDiv.innerHTML = `
    <span class="cursor-arrow">›</span>
    <span class="menu-item-body">
      <span class="menu-item-name">← ${S.aktivesKapitel.name}</span>
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

  S.aktivesKapitel.einheiten.forEach((einheit, i) => {
    const itemCount = einheit.karten
      ? `${einheit.karten.length} Karten`
      : einheit.fragen
        ? `${einheit.fragen.length} Fragen`
        : einheit.zeilen
          ? `${einheit.zeilen.length} Zeilen`
          : '';

    // Fortschritt: wie viele Items dieser Einheit wurden schon mal gewusst (Phase 2)
    const f = einheitFortschritt(einheit);
    const fortschrittHtml = (istEingeloggt() && f.total > 0 && f.gelernt > 0)
      ? `<span class="q-count" style="color:${f.gelernt >= f.total ? 'var(--green)' : 'var(--yellow)'}">${f.gelernt}/${f.total} ✓</span>`
      : '';

    const div = document.createElement('div');
    div.className = 'menu-item kapitel-item' + (i === S.einheitenCursor ? ' selected' : '');
    div.innerHTML = `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${einheit.titel}</span>
        <span class="menu-item-desc">${TYP_LABELS[einheit.typ] || einheit.typ}</span>
      </span>
      <span class="menu-item-meta">
        ${fortschrittHtml}
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
  const n = S.aktivesKapitel.einheiten.length;
  // Cursor reicht von -1 (Zurück) bis n-1
  S.einheitenCursor = Math.max(-1, Math.min(n - 1, S.einheitenCursor + dir));
  showEinheitenMenu();
  document.querySelector('#einheiten-list .selected')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function einheitenMenuSelect() {
  if (S.einheitenCursor === -1) { zurueckVonEinheiten(); return; }
  S.einheitIdx = S.einheitenCursor;
  S.einheitenModus = true;
  startEinheit(S.einheitIdx);
}

function zurueckVonEinheiten() {
  // Zurück zur Unterkapitel-Auswahl (menu-screen) — OHNE S.hierarchiePfad zu ändern!
  S.state = 'menu';
  show('menu-screen');
  // Restore saved cursor für diesen Unterkapitel-Level
  S.menuCursor = S.cursorStack.pop() || 0;
  renderMenu();
}

function startEinheit(idx) {
  S.einheitIdx = idx;
  S.aktiveEinheit = S.aktivesKapitel.einheiten[idx];

  // "Weiter lernen"-Position merken (Phase 2)
  if (S.aktiveEinheit.id) setSetting('lastEinheitId', S.aktiveEinheit.id);

  switch (S.aktiveEinheit.typ) {
    case 'vokabeln':    startKarteikarten(S.aktiveEinheit); break;
    case 'grammatik':   startKarteikarten(S.aktiveEinheit); break;
    case 'theorie':     startTheorieScreen(S.aktiveEinheit); break;
    case 'hoeren':      startHoerenScreen(S.aktiveEinheit); break;
    case 'dialog':      startDialogScreen(S.aktiveEinheit); break;
    case 'text':        startTextScreen(S.aktiveEinheit); break;
    case 'kapiteltest': startKapiteltest(S.aktiveEinheit); break;
    default: zurueckZuEinheiten();
  }
}

// ── Dialog-Review (nach Dialog-Fragen) ──────────────────────────────────────
function showDialogReview() {
  S.state = 'dialog-review';
  show('dialog-review-screen');

  document.getElementById('dialog-review-titel').textContent = S.aktiveEinheit.titel;

  const container = document.getElementById('dialog-review-zeilen');
  container.innerHTML = '';

  S.aktiveEinheit.zeilen.forEach(zeile => {
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
  S.state = 'text-review';
  show('text-review-screen');

  document.getElementById('text-review-titel').textContent = S.aktiveEinheit.titel;

  const container = document.getElementById('text-review-absaetze');
  container.innerHTML = '';

  if (S.aktiveEinheit.absaetze && S.aktiveEinheit.absaetze.length > 0) {
    // Mit Absätze (ru + de untereinander)
    S.aktiveEinheit.absaetze.forEach(abs => {
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
    div.innerHTML = `<div style="font-size: 16px; line-height: 1.6; color: var(--text);">${S.aktiveEinheit.inhalt}</div>`;
    container.appendChild(div);
  }
}

function nextEinheit() {
  // Kapiteltest: nach Dialog/Text/Hoeren-Quiz: speichert Scores mit S._kapiteltestScoreKey
  // und geht zu startKapiteltestUnit() (nächste Einheit oder Phase).
  // Normale Einheiten: geht zurück zu Menü.
  if (S.isKapiteltest && S.aktiveEinheit && S.aktiveEinheit._kapiteltestCategory) {
    // Speichere Scores aus dieser Einheit
    const category = S.aktiveEinheit._kapiteltestCategory;
    const scoreKey = S._kapiteltestScoreKey || S.aktiveEinheit.titel;
    S.kapiteltestPhaseResults[category].correct += (S.scores[scoreKey] || 0);
    S.kapiteltestPhaseResults[category].total += (S.totals[scoreKey] || 0);
    S._kapiteltestScoreKey = null; // Reset für nächste Einheit
    // Gehe zur nächsten Einheit
    startKapiteltestUnit();
  } else if (S.dueSession) {
    // "Fällige Karten"-Session fertig → zurück ins Kapitel-Menü
    S.dueSession = false;
    S.einheitenModus = false;
    renderMenu();
  } else {
    // Nach jeder Einheit: zurück zum Einheiten-Menü, nicht auto-weiter
    S.einheitenModus = false;
    S.einheitenCursor = S.einheitIdx;
    showEinheitenMenu();
  }
}

// ── Pakete ─────────────────────────────────────────────────────────────────
function startKarteikarten(einheit) {
  S.paketeCursor = 0;
  S.aktivesPaket = [];
  showPaketeScreen();
}

function getPakete() {
  const pool = S.aktiveEinheit.typ === 'grammatik' ? S.aktiveEinheit.fragen : S.aktiveEinheit.karten;
  const pakete = [];
  for (let i = 0; i < pool.length; i += 5) {
    pakete.push(pool.slice(i, i + 5));
  }
  return pakete;
}

function showPaketeScreen() {
  S.state = 'pakete-menu';
  show('pakete-screen');
  document.getElementById('pakete-einheit-name').textContent = S.aktiveEinheit.titel;
  renderPaketeList();
}

function renderPaketeList() {
  // Update breadcrumb for pakete — Icon + Sprache + alles
  const breadcrumbWrapper = document.getElementById('pakete-breadcrumb-wrapper');
  const breadcrumbText = document.getElementById('pakete-breadcrumb-text');
  breadcrumbWrapper.style.display = 'block';

  breadcrumbText.textContent = baueBreadcrumb(S.aktivesKapitel?.name || '', S.aktiveEinheit?.titel || '').join(' > ');

  const pakete = getPakete();
  const list = document.getElementById('pakete-list');
  list.innerHTML = '';

  // Zurück-Eintrag (Cursor -1) — automatisch zum parent Unterkapitel
  const backDiv = document.createElement('div');
  backDiv.className = 'menu-item' + (S.paketeCursor === -1 ? ' selected' : '');
  backDiv.innerHTML = `
    <span class="cursor-arrow">›</span>
    <span class="menu-item-body">
      <span class="menu-item-name">← ${S.aktivesKapitel.name}</span>
    </span>`;
  list.appendChild(backDiv);

  pakete.forEach((p, i) => {
    const von = i * 5 + 1;
    const bis = von + p.length - 1;
    const div = document.createElement('div');
    div.className = 'menu-item kapitel-item' + (i === S.paketeCursor ? ' selected' : '');
    div.innerHTML = `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">Paket ${i + 1}</span>
        <span class="menu-item-desc">${S.aktiveEinheit.typ === 'grammatik' ? 'Fragen' : 'Karten'} ${von}–${bis}</span>
      </span>
      <span class="menu-item-meta"><span class="q-count">${p.length} ${S.aktiveEinheit.typ === 'grammatik' ? 'Fragen' : 'Karten'}</span></span>`;
    list.appendChild(div);
  });

  // Alle-Option
  const alleIdx = pakete.length;
  const alleDiv = document.createElement('div');
  alleDiv.className = 'menu-item kapitel-item' + (alleIdx === S.paketeCursor ? ' selected' : '');
  alleDiv.innerHTML = `
    <span class="cursor-arrow">›</span>
    <span class="menu-item-body">
      <span class="menu-item-name">${S.aktiveEinheit.typ === 'grammatik' ? 'Alle Fragen' : 'Alle Karten'}</span>
      <span class="menu-item-desc">gesamter Stapel</span>
    </span>
    <span class="menu-item-meta"><span class="q-count">${(S.aktiveEinheit.typ === 'grammatik' ? S.aktiveEinheit.fragen : S.aktiveEinheit.karten).length} ${S.aktiveEinheit.typ === 'grammatik' ? 'Fragen' : 'Karten'}</span></span>`;
  list.appendChild(alleDiv);
}

function paketeMove(dir) {
  const n = getPakete().length + 1; // +1 für Alle
  S.paketeCursor = Math.max(-1, Math.min(n - 1, S.paketeCursor + dir));
  renderPaketeList();
  document.querySelector('#pakete-list .selected')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function paketeSelect() {
  if (S.paketeCursor === -1) { zurueckZuEinheiten(); return; }
  const pakete = getPakete();
  if (S.paketeCursor < pakete.length) {
    S.aktivesPaket = pakete[S.paketeCursor];
  } else {
    S.aktivesPaket = S.aktiveEinheit.typ === 'grammatik' ? S.aktiveEinheit.fragen : S.aktiveEinheit.karten;
  }
  if (S.aktiveEinheit.typ === 'grammatik') {
    startEinheitenQuiz(S.aktivesPaket);
  } else {
    S.state = 'richtung-wahl';
    show('richtung-screen');
    // Update back button label to show current Unterkapitel
    document.getElementById('richtung-back-btn').textContent = '← ' + S.aktivesKapitel.name;
  }
}

function startKarteikartenMitRichtung(richtung) {
  S.aktiveRichtung = richtung;
  const pool = S.aktivesPaket.length > 0 ? S.aktivesPaket : S.aktiveEinheit.karten;

  if (richtung === 'mc') {
    startMCModus(pool);
    return;
  }

  S.karteiStapel = shuffle([...pool]);
  S.nochmalStapel = [];
  S.karteiGewusst = 0;
  S.karteiPaketGroesse = pool.length;
  zeigeKarte();
}

function startMCModus(pool) {
  const alleKarten = S.aktiveEinheit.karten;
  S.shuffled = shuffle([...pool]).map(karte => {
    const falsche = shuffle(alleKarten.filter(k => k.ru !== karte.ru)).slice(0, 2);
    const optionen = shuffle([karte.de, falsche[0].de, falsche[1].de]);
    return {
      q: karte.ru,
      a: optionen,
      c: optionen.indexOf(karte.de),
      m: karte.m,
      _quizName: S.aktiveEinheit.titel,
      _karte: karte
    };
  });
  S.current = 0;
  S.answered = false;
  S.scores = { [S.aktiveEinheit.titel]: 0 };
  S.totals = { [S.aktiveEinheit.titel]: S.shuffled.length };
  S.einheitenModus = true;
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
  if (S.karteiStapel.length === 0) {
    if (S.nochmalStapel.length === 0) {
      nextEinheit();
      return;
    }
    S.karteiStapel = [...nochmalStapel];
    S.nochmalStapel = [];
  }

  S.aktiveKarte = S.karteiStapel.shift();
  S.state = 'karte-front';

  // Richtung für diese Karte bestimmen
  S.karteRichtung = S.aktiveRichtung === 'gemischt'
    ? (Math.random() < 0.5 ? 'ru-de' : 'de-ru')
    : S.aktiveRichtung;

  const total = S.karteiPaketGroesse || S.aktiveEinheit.karten.length;
  const verbleibend = S.karteiStapel.length + S.nochmalStapel.length + 1;
  const done = total - verbleibend;

  document.getElementById('karte-progress').style.width = Math.max(0, (done / total) * 100) + '%';
  document.getElementById('karte-kapitel').textContent = S.aktivesKapitel.name;
  document.getElementById('karte-counter').textContent = `${S.karteiGewusst} / ${total} ✓`;

  // Vorderseite: je nach Richtung RU oder DE
  const frontText = S.karteRichtung === 'ru-de' ? S.aktiveKarte.ru : S.aktiveKarte.de;
  const frontLang = S.karteRichtung === 'ru-de' ? 'RU → DE' : 'DE → RU';
  // Genus-Farbe — Bar + Badge + Textfarbe
  const genus = getGenus(S.aktiveKarte);
  const genusColor = GENUS_FARBEN[genus] || 'var(--border)';
  const genusLabel = { m: 'м. — männlich', f: 'ж. — weiblich', n: 'с. — sächlich' }[genus];
  const bar = document.getElementById('karte-genus-bar');
  bar.style.background = genus ? genusColor : 'var(--border)';
  bar.style.opacity = genus ? '1' : '0.3';
  const badge = document.getElementById('karte-genus-badge');
  if (genus && S.karteRichtung === 'ru-de') {
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
  frontEl.style.color = S.karteRichtung === 'ru-de' ? ruColor : '';

  document.getElementById('karte-front-richtung').textContent = frontLang;

  // Rückseite vorbereiten
  const backObenEl = document.getElementById('karte-back-oben');
  backObenEl.textContent = frontText;
  backObenEl.className = 'karte-wort karte-back-klein';
  backObenEl.style.color = S.karteRichtung === 'ru-de' ? ruColor : '';

  const backUntenEl = document.getElementById('karte-back-unten');
  backUntenEl.textContent = S.karteRichtung === 'ru-de' ? S.aktiveKarte.de : S.aktiveKarte.ru;
  backUntenEl.className = 'karte-de';
  backUntenEl.style.color = S.karteRichtung === 'de-ru' ? ruColor : '';

  // Merksatz mit Wortfamilien-Highlight
  const mEl = document.getElementById('karte-m');
  mEl.innerHTML = highlightRu(S.aktiveKarte.m || '');

  document.getElementById('karte-front-side').style.display = 'block';
  document.getElementById('karte-back-side').style.display = 'none';

  show('karteikarten-screen');
  if (S.karteRichtung === 'ru-de') speak(S.aktiveKarte.ru);
}

function aufdecken() {
  if (S.state !== 'karte-front') return;
  S.state = 'karte-back';
  document.getElementById('karte-front-side').style.display = 'none';
  document.getElementById('karte-back-side').style.display = 'block';
  // Bei RU→DE: beim Aufdecken RU nochmal sprechen; bei DE→RU: RU sprechen (das ist die Lösung)
  speak(S.aktiveKarte.ru);
}

function karteGewusst() {
  if (S.state !== 'karte-back') return;
  S.karteiGewusst++;
  recordAnswer(S.aktiveKarte.id, true);
  zeigeKarte();
}

function karteNochmal() {
  if (S.state !== 'karte-back') return;
  S.nochmalStapel.push(S.aktiveKarte);
  recordAnswer(S.aktiveKarte.id, false);
  zeigeKarte();
}

// ── Hören ─────────────────────────────────────────────────────────────────
function startHoerenScreen(einheit) {
  S.hoerenIdx = 0;
  document.getElementById('hoeren-kapitel').textContent = S.aktivesKapitel.name;
  show('hoeren-screen');
  zeigeHoerenLauschen();
}

function zeigeHoerenLauschen() {
  S.hoerenAnswered = false;
  S.state = 'hoeren-lauschen';
  const aufgaben = S.aktiveEinheit.aufgaben;
  const aufgabe = aufgaben[S.hoerenIdx];
  const total = aufgaben.length;

  document.getElementById('hoeren-progress').style.width = ((S.hoerenIdx / total) * 100) + '%';
  document.getElementById('hoeren-counter').textContent = `${S.hoerenIdx + 1} / ${total}`;
  document.getElementById('hoeren-aufgabe-nr').textContent = `Aufgabe ${S.hoerenIdx + 1} von ${total}`;

  document.getElementById('hoeren-lauschen-phase').style.display = 'block';
  document.getElementById('hoeren-frage-phase').style.display = 'none';
  document.getElementById('hoeren-welle').classList.add('playing');

  speak(aufgabe.audio);
}

function zeigeHoerenFrage() {
  S.state = 'hoeren-frage';
  const aufgabe = S.aktiveEinheit.aufgaben[S.hoerenIdx];

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
  if (S.hoerenAnswered) return;
  S.hoerenAnswered = true;
  S.state = 'hoeren-beantwortet';
  const aufgabe = S.aktiveEinheit.aufgaben[S.hoerenIdx];
  const btns = document.querySelectorAll('#hoeren-answers .answer-btn');

  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === aufgabe.c) btn.classList.add('correct');
    else if (i === idx && idx !== aufgabe.c) btn.classList.add('wrong');
    else btn.classList.add('dim');
  });

  const correct = idx === aufgabe.c;
  recordAnswer(aufgabe.id, correct);
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
  S.hoerenIdx++;
  if (S.hoerenIdx >= S.aktiveEinheit.aufgaben.length) {
    nextEinheit();
  } else {
    zeigeHoerenLauschen();
  }
}

// ── Theorie ───────────────────────────────────────────────────────────────
function startTheorieScreen(einheit) {
  S.theorieKarteIdx = 0;
  S.state = 'theorie';
  document.getElementById('theorie-kapitel').textContent = S.aktivesKapitel.name;
  show('theorie-screen');
  zeigeTheorieKarte();
}

function zeigeTheorieKarte() {
  const karten = S.aktiveEinheit.karten;
  const karte = karten[S.theorieKarteIdx];
  const total = karten.length;

  document.getElementById('theorie-progress').style.width = ((S.theorieKarteIdx + 1) / total * 100) + '%';
  document.getElementById('theorie-counter').textContent = `${S.theorieKarteIdx + 1} / ${total}`;
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
    S.theorieKarteIdx === total - 1
      ? `<kbd>B</kbd> Einheit beenden`
      : `<kbd>B</kbd> nächste Karte (${S.theorieKarteIdx + 1}/${total})`;

  // Seite nach oben scrollen
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Dialog ────────────────────────────────────────────────────────────────
function startDialogScreen(einheit) {
  S.dialogZeileIdx = 0;
  S.state = 'dialog-lesen';

  document.getElementById('dialog-kapitel').textContent = S.aktivesKapitel.name;
  document.getElementById('dialog-titel').textContent = einheit.titel;
  document.getElementById('dialog-counter').textContent = `0 / ${einheit.zeilen.length}`;
  document.getElementById('dialog-progress').style.width = '0%';
  document.getElementById('dialog-zeilen').innerHTML = '';
  document.getElementById('dialog-hint').innerHTML = `<kbd>B</kbd> nächste Zeile &nbsp;·&nbsp; <kbd>A</kbd>/<kbd>C</kbd> scrollen`;

  show('dialog-screen');
  zeigeDialogZeile();
}

function zeigeDialogZeile() {
  const zeilen = S.aktiveEinheit.zeilen;

  if (S.dialogZeileIdx >= zeilen.length) {
    // Dialog fertig
    document.getElementById('dialog-hint').innerHTML = `<kbd>B</kbd> zu den Fragen &nbsp;·&nbsp; <kbd>A</kbd>/<kbd>C</kbd> scrollen`;
    if (S.aktiveEinheit.fragen && S.aktiveEinheit.fragen.length > 0) {
      S.state = 'dialog-fertig';
    } else {
      nextEinheit();
    }
    return;
  }

  const zeile = zeilen[S.dialogZeileIdx];
  document.getElementById('dialog-progress').style.width =
    ((S.dialogZeileIdx + 1) / zeilen.length * 100) + '%';
  document.getElementById('dialog-counter').textContent =
    `${S.dialogZeileIdx + 1} / ${zeilen.length}`;

  const container = document.getElementById('dialog-zeilen');
  const div = document.createElement('div');
  div.className = 'dialog-zeile';
  div.innerHTML = `<span class="dialog-sprecher">${zeile.sprecher}</span><span class="dialog-text">${zeile.text}</span>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;

  if (S.aktiveEinheit.tts) speak(zeile.text);
  S.dialogZeileIdx++;
}

// ── Text ──────────────────────────────────────────────────────────────────
function startTextScreen(einheit) {
  S.state = 'text-lesen';
  document.getElementById('text-kapitel').textContent = S.aktivesKapitel.name;
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
// LÖSUNG: S._kapiteltestScoreKey speichert eindeutige Key, alle Fragen werden getaggt.
function startEinheitenQuiz(fragen) {
  if (!fragen || fragen.length === 0) { nextEinheit(); return; }

  // Prüfe ob wir Dialog- oder Text-Fragen machen
  S.isDialogQuiz = S.aktiveEinheit && S.aktiveEinheit.typ === 'dialog';
  S.isTextQuiz = S.aktiveEinheit && S.aktiveEinheit.typ === 'text';

  // Für Kapiteltest Dialog/Text/Hoeren: setze Score-Key
  if (S.isKapiteltest && S.aktiveEinheit && S.aktiveEinheit._kapiteltestCategory &&
      (S.aktiveEinheit.typ === 'dialog' || S.aktiveEinheit.typ === 'text' || S.aktiveEinheit.typ === 'hoeren')) {
    S._kapiteltestScoreKey = S.aktiveEinheit.titel;
  }

  S.shuffled = fragen.map(f => ({ ...f, _quizName: S.aktivesKapitel ? S.aktivesKapitel.name : 'Quiz' }));

  // Wenn Kapiteltest Score-Key gesetzt: tagge alle Fragen mit dieser Key
  if (S._kapiteltestScoreKey) {
    S.shuffled = S.shuffled.map(f => ({ ...f, cat: S._kapiteltestScoreKey }));
  }

  S.current = 0;
  S.answered = false;
  S.scores = {};
  S.totals = {};
  S.shuffled.forEach(q => {
    const key = q.cat || q._quizName;
    S.totals[key] = (S.totals[key] || 0) + 1;
    S.scores[key] = S.scores[key] || 0;
  });
  show('quiz-screen');
  renderQuestion();
}

// ── Quiz ──────────────────────────────────────────────────────────────────
function renderQuestion() {
  S.state = 'quiz-answering';
  S.answered = false;
  const q = S.shuffled[S.current];
  const total = S.shuffled.length;

  document.getElementById('progress-fill').style.width = ((S.current / total) * 100) + '%';
  document.getElementById('q-category').textContent = q.cat || q._quizName;
  document.getElementById('q-counter').textContent = `${S.current + 1} / ${total}`;
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
  if (S.answered) return;
  S.answered = true;
  S.state = 'quiz-answered';
  const q = S.shuffled[S.current];
  const btns = document.querySelectorAll('.answer-btn');

  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.c) btn.classList.add('correct');
    else if (i === idx && idx !== q.c) btn.classList.add('wrong');
    else btn.classList.add('dim');
  });

  const correct = idx === q.c;
  const key = q.cat || q._quizName;
  if (correct) S.scores[key]++;

  // Fortschritt speichern: MC-Vokabelmodus → Karten-ID, sonst Fragen-ID (Phase 2)
  recordAnswer(q._karte ? q._karte.id : q.id, correct);

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
  // Wenn S.isKapiteltest && phase='dialog-text' → muss zu nextEinheit() gehen,
  // sonst passiert nichts (war Hauptbug).
  if (!S.answered) return;
  S.current++;
  if (S.current >= S.shuffled.length) {
    // Nach Dialog/Text-Fragen: zeige Review statt direkt zu nextEinheit()
    if (S.isDialogQuiz && S.einheitenModus) {
      showDialogReview();
    } else if (S.isTextQuiz && S.einheitenModus) {
      showTextReview();
    } else if (S.isKapiteltest) {
      // Speichere Scores der aktuellen Phase
      if (S.kapiteltestPhase === 'vokabeln') {
        S.kapiteltestPhaseResults['Vokabeln'].correct += (S.scores['Vokabeln'] || 0);
        S.kapiteltestPhaseResults['Vokabeln'].total += (S.totals['Vokabeln'] || 0);
        goToKapiteltestPhase('grammatik');
      } else if (S.kapiteltestPhase === 'grammatik') {
        S.kapiteltestPhaseResults['Grammatik'].correct += (S.scores['Grammatik'] || 0);
        S.kapiteltestPhaseResults['Grammatik'].total += (S.totals['Grammatik'] || 0);
        goToKapiteltestPhase('dialog-text');
      } else {
        // Dialog/Text/Hören-Phase: Einheit-Quiz fertig → zu nextEinheit
        nextEinheit();
      }
    } else if (S.einheitenModus) {
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
  S.einheitenModus = false;
  S.einheitenCursor = 0;
  showEinheitenMenu();
}

// ── End screen (alte Quizze) ───────────────────────────────────────────────
function showEndScreen() {
  S.state = 'end';
  S.endCursor = 0;
  show('end-screen');

  const total = S.shuffled.length;
  const totalScore = Object.values(S.scores).reduce((a, b) => a + b, 0);
  const pct = Math.round((totalScore / total) * 100);

  document.getElementById('end-title').textContent = S.isKapiteltest ? S.kapiteltestConfig.titel : 'РЕЗУЛЬТАТ';
  document.getElementById('end-score').textContent = `${totalScore}/${total}`;
  document.getElementById('end-pct').textContent = `${pct}% korrekt`;

  document.getElementById('end-message').textContent = ergebnisMeldung(pct);

  const breakdown = document.getElementById('cat-breakdown');
  breakdown.innerHTML = '';
  if (S.isKapiteltest) {
    S.kapiteltestConfig.sektionen.forEach(sek => {
      const s = S.scores[sek.name] || 0;
      const t = S.totals[sek.name] || 0;
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
    Object.keys(S.totals).forEach(cat => {
      const s = S.scores[cat] || 0;
      const t = S.totals[cat];
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
  S.state = 'end';
  S.endCursor = 0;
  show('end-screen');

  document.getElementById('end-title').textContent = S.kapiteltestConfig.titel;

  // Calc overall score
  let totalCorrect = 0, totalItems = 0;
  Object.values(S.kapiteltestPhaseResults).forEach(res => {
    totalCorrect += res.correct;
    totalItems += res.total;
  });

  const overallPct = totalItems > 0 ? Math.round((totalCorrect / totalItems) * 100) : 0;
  document.getElementById('end-score').textContent = `${totalCorrect}/${totalItems}`;
  document.getElementById('end-pct').textContent = `${overallPct}% korrekt`;

  document.getElementById('end-message').textContent = ergebnisMeldung(overallPct);

  const breakdown = document.getElementById('cat-breakdown');
  breakdown.innerHTML = '';

  S.kapiteltestConfig.sektionen.forEach(sek => {
    const res = S.kapiteltestPhaseResults[sek.name];
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
    el.classList.toggle('selected', i === S.endCursor);
  });
}

function endMove(dir) {
  S.endCursor = (S.endCursor + dir + 2) % 2;
  renderEndOptions();
}

function endSelect() {
  S.isKapiteltest = false;
  S.kapiteltestConfig = null;
  if (S.endCursor === 0) {
    if (S.aktivesKapitel && !S.einheitenModus) {
      startKapitel(S.aktivesKapitel);
    } else {
      renderMenu();
    }
  } else {
    S.aktivesKapitel = null;
    renderMenu();
  }
}

// ── Kapiteltest ────────────────────────────────────────────────────────────
// Kapiteltest: Phasen-Sequenz [vokabeln→grammatik→dialog-text→hoeren→result]
// Jede Phase hat Fragen-Pool und Pass/Fail-Schwelle. Dialog/Text/Hoeren zeigen
// Inhalte VOR den Fragen (anders als reiner Quiz).
// Scores pro Phase in S.kapiteltestPhaseResults[sektion] = {correct, total}
function startKapiteltest(einheit) {
  S.kapiteltestConfig = einheit;
  S.isKapiteltest = true;
  S.kapiteltestPhase = 'vokabeln';
  S.kapiteltestPhaseResults = {
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
  S.kapiteltestPhase = phaseName;

  if (phaseName === 'vokabeln') {
    // Build 15 vokabeln MC questions
    const alleKarten = [];
    S.aktivesKapitel.einheiten.forEach(e => {
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
    S.aktivesKapitel.einheiten.forEach(e => {
      if (e.typ === 'grammatik' && e.fragen) alleFragen.push(...e.fragen);
    });
    const sampled = shuffle([...alleFragen]).slice(0, 20);
    sampled.forEach(f => f.cat = 'Grammatik');
    startEinheitenQuiz(sampled);
  } else if (phaseName === 'dialog-text') {
    // Build queue: zufällige Dialog und Text einheiten
    S.kapiteltestUnitsQueue = [];
    const dialogs = shuffle(S.aktivesKapitel.einheiten.filter(e => e.typ === 'dialog')).slice(0, 1);
    const texts = shuffle(S.aktivesKapitel.einheiten.filter(e => e.typ === 'text')).slice(0, 1);
    dialogs.forEach(d => S.kapiteltestUnitsQueue.push({einheit: d, category: 'Dialog & Text'}));
    texts.forEach(t => S.kapiteltestUnitsQueue.push({einheit: t, category: 'Dialog & Text'}));

    if (S.kapiteltestUnitsQueue.length > 0) {
      startKapiteltestUnit();
    } else {
      goToKapiteltestPhase('hoeren');
    }
  } else if (phaseName === 'hoeren') {
    // Build queue: zufällige hoeren einheit(en)
    S.kapiteltestUnitsQueue = [];
    const hoerens = shuffle(S.aktivesKapitel.einheiten.filter(e => e.typ === 'hoeren')).slice(0, 1);
    hoerens.forEach(h => S.kapiteltestUnitsQueue.push({einheit: h, category: 'Hören'}));

    if (S.kapiteltestUnitsQueue.length > 0) {
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
  // WICHTIG: S.einheitenModus=true damit Quiz-Ende zu nextEinheit() führt.
  if (S.kapiteltestUnitsQueue.length === 0) {
    if (S.kapiteltestPhase === 'dialog-text') {
      goToKapiteltestPhase('hoeren');
    } else if (S.kapiteltestPhase === 'hoeren') {
      goToKapiteltestPhase('result');
    }
    return;
  }

  const {einheit, category} = S.kapiteltestUnitsQueue.shift();
  S.aktiveEinheit = einheit;
  S.aktiveEinheit._kapiteltestCategory = category;
  S.einheitenModus = true;

  if (einheit.typ === 'dialog') {
    startDialogScreen(einheit);
  } else if (einheit.typ === 'text') {
    startTextScreen(einheit);
  } else if (einheit.typ === 'hoeren') {
    startHoerenScreen(einheit);
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
    const raw = localStorage.getItem('srs-russian');
    if (raw) {
      S.srsData = JSON.parse(raw);
    } else {
      // Erster Start auf diesem Gerät: Lernstand aus srs-data.json übernehmen (Stand Mai 2026)
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
  S.state = 'srs-forecast-detail';
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

      for (const data of Object.values(S.srsData.cards)) {
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
    renderMenu();
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
  await srsSave();
  srsCheckLevelUp();

  S.srsBatchIdx++;
  if (S.srsBatchIdx < S.srsBatchQueue.length) {
    // More batches — show pause screen
    srsShowPause();
  } else if (S.srsLessonPhase === 'review') {
    // Lesson review done — cards were already updated during review via srsUpdateCard
    await srsSave();
    srsShowResult();
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
  zurueckZuEinheiten,
  startKarteikartenMitRichtung,
  karteGewusst,
  karteNochmal,
  srsReviewGewusst,
  srsReviewNochmal,
});

export {
  renderSprachen, sprachenMove, sprachenSelect,
  renderMenu, menuMove, menuSelect,
  einheitenMenuMove, einheitenMenuSelect,
  paketeMove, paketeSelect,
  startKarteikartenMitRichtung, aufdecken, karteGewusst, karteNochmal,
  zeigeHoerenFrage, selectHoerenAnswer, nextHoeren,
  zeigeTheorieKarte,
  zeigeDialogZeile,
  startEinheitenQuiz, nextEinheit,
  selectAnswer, nextQuestion,
  endMove, endSelect,
  srsBuildCardMap, srsLoad,
  srsShowDashboard, srsDashboardMove, srsDashboardSelect,
  srsLessonFlip, srsLessonNext,
  srsReviewFlip, srsReviewGewusst, srsReviewNochmal,
  srsPauseMove, srsPauseSelect, srsResultSelect,
};
