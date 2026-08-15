// Auf jedem Zustand der Karte muss ein sichtbarer Knopf stehen, der sagt, wo
// man hindrückt. Vorher trug die Vorderseite gar keinen und die
// Lektionsrückseite nur einen grauen Hinweistext.
export const name = 'Jede Kartenseite hat einen sichtbaren Knopf';

export default async (app, soll) => {
  await app.oeffne();
  await app.oeffneSprache('Kurdî');
  await app.page.locator('#tr-dash-list .menu-item', { hasText: 'Neue lernen' }).first().click();
  await app.warte('#tr-card-screen.active');

  soll.wahr(await app.sichtbar('#tr-aufdecken-buttons'), 'die Vorderseite zeigt einen Aufdecken-Knopf');
  soll.wahr(!await app.sichtbar('#tr-weiter-buttons'), 'der Weiter-Knopf ist vorne noch verborgen');

  await app.klick('#tr-aufdecken-buttons button');
  await app.page.waitForTimeout(250);
  soll.wahr(await app.sichtbar('#tr-weiter-buttons'), 'die Rückseite zeigt einen Weiter-Knopf');
  soll.wahr(!await app.sichtbar('#tr-aufdecken-buttons'), 'der Aufdecken-Knopf ist hinten verborgen');

  // Und der Knopf tut auch, was draufsteht
  const vorher = await app.text('#tr-counter');
  await app.klick('#tr-weiter-buttons button');
  await app.page.waitForTimeout(300);
  soll.wahr(await app.text('#tr-counter') !== vorher, 'der Weiter-Knopf blättert zur nächsten Karte');

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
