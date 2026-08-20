// Die Rückmeldeschleife: aus der App melden, und die Antwort kommt zurück auf
// die Karte. Beides muss gehen, sonst schreibt man nie eine zweite Meldung.
import { SUPA_URL, raeumeAuf } from './harness.mjs';
import fs from 'node:fs';

export const name = 'Karte melden und die Antwort erscheint darunter';

export default async (app, soll) => {
  const key = fs.readFileSync(new URL('../.env', import.meta.url), 'utf-8')
    .split('\n').find(z => z.startsWith('SUPABASE_SECRET_KEY='))?.slice(20).trim();
  const H = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  await fetch(`${SUPA_URL}/rest/v1/meldungen?user_id=eq.${app.nutzer.id}`, { method: 'DELETE', headers: H });

  await app.oeffne();
  await app.oeffneSprache('Kurdî');
  await app.page.locator('#tr-dash-list .menu-item', { hasText: 'Neue lernen' }).first().click();
  await app.warte('#tr-card-screen.active');
  await app.pedal('B');                                  // aufdecken
  await app.warte('.melde-knopf');

  const TEXT = 'Testmeldung ' + Date.now();
  app.page.once('dialog', d => d.accept(TEXT));
  await app.klick('.melde-knopf');
  await app.page.waitForTimeout(900);

  // Die Karte darf nicht weitergesprungen sein
  soll.gleich(await app.screen(), 'tr-card-screen', 'die Karte bleibt stehen, während man meldet');
  soll.enthaelt(await app.text('#tr-back'), TEXT, 'die Meldung steht unter der Karte');

  // Antworten, wie ich es später über scripts/meldungen.js tue
  const r = await fetch(`${SUPA_URL}/rest/v1/meldungen?user_id=eq.${app.nutzer.id}&select=id`, { headers: H });
  const [m] = await r.json();
  soll.wahr(!!m, 'die Meldung ist in der Datenbank angekommen');
  await fetch(`${SUPA_URL}/rest/v1/meldungen?id=eq.${m.id}`, {
    method: 'PATCH', headers: H,
    body: JSON.stringify({ status: 'geaendert', antwort: 'Stimmt, ist korrigiert.' }),
  });

  // Neu laden — die Antwort muss auf der Karte stehen
  await app.page.reload({ waitUntil: 'domcontentloaded' });
  await app.warte('#sprachen-screen.active', 20000);
  await app.oeffneSprache('Kurdî');
  await app.page.locator('#tr-dash-list .menu-item', { hasText: 'Übersicht' }).first().click();
  await app.warte('#tr-browse-screen.active');
  await app.page.locator('#tr-browse-content span[data-key]').first().click();
  await app.warte('#tr-detail-screen.active');
  const detail = await app.text('#tr-detail-content');
  soll.enthaelt(detail, 'Stimmt, ist korrigiert.', 'die Antwort steht auf der Detailseite');
  soll.enthaelt(detail, 'GEÄNDERT', 'der Status steht dabei');

  await fetch(`${SUPA_URL}/rest/v1/meldungen?user_id=eq.${app.nutzer.id}`, { method: 'DELETE', headers: H });
  soll.leer(app.fehlerInKonsole(), 'keine Fehler in der Browser-Konsole');
};
