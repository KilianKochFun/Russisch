// Mit dem Pedal gibt es kein Mausrad: Die Seite muss dem Cursor folgen.
export const name = 'Die Seite scrollt mit, wenn der Pedal-Cursor aus dem Bild läuft';

export default async (app, soll) => {
  await app.page.setViewportSize({ width: 400, height: 450 });
  await app.oeffne();
  await app.oeffneSprache('中文');

  const sichtbar = () => app.page.evaluate(() => {
    const r = document.querySelector('.screen.active .selected').getBoundingClientRect();
    return r.top >= 0 && r.bottom <= innerHeight;
  });

  for (let i = 0; i < 12; i++) await app.pedal('C');
  await app.page.waitForTimeout(800);
  soll.enthaelt(await app.text('.screen.active .selected'), 'Sprachen', 'der Cursor steht unten auf „← Sprachen“');
  soll.wahr(await sichtbar(), 'die markierte Zeile unten ist im Bild');

  for (let i = 0; i < 12; i++) await app.pedal('A');
  await app.page.waitForTimeout(800);
  soll.wahr(await sichtbar(), 'nach dem Zurücklaufen ist die markierte Zeile oben im Bild');

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
