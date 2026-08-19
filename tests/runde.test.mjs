// Eine ganze Lernrunde von vorn bis hinten: Reviews beantworten, Ergebnis
// sehen, und danach muss die Tagesübersicht die neue Zahl zeigen. Genau das
// war beim Rundgang nicht nachprüfbar, weil die Testdaten falsche Schlüssel
// hatten und die Karten deshalb nie verschwanden.
import { setzeKarten, raeumeAuf } from './harness.mjs';

export const name = 'Lernrunde beantworten und die Tagesübersicht zieht nach';

export default async (app, soll) => {
  await raeumeAuf(app.nutzer.id);
  const H = 3600e3;
  await setzeKarten(app.nutzer.id, [
    { lang: 'kurdish', deck: 'kuwoerter', key: 'kuwort:ez·1', srs: 3, faelligIn: -2 * H },
    { lang: 'kurdish', deck: 'kuwoerter', key: 'kuwort:tu·2', srs: 6, faelligIn: -1 * H },
    { lang: 'french',  deck: 'frwoerter', key: 'fword:le',    srs: 5, faelligIn: -3 * H },
  ]);

  await app.oeffne();
  // Die Zahlen kommen nachgeladen; direkt nach dem Öffnen ist der Kasten leer.
  await app.page.waitForFunction(
    () => (document.getElementById('heute-panel')?.textContent || '').includes('fällig'),
    { timeout: 15000 });
  soll.enthaelt(await app.text('#heute-panel'), '3 jetzt fällig', 'vorher stehen drei an');

  await app.oeffneSprache('Kurdî');
  await app.page.locator('#tr-dash-list .menu-item', { hasText: 'Wörter' })
    .filter({ hasText: 'Reviews' }).first().click();
  await app.warte('#tr-card-screen.active');
  for (let i = 0; i < 2; i++) {
    await app.pedal('B');                       // aufdecken
    await app.page.waitForTimeout(200);
    await app.pedal('A');                       // gewusst
    await app.page.waitForTimeout(350);
  }
  await app.page.waitForTimeout(600);
  soll.gleich(await app.screen(), 'tr-result-screen', 'nach der letzten Karte kommt das Ergebnis');

  await app.page.waitForTimeout(3500);          // Sync abwarten (2,5 s Ruhe)
  await app.page.goto(app.url, { waitUntil: 'domcontentloaded' });
  await app.warte('#sprachen-screen.active', 20000);
  await app.page.waitForTimeout(1800);
  const panel = await app.text('#heute-panel');
  soll.enthaelt(panel, '1 jetzt fällig', `danach steht nur noch Französisch an (stand: ${panel})`);

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
