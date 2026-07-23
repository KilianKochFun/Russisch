// Eingabe — Phase 1: nur der bestehende A/B/C-keydown-Handler (Pedal).
// Phase 3 ergänzt hier die Aktions-Schicht + Touch- und Tastatur/Maus-Modi.
import { S } from './state.js';
import { speak } from './tts.js';
import {
  sprachenMove, sprachenSelect,
  menuMove, menuSelect,
  einheitenMenuMove, einheitenMenuSelect,
  paketeMove, paketeSelect,
  startKarteikartenMitRichtung, aufdecken, karteGewusst, karteNochmal,
  zeigeHoerenFrage, selectHoerenAnswer, nextHoeren,
  zeigeTheorieKarte,
  zeigeDialogZeile,
  startEinheitenQuiz, nextEinheit,
  selectAnswer, nextQuestion,
  endMove, endSelect,
  srsShowDashboard, srsDashboardMove, srsDashboardSelect,
  srsLessonFlip, srsLessonNext,
  srsReviewFlip, srsReviewGewusst, srsReviewNochmal,
  srsPauseMove, srsPauseSelect, srsResultSelect,
} from './ui.js';

export function initInput() {
  document.addEventListener('keydown', (e) => {
    // In Formularfeldern (Login) normal tippen lassen
    if (e.target instanceof Element && e.target.closest('input, textarea, select')) return;
    const key = e.key.toUpperCase();
    if (key !== 'A' && key !== 'B' && key !== 'C') return;
    e.preventDefault();

    if (S.state === 'sprachen-menu') {
      if (key === 'A') sprachenMove(-1);
      else if (key === 'C') sprachenMove(1);
      else if (key === 'B') sprachenSelect();

    } else if (S.state === 'menu') {
      if (key === 'A') menuMove(-1);
      else if (key === 'C') menuMove(1);
      else if (key === 'B') menuSelect();

    } else if (S.state === 'einheiten-menu') {
      if (key === 'A') einheitenMenuMove(-1);
      else if (key === 'C') einheitenMenuMove(1);
      else if (key === 'B') einheitenMenuSelect();

    } else if (S.state === 'pakete-menu') {
      if (key === 'A') paketeMove(-1);
      else if (key === 'C') paketeMove(1);
      else if (key === 'B') paketeSelect();

    } else if (S.state === 'richtung-wahl') {
      if (key === 'A') startKarteikartenMitRichtung('ru-de');
      else if (key === 'B') startKarteikartenMitRichtung('mc');
      else if (key === 'C') startKarteikartenMitRichtung('de-ru');

    } else if (S.state === 'karte-front') {
      aufdecken();

    } else if (S.state === 'karte-back') {
      if (key === 'A') karteGewusst();
      else if (key === 'C') karteNochmal();
      else karteGewusst(); // B = auch als gewusst

    } else if (S.state === 'hoeren-lauschen') {
      if (key === 'B') zeigeHoerenFrage();
      else speak(S.aktiveEinheit.aufgaben[S.hoerenIdx].audio);

    } else if (S.state === 'hoeren-frage') {
      if (key === 'A') selectHoerenAnswer(0);
      else if (key === 'B') selectHoerenAnswer(1);
      else if (key === 'C') selectHoerenAnswer(2);

    } else if (S.state === 'hoeren-beantwortet') {
      if (key === 'B') nextHoeren();

    } else if (S.state === 'theorie') {
      if (key === 'A') { window.scrollBy({ top: -120, behavior: 'smooth' }); }
      else if (key === 'C') { window.scrollBy({ top: 120, behavior: 'smooth' }); }
      else if (key === 'B') {
        if (S.theorieKarteIdx < S.aktiveEinheit.karten.length - 1) {
          S.theorieKarteIdx++;
          zeigeTheorieKarte();
        } else {
          nextEinheit();
        }
      }

    } else if (S.state === 'dialog-lesen') {
      if (key === 'B') zeigeDialogZeile();
      else if (key === 'A') { window.scrollBy({ top: -120, behavior: 'smooth' }); }
      else if (key === 'C') { window.scrollBy({ top: 120, behavior: 'smooth' }); }

    } else if (S.state === 'dialog-fertig') {
      if (key === 'B') startEinheitenQuiz(S.aktiveEinheit.fragen);
      else if (key === 'A') { window.scrollBy({ top: -120, behavior: 'smooth' }); }
      else if (key === 'C') { window.scrollBy({ top: 120, behavior: 'smooth' }); }

    } else if (S.state === 'dialog-review') {
      if (key === 'B') nextEinheit();
      else if (key === 'A') { window.scrollBy({ top: -120, behavior: 'smooth' }); }
      else if (key === 'C') { window.scrollBy({ top: 120, behavior: 'smooth' }); }

    } else if (S.state === 'text-review') {
      if (key === 'B') nextEinheit();
      else if (key === 'A') { window.scrollBy({ top: -120, behavior: 'smooth' }); }
      else if (key === 'C') { window.scrollBy({ top: 120, behavior: 'smooth' }); }

    } else if (S.state === 'text-lesen') {
      if (key === 'B') {
        if (S.aktiveEinheit.fragen && S.aktiveEinheit.fragen.length > 0) {
          startEinheitenQuiz(S.aktiveEinheit.fragen);
        } else {
          nextEinheit();
        }
      } else if (key === 'A') { window.scrollBy({ top: -100, behavior: 'smooth' }); }
      else if (key === 'C') { window.scrollBy({ top: 100, behavior: 'smooth' }); }

    } else if (S.state === 'quiz-answering') {
      if (key === 'A') selectAnswer(0);
      else if (key === 'B') selectAnswer(1);
      else if (key === 'C') selectAnswer(2);

    } else if (S.state === 'quiz-answered') {
      nextQuestion();

    } else if (S.state === 'end') {
      if (key === 'A') endMove(-1);
      else if (key === 'C') endMove(1);
      else if (key === 'B') endSelect();

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
      if (key === 'A') srsReviewGewusst();
      else if (key === 'C') srsReviewNochmal();
      else srsReviewGewusst(); // B = gewusst

    } else if (S.state === 'srs-pause') {
      if (key === 'A') srsPauseMove(-1);
      else if (key === 'C') srsPauseMove(1);
      else if (key === 'B') srsPauseSelect();

    } else if (S.state === 'srs-result') {
      if (key === 'B') srsResultSelect();

    } else if (S.state === 'srs-forecast-detail') {
      if (key === 'A') window.scrollBy({ top: -200, behavior: 'smooth' });
      else if (key === 'C') window.scrollBy({ top: 200, behavior: 'smooth' });
      else if (key === 'B') srsShowDashboard();

    } else if (S.state === 'srs-browse') {
      if (key === 'A') window.scrollBy({ top: -200, behavior: 'smooth' });
      else if (key === 'C') window.scrollBy({ top: 200, behavior: 'smooth' });
      else if (key === 'B') srsShowDashboard();
    }
  });
}
