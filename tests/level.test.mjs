// Zwei Zusagen, die vorher gebrochen wurden:
//   1. Ein erreichtes Level bleibt erreicht. Auch wenn Karten zurückfallen,
//      auch wenn die Abfrage fehlschlägt, auch offline.
//   2. Bei Mandarin teilen Radikale, Zeichen und Wörter EIN Level.
import { setzeKarten, raeumeAuf } from './harness.mjs';

export const name = 'Ein erreichtes Level bleibt erreicht, und Mandarin teilt es';

export default async (app, soll) => {
  await raeumeAuf(app.nutzer.id);
  await app.oeffne();
  await app.oeffneSprache('中文');
  await app.page.waitForTimeout(600);

  // Level künstlich hochsetzen, wie nach einem echten Aufstieg
  await app.page.evaluate(() => {
    const m = JSON.parse(localStorage.getItem('srs-level-hoechstmarke') || '{}');
    m['chinese-tw/__level'] = 3;
    localStorage.setItem('srs-level-hoechstmarke', JSON.stringify(m));
  });
  await app.page.reload({ waitUntil: 'domcontentloaded' });
  await app.warte('#sprachen-screen.active', 20000);
  await app.oeffneSprache('中文');
  await app.page.waitForTimeout(800);

  const zeilen = await app.page.$$eval('#tr-dash-list .menu-item',
    e => e.map(x => x.innerText.replace(/\s+/g, ' ')).filter(z => z.includes('Neue lernen')));
  soll.wahr(zeilen.length >= 2, `es gibt Deck-Zeilen mit Level (waren ${zeilen.length})`);
  for (const z of zeilen) {
    soll.enthaelt(z, 'Level 3/', `jedes Deck zeigt dasselbe Level 3 (Zeile: ${z})`);
  }

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
