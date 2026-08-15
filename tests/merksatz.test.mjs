// Eigene Merksätze: eintragen, es steht da, nach dem Neuladen immer noch.
export const name = 'Eigener Merksatz wird gespeichert und überlebt das Neuladen';

export default async (app, soll) => {
  await app.oeffne();
  await app.oeffneSprache('Kurdî');
  await app.page.locator('#tr-dash-list .menu-item', { hasText: 'Neue lernen' }).first().click();
  await app.warte('#tr-card-screen.active');
  await app.pedal('B');                                   // aufdecken
  await app.warte('.mein-merksatz');

  const TEXT = 'Testmerksatz ' + Date.now();
  app.page.once('dialog', d => d.accept(TEXT));           // prompt() beantworten
  await app.klick('.mein-merksatz');
  await app.page.waitForTimeout(600);
  soll.enthaelt(await app.text('.mein-merksatz'), TEXT, 'der Merksatz steht auf der Karte');

  // Neu laden und über die Übersicht zur Detailseite — dort muss er auch stehen
  await app.page.reload({ waitUntil: 'domcontentloaded' });
  await app.warte('#sprachen-screen.active', 20000);
  await app.oeffneSprache('Kurdî');
  await app.page.locator('#tr-dash-list .menu-item', { hasText: 'Übersicht' }).first().click();
  await app.warte('#tr-browse-screen.active');
  await app.page.locator('#tr-browse-content span[data-key]').first().click();
  await app.warte('#tr-detail-screen.active');
  soll.enthaelt(await app.text('#tr-detail-content'), TEXT, 'der Merksatz steht auch auf der Detailseite');

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
