// Zwei Zusagen, die zusammengehören:
//
//   1. Karten eines Decks, das es nicht mehr gibt, zählen nicht als fällig.
//      Als Zhuyin zum Schnelldurchlauf wurde, blieben seine SRS-Zeilen liegen
//      und die Tagesübersicht meldete sie weiter — eine Zahl, die nie kleiner
//      wird, weil es kein Deck mehr gibt, in dem man sie abarbeiten könnte.
//
//   2. Ein Level, das der Server niedriger meldet, gilt. Die Höchstmarke soll
//      verhindern, dass ein fehlgeschlagener Ladevorgang das Level neu von
//      unten herleitet — sie darf aber keine bewusste Korrektur blockieren.
import { setzeKarten, raeumeAuf, SUPA_URL } from './harness.mjs';
import fs from 'node:fs';

export const name = 'Verwaiste Karten zählen nicht, und ein korrigiertes Level gilt';

export default async (app, soll) => {
  const key = fs.readFileSync(new URL('../.env', import.meta.url), 'utf-8')
    .split('\n').find(z => z.startsWith('SUPABASE_SECRET_KEY='))?.slice(20).trim();
  const H = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  await raeumeAuf(app.nutzer.id);

  const H_MS = 3600e3;
  await setzeKarten(app.nutzer.id, [
    // ein echtes Review
    { lang: 'chinese-tw', deck: 'radikale', key: 'component:一', srs: 3, faelligIn: -2 * H_MS },
    // und drei Karten eines Decks, das es nicht mehr gibt
    { lang: 'chinese-tw', deck: 'zhuyin', key: 'zhuyin:ㄅ', srs: 3, faelligIn: -2 * H_MS },
    { lang: 'chinese-tw', deck: 'zhuyin', key: 'zhuyin:ㄆ', srs: 4, faelligIn: -3 * H_MS },
    { lang: 'chinese-tw', deck: 'zhuyin', key: 'zhuyin:ㄇ', srs: 2, faelligIn: -1 * H_MS },
  ]);

  await app.oeffne();
  await app.page.waitForFunction(
    () => (document.getElementById('heute-panel')?.textContent || '').includes('fällig'),
    { timeout: 15000 });
  const panel = await app.text('#heute-panel');
  soll.enthaelt(panel, '1 jetzt fällig',
    `nur das echte Review zählt, nicht die drei verwaisten Zhuyin-Karten (stand: ${panel})`);

  // Level: Server sagt 3, danach korrigiert auf 1 — die Korrektur muss greifen
  const setzeLevel = (n) => fetch(`${SUPA_URL}/rest/v1/srs_decks`, {
    method: 'POST', headers: { ...H, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify([{ user_id: app.nutzer.id, lang: 'chinese-tw', deck: '__level',
                            unlocked_level: n, updated_at: new Date().toISOString() }]),
  });
  await setzeLevel(3);
  await app.page.reload({ waitUntil: 'domcontentloaded' });
  await app.warte('#sprachen-screen.active', 20000);
  await app.oeffneSprache('中文');
  soll.enthaelt((await app.text('#tr-dash-list')).replace(/\s+/g, ' '), 'Level 3/',
    'der Server-Stand 3 kommt an');

  await setzeLevel(1);
  await app.page.reload({ waitUntil: 'domcontentloaded' });
  await app.warte('#sprachen-screen.active', 20000);
  await app.oeffneSprache('中文');
  const nachher = (await app.text('#tr-dash-list')).replace(/\s+/g, ' ');
  soll.enthaelt(nachher, 'Level 1/',
    `die Korrektur nach unten greift, die Höchstmarke blockiert sie nicht (stand: ${nachher.slice(0, 80)})`);

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
