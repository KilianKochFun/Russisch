// Regressionstest für den Zählerfehler vom 15. August: Die Tagesübersicht
// zählte jede Karte, deren next_review in der Vergangenheit liegt. Der Trainer
// zählt aber nur Stufe 1 bis 8 — eine Karte, die auf Stufe 0 zurückgefallen
// ist, gehört in den Lektionsstapel. Im Menü stand „1 fällig“, im Trainer war
// nichts.
import { setzeKarten, raeumeAuf } from './harness.mjs';

export const name = 'Tagesübersicht zählt zurückgefallene Karten nicht als Review';

export default async (app, soll) => {
  await raeumeAuf(app.nutzer.id);

  const STUNDE = 3600e3;
  await setzeKarten(app.nutzer.id, [
    // Genau der Fall, der falsch gezählt wurde: zurückgefallen, Termin in der
    // Vergangenheit. Darf NICHT als fällig erscheinen.
    { lang: 'kurdish', deck: 'kuwoerter', key: 'kuwort:ez·1',  srs: 0, faelligIn: -2 * STUNDE },
    // Zwei echte Reviews
    { lang: 'kurdish', deck: 'kuwoerter', key: 'kuwort:tu·2',  srs: 3, faelligIn: -1 * STUNDE },
    { lang: 'kurdish', deck: 'kuwoerter', key: 'kuwort:ew·3',  srs: 5, faelligIn: -30 * 60e3 },
    // Nicht fällig, aber heute noch — je nach Uhrzeit; darf nie „jetzt“ sein
    { lang: 'kurdish', deck: 'kuwoerter', key: 'kuwort:em·4',  srs: 2, faelligIn: 30 * 24 * STUNDE },
    // Gebrannt: kommt nie wieder
    { lang: 'kurdish', deck: 'kuwoerter', key: 'kuwort:hûn·5', srs: 9 },
  ]);

  await app.oeffne();
  await app.warte('#heute-panel');
  const panel = await app.text('#heute-panel');
  soll.enthaelt(panel, '2 jetzt fällig', `die Übersicht zählt genau die zwei echten Reviews (stand: ${panel})`);

  // Und die Gegenprobe im Trainer selbst: dort muss dieselbe Zahl stehen.
  await app.oeffneSprache('Kurdî');
  // Die Karten liegen im Wörter-Deck; die erste Review-Zeile gehört dem
  // Alfabe-Deck und steht zu Recht auf 0.
  const reviewZeile = (await app.page
    .locator('#tr-dash-list .menu-item', { hasText: 'Wörter' })
    .filter({ hasText: 'Reviews' }).first().innerText()).replace(/\s+/g, ' ').trim();
  soll.enthaelt(reviewZeile, '2 fällig', `der Trainer zählt genauso (stand: ${reviewZeile})`);

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
