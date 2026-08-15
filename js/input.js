// Eingabe: 3-Tasten-Pedal (frei belegbar) + Tastatur; Maus/Touch läuft über
// die klickbaren Elemente in den Screens selbst.
// Standard-Belegung A/B/C — umbelegen über "Pedal-Tasten belegen" im Sprachen-Menü.
import { S } from './state.js';
import { getSetting, setSetting } from './progress.js';
import {
  sprachenMove, sprachenSelect, renderSprachen,
  srsShowDashboard, srsDashboardMove, srsDashboardSelect,
  srsLessonFlip, srsLessonNext,
  srsReviewFlip, srsReviewGewusst, srsReviewNochmal,
  srsPauseMove, srsPauseSelect, srsResultSelect,
} from './ui.js';
import {
  trainerDashMove, trainerDashSelect, trFlip, trNext, trGewusst, trNochmal, trBackToDash,
  trRueckgaengig,
  trZurueckZurUebersicht,
} from './trainer.js';
import { zeigeScreen } from './screen.js';

// ── Pedal-Belegung ──────────────────────────────────────────────────────────
const STANDARD_PEDALE = { A: 'A', B: 'B', C: 'C' };

function normKey(k) { return k.length === 1 ? k.toUpperCase() : k; }

function pedalVon(key) {
  const map = getSetting('pedalKeys') || STANDARD_PEDALE;
  for (const pedal of ['A', 'B', 'C']) {
    if (map[pedal] === key) return pedal;
  }
  return null;
}

// Setup-Modus: nacheinander Pedal 1/2/3 drücken
let _setupSlot = 0;
const _setupMap = {};

export function startePedalSetup() {
  S.state = 'pedal-setup';
  _setupSlot = 0;
  zeigeScreen('pedal-setup-screen');
  zeigePedalSlot();
}

function zeigePedalSlot() {
  const labels = ['Pedal A (hoch / gewusst)', 'Pedal B (auswählen / weiter)', 'Pedal C (runter / nochmal)'];
  document.getElementById('pedal-setup-text').textContent =
    _setupSlot < 3 ? `Drücke jetzt die Taste für ${labels[_setupSlot]} …` : '';
}

function pedalSetupKey(key) {
  const pedal = ['A', 'B', 'C'][_setupSlot];
  _setupMap[pedal] = key;
  _setupSlot++;
  if (_setupSlot >= 3) {
    setSetting('pedalKeys', { ..._setupMap });
    document.getElementById('pedal-setup-text').textContent =
      `Gespeichert: A=${_setupMap.A} · B=${_setupMap.B} · C=${_setupMap.C}`;
    setTimeout(() => renderSprachen(), 1200);
  } else {
    zeigePedalSlot();
  }
}

window.startePedalSetup = startePedalSetup;

// ── Tasten-Dispatcher ───────────────────────────────────────────────────────
export function initInput() {
  document.addEventListener('keydown', (e) => {
    // In Formularfeldern (Login) normal tippen lassen
    if (e.target instanceof Element && e.target.closest('input, textarea, select')) return;

    const raw = normKey(e.key);

    if (S.state === 'pedal-setup') {
      e.preventDefault();
      pedalSetupKey(raw);
      return;
    }

    const key = pedalVon(raw);
    if (!key) return;
    e.preventDefault();

    if (S.state === 'sprachen-menu') {
      if (key === 'A') sprachenMove(-1);
      else if (key === 'C') sprachenMove(1);
      else if (key === 'B') sprachenSelect();

    } else if (S.state === 'forecast') {
      if (key === 'A') window.forecastMove?.(-1);
      else if (key === 'C') window.forecastMove?.(1);
      else if (key === 'B') window.forecastSelect?.();

    } else if (S.state === 'vergleich') {
      if (key === 'A') window.scrollBy({ top: -200, behavior: 'smooth' });
      else if (key === 'C') window.scrollBy({ top: 200, behavior: 'smooth' });
      else if (key === 'B') window.renderSprachenGlobal?.();

    } else if (S.state === 'buecher-liste') {
      if (key === 'A') window.buecherMove?.(-1);
      else if (key === 'C') window.buecherMove?.(1);
      else if (key === 'B') window.buecherSelect?.();

    } else if (S.state === 'buch-viewer') {
      // Im PDF selbst scrollt der Browser-Viewer (Maus/Touch) — die Pedale
      // bringen einen nur wieder heraus bzw. laden das Buch herunter.
      if (key === 'B') window.buchHerunterladen?.();
      else window.buchZurueck?.();

    } else if (S.state === 'srs-dashboard') {
      if (key === 'A') srsDashboardMove(-1);
      else if (key === 'C') srsDashboardMove(1);
      else if (key === 'B') srsDashboardSelect();

    } else if (S.state === 'srs-lesson-front') {
      srsLessonFlip();

    } else if (S.state === 'srs-lesson-back') {
      srsLessonNext();

    } else if (S.state === 'srs-review-front') {
      srsReviewFlip();

    } else if (S.state === 'srs-review-back') {
      if (key === 'C') srsReviewNochmal();
      else srsReviewGewusst(); // A und B = gewusst

    } else if (S.state === 'srs-pause') {
      if (key === 'A') srsPauseMove(-1);
      else if (key === 'C') srsPauseMove(1);
      else if (key === 'B') srsPauseSelect();

    } else if (S.state === 'srs-result') {
      if (key === 'B') srsResultSelect();

    } else if (S.state === 'srs-browse') {
      if (key === 'A') window.scrollBy({ top: -200, behavior: 'smooth' });
      else if (key === 'C') window.scrollBy({ top: 200, behavior: 'smooth' });
      else if (key === 'B') srsShowDashboard();

    } else if (S.state === 'tr-dashboard') {
      if (key === 'A') trainerDashMove(-1);
      else if (key === 'C') trainerDashMove(1);
      else if (key === 'B') trainerDashSelect();

    } else if (S.state === 'tr-review-front') {
      // A nimmt die letzte Antwort zurück, solange es eine gibt — mit Pedalen
      // verdrückt man sich, und eine falsche Antwort kostet zwei Stufen.
      if (key === 'A' && trRueckgaengig()) return;
      trFlip();

    } else if (S.state === 'tr-lesson-front') {
      trFlip();

    } else if (S.state === 'tr-lesson-back') {
      trNext();

    } else if (S.state === 'tr-review-back') {
      if (key === 'C') trNochmal();
      else trGewusst(); // A und B = gewusst

    } else if (S.state === 'tr-result') {
      trBackToDash();

    } else if (S.state === 'tr-stats') {
      if (key === 'A') window.scrollBy({ top: -200, behavior: 'smooth' });
      else if (key === 'C') window.scrollBy({ top: 200, behavior: 'smooth' });
      else if (key === 'B') trBackToDash();

    } else if (S.state === 'tr-browse') {
      if (key === 'A') window.scrollBy({ top: -200, behavior: 'smooth' });
      else if (key === 'C') window.scrollBy({ top: 200, behavior: 'smooth' });
      else if (key === 'B') trBackToDash();

    } else if (S.state === 'tr-detail') {
      if (key === 'A') window.scrollBy({ top: -200, behavior: 'smooth' });
      else if (key === 'C') window.scrollBy({ top: 200, behavior: 'smooth' });
      else if (key === 'B') trZurueckZurUebersicht();
    }
  });
}
