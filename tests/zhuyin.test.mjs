// Der Zhuyin-Schnelldurchlauf: alle Zeichen am Stück, falsche kommen wieder,
// und es entstehen KEINE SRS-Karten dabei.
import { raeumeAuf } from './harness.mjs';

export const name = 'Zhuyin-Schnelldurchlauf legt keine Karten an';

export default async (app, soll) => {
  await raeumeAuf(app.nutzer.id);
  await app.oeffne();
  await app.oeffneSprache('中文');
  const eintrag = app.page.locator('#tr-dash-list .menu-item', { hasText: 'Schnelldurchlauf' }).first();
  soll.wahr(await eintrag.count() > 0, 'der Schnelldurchlauf steht im Dashboard');
  await eintrag.click();
  await app.warte('#tr-card-screen.active');

  const anfang = Number((await app.text('#tr-counter'))?.replace(/\D/g, ''));
  soll.wahr(anfang > 30, `es geht mit allen Zeichen los (waren ${anfang})`);

  // Eine falsch beantworten — sie muss wiederkommen, der Zähler darf nicht sinken
  await app.pedal('B');                     // aufdecken
  await app.page.waitForTimeout(200);
  await app.pedal('C');                     // nochmal
  await app.page.waitForTimeout(300);
  soll.gleich(Number((await app.text('#tr-counter'))?.replace(/\D/g, '')), anfang,
    'eine falsche Karte bleibt im Stapel');

  // Und eine richtig — dann sinkt er
  await app.pedal('B'); await app.page.waitForTimeout(200);
  await app.pedal('A'); await app.page.waitForTimeout(300);
  soll.gleich(Number((await app.text('#tr-counter'))?.replace(/\D/g, '')), anfang - 1,
    'eine gewusste Karte verlässt den Stapel');

  // Nichts darf in der Datenbank gelandet sein
  await app.page.waitForTimeout(3500);
  const puffer = await app.page.evaluate(() => localStorage.getItem('srs-sync-puffer') || '{}');
  soll.wahr(!puffer.includes('zhuyin'), `der Durchlauf schreibt keine Karten (Puffer: ${puffer.slice(0, 80)})`);

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
