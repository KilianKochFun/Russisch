// Ein erreichtes Level bleibt erreicht — auch wenn Karten zurückfallen und die
// Guru-Quote danach unter der Schwelle liegt.
//
// Das ist Absicht und nicht Nachlässigkeit: Ein Level ist eine erreichte
// Etappe, keine laufende Messung. Wer es einmal geschafft hat, hat es
// geschafft; zurückgefallene Karten kommen als Reviews wieder, aber sie nehmen
// einem nicht den Fortschritt weg. WaniKani macht es genauso.
import { setzeKarten, raeumeAuf, SUPA_URL } from './harness.mjs';
import fs from 'node:fs';

export const name = 'Level bleibt, auch wenn die Guru-Quote wieder fällt';

export default async (app, soll) => {
  const key = fs.readFileSync(new URL('../.env', import.meta.url), 'utf-8')
    .split('\n').find(z => z.startsWith('SUPABASE_SECRET_KEY='))?.slice(20).trim();
  const H = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  await raeumeAuf(app.nutzer.id);

  // Level 2 erreicht, aber KEINE einzige Karte auf Guru — der schlimmste Fall.
  await fetch(`${SUPA_URL}/rest/v1/srs_decks`, {
    method: 'POST', headers: { ...H, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify([{ user_id: app.nutzer.id, lang: 'chinese-tw', deck: '__level',
                            unlocked_level: 2, updated_at: new Date().toISOString() }]),
  });
  await setzeKarten(app.nutzer.id, [
    { lang: 'chinese-tw', deck: 'radikale', key: 'component:一', srs: 1, faelligIn: -2 * 3600e3 },
    { lang: 'chinese-tw', deck: 'hanzi',    key: 'character:一', srs: 1, faelligIn: -2 * 3600e3 },
  ]);

  await app.oeffne();
  await app.oeffneSprache('中文');
  const vorher = (await app.text('#tr-dash-list')).replace(/\s+/g, ' ');
  soll.enthaelt(vorher, 'Level 2/', `Level 2 steht, obwohl 0 % auf Guru sind (stand: ${vorher.slice(0, 70)})`);

  // Noch einmal laden — es darf sich nichts nach unten bewegt haben
  await app.page.reload({ waitUntil: 'domcontentloaded' });
  await app.warte('#sprachen-screen.active', 20000);
  await app.oeffneSprache('中文');
  soll.enthaelt((await app.text('#tr-dash-list')).replace(/\s+/g, ' '), 'Level 2/',
    'auch nach dem Neuladen bleibt es Level 2');

  // Und in der Datenbank steht weiterhin 2, nicht 1
  const r = await fetch(
    `${SUPA_URL}/rest/v1/srs_decks?user_id=eq.${app.nutzer.id}&lang=eq.chinese-tw&deck=eq.__level&select=unlocked_level`,
    { headers: H });
  const [zeile] = await r.json();
  soll.gleich(zeile?.unlocked_level, 2, 'der gespeicherte Stand wurde nicht heruntergeschrieben');

  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
