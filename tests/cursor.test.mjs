// Mit drei Pedaltasten ist jede Zeile, an der man vorbeimuss, Arbeit. Also
// steht der Cursor beim Öffnen auf einer Sprache, in der etwas fällig ist —
// nicht stur auf der ersten.
import { setzeKarten, raeumeAuf } from './harness.mjs';

export const name = 'Der Menü-Cursor steht auf der Sprache mit Reviews';

export default async (app, soll) => {
  await raeumeAuf(app.nutzer.id);
  // Nur bei Kurdisch etwas fällig — Mandarin steht im Menü davor.
  await setzeKarten(app.nutzer.id, [
    { lang: 'kurdish', deck: 'kuwoerter', key: 'kuwort:ez·1', srs: 3, faelligIn: -2 * 3600e3 },
  ]);

  await app.oeffne();                 // meldet an, falls noch nicht geschehen
  // Frisch laden: Der Cursor wird nur einmal je Seitenaufruf gesetzt, und die
  // Karten oben sind erst danach da.
  await app.page.reload({ waitUntil: 'domcontentloaded' });
  await app.warte('#sprachen-screen.active', 20000);
  await app.page.waitForTimeout(1500);          // die Zahlen kommen nachgeladen

  const gewaehlt = await app.page.$$eval('#sprachen-list .menu-item',
    els => els.find(e => e.classList.contains('selected'))?.innerText.replace(/\s+/g, ' ').trim() ?? null);
  soll.enthaelt(gewaehlt, 'Kurdî', `der Cursor steht auf der fälligen Sprache (stand auf: ${gewaehlt})`);

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
