// Bildschirmwechsel. Eine Zeile Arbeit, aber sie stand siebenmal im Projekt —
// in ui.js, trainer.js, buecher.js, vergleich.js und dreimal direkt im Code von
// forecast.js, main.js und input.js.
//
// Und die Kopien waren nicht gleich: Vier scrollten nach oben, drei nicht.
// Deshalb landete man je nach Bildschirm mal oben, mal in der Mitte der Seite —
// ein Verhalten, das niemand entschieden hat, es hat sich ergeben.
//
// Ausnahme mit Absicht: Die Übersicht merkt sich ihre Scrollposition und stellt
// sie nach dem Zurückkommen wieder her. Dafür gibt es `scrollen: false`.

export function zeigeScreen(id, { scrollen = true } = {}) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (!el) { console.warn('Bildschirm gibt es nicht:', id); return; }
  el.classList.add('active');
  if (scrollen) window.scrollTo(0, 0);
}
