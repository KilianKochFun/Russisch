// Regressionstest für den Fehler vom 14. August: Auf kurdischen Wortkarten
// stand „undefined“, weil der Typ in keiner der vier Verzweigungsketten von
// frontHtml/backHtml stand und bis in den Mandarin-Zweig durchfiel.
export const name = 'Kurdische Karten zeigen Wort und Bedeutung';

export default async (app, soll) => {
  await app.oeffne();
  await app.oeffneSprache('Kurdî');
  soll.gleich(await app.screen(), 'tr-dashboard-screen', 'das kurdische Dashboard steht');

  // Ersten „Neue lernen“-Eintrag anklicken
  const lernen = app.page.locator('#tr-dash-list .menu-item', { hasText: 'Neue lernen' }).first();
  await lernen.click();
  await app.warte('#tr-card-screen.active');

  const vorne = await app.text('#tr-front .karte-wort');
  soll.wahr(vorne && vorne.length > 0, 'die Vorderseite zeigt ein Wort');
  soll.wahr(!/undefined/.test(vorne), `die Vorderseite zeigt kein „undefined“ (war: ${vorne})`);

  await app.pedal('B');                       // aufdecken
  await app.page.waitForTimeout(250);
  const hinten = await app.text('#tr-back');
  soll.wahr(hinten && hinten.length > 0, 'die Rückseite hat Inhalt');
  soll.wahr(!/undefined/.test(hinten), `die Rückseite zeigt kein „undefined“ (war: ${hinten?.slice(0,80)})`);

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
