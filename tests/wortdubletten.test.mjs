// Einzeichige Wörter sind erlaubt — aber nur, wenn sie WIRKLICH Wörter sind.
//
// Die Geschichte dahinter: Zuerst waren sie draußen (Dubletten der
// Zeichenkarten), dann wieder drin, weil eine Wiederholung kein Schaden ist,
// solange das Wort benutzt wird. Die Grenze zieht die Wortart aus der
// TOCFL-Tabelle: Partikeln stehen nie allein.
//
// Dieser Test hält fest, was dabei schiefgehen kann: Partikeln als Wortkarte,
// und Bedeutungen, die keine sind ("(wird zur Betonung verwendet)").
import { SUPA_URL } from './harness.mjs';
import fs from 'node:fs';

export const name = 'Wortkarten sind echte Wörter mit echter Bedeutung';

export default async (app, soll) => {
  const key = fs.readFileSync(new URL('../.env', import.meta.url), 'utf-8')
    .split('\n').find(z => z.startsWith('SUPABASE_SECRET_KEY='))?.slice(20).trim();
  const r = await fetch(`${SUPA_URL}/rest/v1/vocab_items?language=eq.chinese-tw&item_type=eq.word&select=level,data`,
    { headers: { apikey: key, Authorization: 'Bearer ' + key } });
  const woerter = await r.json();

  soll.wahr(woerter.length > 100, `es gibt genug Wörter (waren ${woerter.length})`);

  // Keine Bedeutung, die NUR aus einer Klammer besteht. Eine Klammer davor ist
  // in Ordnung: „(Höflichkeitsform) Sie“ sagt sehr wohl, was 您 heißt.
  const klammer = woerter.filter(w => /^\s*\([^)]*\)\s*$/.test(w.data.de || ''));
  soll.leer(klammer.map(w => `${w.data.zeichen}: ${w.data.de}`),
    'keine Karte hat eine reine Klammer-Erklärung als Bedeutung');

  // Kein Alltagswort wird als FAMILIENNAME erklärt — 那 heißt „jene“, nicht
  // „Familie Na“. Länder- und Ortsnamen (中國 → China) sind dagegen richtig.
  const namen = woerter.filter(w => /\(Eig, Fam\)/.test(w.data.de || ''));
  soll.leer(namen.map(w => `${w.data.zeichen}: ${w.data.de}`),
    'keine Karte erklärt ein Alltagswort als Familiennamen');

  // Keine Lesung mit angehängter Klammer — die gehört zu einem anderen Wort
  const lesung = woerter.filter(w => /[（(]/.test(w.data.zhuyin || ''));
  soll.leer(lesung.map(w => `${w.data.zeichen}: ${w.data.zhuyin}`),
    'keine Lesung schleppt die Erweiterung eines anderen Worts mit');

  // Und jede Karte hat überhaupt eine Bedeutung
  soll.leer(woerter.filter(w => !w.data.de).map(w => w.data.zeichen),
    'jede Wortkarte hat eine deutsche Bedeutung');
};
