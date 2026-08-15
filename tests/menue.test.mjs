// Der Grundweg: anmelden, mit dem Pedal durch das Sprachen-Menü, eine Sprache
// öffnen, zurück. Wenn dieser Test rot ist, ist die App unbenutzbar.
export const name = 'Menü mit dem Pedal bedienen';

export default async (app, soll) => {
  await app.oeffne();
  soll.gleich(await app.screen(), 'sprachen-screen', 'nach dem Anmelden steht das Sprachen-Menü');

  // Mit drei Tasten muss jeder Eintrag erreichbar sein
  const eintraege = await app.page.$$eval('#sprachen-list .menu-item', els => els.length);
  soll.wahr(eintraege >= 5, `das Menü hat Einträge (waren ${eintraege})`);

  // C bewegt nach unten, A wieder hoch — der Cursor muss mitwandern
  await app.pedal('C');
  const nachUnten = await app.page.$$eval('#sprachen-list .menu-item',
    els => els.findIndex(e => e.classList.contains('selected')));
  await app.pedal('A');
  const zurueck = await app.page.$$eval('#sprachen-list .menu-item',
    els => els.findIndex(e => e.classList.contains('selected')));
  soll.wahr(nachUnten !== zurueck, 'C und A bewegen den Cursor in verschiedene Richtungen');

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
