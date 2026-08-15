// Von der Bestenliste ins Profil eines Nutzers — und wieder zurück, alles mit
// drei Tasten. Und die Zusage prüfen: im Profil stehen nur Zahlen.
export const name = 'Profil eines Nutzers öffnen und zurück';

export default async (app, soll) => {
  await app.oeffne();
  await app.oeffneSprache('Vergleich');
  soll.gleich(await app.screen(), 'vergleich-screen', 'die Bestenliste steht');

  const zeilen = await app.page.$$eval('#vergleich-content [data-nutzer]', e => e.length);
  soll.wahr(zeilen >= 2, `die Liste hat Einträge samt Zurück (waren ${zeilen})`);

  // Erste Zeile mit dem Pedal auswählen
  await app.pedal('B');
  await app.page.waitForTimeout(900);
  soll.gleich(await app.screen(), 'profil-screen', 'B öffnet das Profil');

  const inhalt = (await app.text('#profil-content'))?.replace(/\s+/g, ' ') || '';
  soll.enthaelt(inhalt, 'Karten im Umlauf', `das Profil zeigt Zahlen (stand: ${inhalt.slice(0, 90)})`);
  soll.wahr(!/undefined|NaN/.test(inhalt), 'kein undefined und kein NaN im Profil');

  // B führt zurück zur Bestenliste
  await app.pedal('B');
  await app.page.waitForTimeout(700);
  soll.gleich(await app.screen(), 'vergleich-screen', 'B führt zurück zur Bestenliste');

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
