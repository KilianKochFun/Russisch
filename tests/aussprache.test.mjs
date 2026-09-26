// Mandarin spricht aus der Aufnahme im Bucket `audio`, nicht mit der Browser-Stimme.
// Die klang für zh-TW nach nichts Echtem — deshalb scripts/audio_zh.js.
export const name = 'Mandarin-Zeichen spielen die Aufnahme aus dem Bucket, nicht die Browser-Stimme';

export default async (app, soll) => {
  // Mitschreiben, ob die Browser-Stimme doch drankommt
  await app.page.addInitScript(() => {
    window.__stimme = [];
    const echt = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => { window.__stimme.push(u.text); echt(u); };
  });
  const aufnahmen = [];
  app.page.on('response', r => {
    if (r.url().includes('/storage/v1/object/audio/')) aufnahmen.push(r.status());
  });

  await app.oeffne();
  await app.oeffneSprache('中文');
  await app.page.locator('#tr-dash-list .menu-item', { hasText: 'Übersicht' }).first().click();
  await app.warte('#tr-browse-screen.active');
  await app.page.locator('#tr-browse-content span[data-key^="character:"]').first().click();
  await app.warte('#tr-detail-screen.active');
  await app.page.waitForTimeout(2000);

  soll.gleich(aufnahmen[0], 200, 'die Aufnahme wurde aus dem Bucket geladen');
  soll.gleich(await app.page.evaluate(() => window.__stimme.length), 0, 'die Browser-Stimme blieb still');
  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
