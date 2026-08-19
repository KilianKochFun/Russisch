// Ein Wort darf nicht dieselbe Karte sein wie ein Zeichen.
//
// Anlass: Ich hatte einzeichige Wörter aufgenommen, weil WaniKani das macht.
// Dort haben sie ihren Sinn, weil ein Kanji als Wort anders gelesen wird als
// im Verbund. Im Mandarin gibt es diese Spaltung nicht — 100 von 109 hatten
// exakt dieselbe Lesung und 104 exakt dieselbe Bedeutung wie ihre
// Zeichenkarte. Dieser Test hält fest, dass sie draußen bleiben.
import { SUPA_URL } from './harness.mjs';
import fs from 'node:fs';

export const name = 'Keine Wortkarte ist die Dublette einer Zeichenkarte';

export default async (app, soll) => {
  const key = fs.readFileSync(new URL('../.env', import.meta.url), 'utf-8')
    .split('\n').find(z => z.startsWith('SUPABASE_SECRET_KEY='))?.slice(20).trim();
  const hole = async (typ) => {
    const r = await fetch(`${SUPA_URL}/rest/v1/vocab_items?language=eq.chinese-tw&item_type=eq.${typ}&select=data`,
      { headers: { apikey: key, Authorization: 'Bearer ' + key } });
    return r.json();
  };
  const [zeichen, woerter] = await Promise.all([hole('character'), hole('word')]);
  const zSet = new Set(zeichen.map(x => x.data.zeichen));

  const dubletten = woerter.filter(w => w.data.zeichen.length === 1 && zSet.has(w.data.zeichen));
  soll.leer(dubletten.map(w => w.data.zeichen),
    'kein Wort besteht aus einem einzigen Zeichen, das es schon als Zeichenkarte gibt');

  soll.wahr(woerter.length > 40, `es gibt trotzdem genug echte Wörter (waren ${woerter.length})`);
};
