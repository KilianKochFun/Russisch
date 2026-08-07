#!/usr/bin/env node
// Prüft, dass der generische Trainer für JEDE Inhaltssprache sinnvoll anzeigt.
//
// Hintergrund: der Trainer wurde für Mandarin gebaut und später für Russisch
// mitbenutzt. Dabei blieben an mehreren Stellen Annahmen stehen, die nur für
// Mandarin gelten — Items ohne `data.zeichen` erschienen als Fragezeichen, der
// Titel der Vorschau stand fest auf 中文. Dieses Skript fängt so etwas ab,
// bevor es im Browser auffällt.
//
// Aufruf: node scripts/check_trainer.js   (liest die Items aus Supabase)

const fs = require('fs');
const path = require('path');

const SUPA_URL = 'https://qqvmovinqupunbsexiev.supabase.co';
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);
const KEY = env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error('SUPABASE_SECRET_KEY fehlt in .env'); process.exit(1); }

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'trainer.js'), 'utf-8');

// Die Tabellen aus trainer.js herausziehen, statt sie hier zu wiederholen —
// sonst laufen Prüfung und Wirklichkeit auseinander.
function tabelle(name) {
  const i = src.indexOf(`const ${name} = {`);
  if (i < 0) return null;
  let d = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) {
    if (src[k] === '{') d++;
    else if (src[k] === '}') { d--; if (!d) { j = k; break; } }
  }
  return eval('(' + src.slice(src.indexOf('{', i), j + 1) + ')');
}

const DECKS = tabelle('DECKS');
const KOPF = tabelle('KOPF');
const VORSCHAU_TITEL = tabelle('VORSCHAU_TITEL');
const TTS_SPRACHE = tabelle('TTS_SPRACHE');
const TYP_NAME = tabelle('TYP_NAME');
const TYP_LABEL = tabelle('TYP_LABEL');
const KARTEN_ART = tabelle('KARTEN_ART');

// Die Anzeigefunktion selbst aus der Datei ziehen, damit wirklich sie geprüft wird
const anzI = src.indexOf('function anzeigeVon');
let d = 0, anzJ = src.indexOf('{', anzI);
for (let k = anzJ; k < src.length; k++) {
  if (src[k] === '{') d++;
  else if (src[k] === '}') { d--; if (!d) { anzJ = k; break; } }
}
const anzeigeVon = eval('(' + src.slice(anzI, anzJ + 1).replace('function anzeigeVon', 'function') + ')');

async function main() {
  const res = await fetch(`${SUPA_URL}/rest/v1/vocab_items?select=language,item_type,level,data`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  const rows = await res.json();

  const sprachen = [...new Set(rows.map(r => r.language))];
  let probleme = 0;
  const meld = (m) => { console.log('  ✗ ' + m); probleme++; };

  for (const lang of sprachen) {
    const items = rows.filter(r => r.language === lang);
    console.log(`\n${lang} — ${items.length} Items`);

    if (!DECKS[lang])          meld('kein Deck definiert');
    if (!KOPF[lang])           meld('keine Dashboard-Kopfzeile — es erschiene die von Mandarin');
    if (!VORSCHAU_TITEL[lang]) meld('kein Titel für die Review-Vorschau');
    if (!TTS_SPRACHE[lang])    meld('keine Sprache für die Sprachausgabe — spräche zh-TW');

    // Jedes Deck muss Items finden, sonst steht es leer im Dashboard
    for (const deck of (DECKS[lang] || [])) {
      const treffer = items.filter(i => deck.typen.includes(i.item_type));
      if (!treffer.length) meld(`Deck "${deck.key}" findet keine Items (Typen: ${deck.typen.join(', ')})`);
    }

    // Jeder Typ braucht einen Namen für Vorschau und Kartenmarke
    for (const typ of [...new Set(items.map(i => i.item_type))]) {
      if (!TYP_NAME[typ])  meld(`Typ "${typ}" fehlt in TYP_NAME — Vorschau gruppiert ihn roh`);
      if (!TYP_LABEL[typ]) meld(`Typ "${typ}" fehlt in TYP_LABEL — Kartenmarke zeigt den rohen Typ`);
      // Der teuerste der drei: Ohne Eintrag fällt die Karte durch alle Zweige
      // von frontHtml/backHtml bis in den Mandarin-Fall, wo `d.zeichen` steht.
      // Auf der Karte stand dann „undefined“ — genau so passiert, als Kurdisch
      // dazukam.
      if (!KARTEN_ART[typ]) meld(`Typ "${typ}" fehlt in KARTEN_ART — die Karte rendert „undefined“`);
    }

    // Und die Bauform muss zu den Feldern passen, die das Item wirklich hat.
    const FELDER = { regel: 'form', wort: 'wort', morph: 'form', rusword: 'wort', zhuyin: 'zhuyin', hanzi: 'zeichen' };
    for (const typ of [...new Set(items.map(i => i.item_type))]) {
      const feld = FELDER[KARTEN_ART[typ]];
      if (!feld) continue;
      const fehlt = items.filter(i => i.item_type === typ && !i.data?.[feld]);
      if (fehlt.length) meld(`${fehlt.length}× Typ "${typ}": Bauform „${KARTEN_ART[typ]}“ erwartet data.${feld}, das fehlt`);
    }

    // Und jedes einzelne Item muss etwas Anzeigbares hergeben
    let leer = 0, ohneBedeutung = 0;
    for (const it of items) {
      const a = anzeigeVon(it);
      if (!a.vorne || a.vorne === '?') { if (leer++ < 3) meld(`Item ohne Anzeigetext: ${JSON.stringify(it.data).slice(0, 70)}`); }
      if (!a.hinten) ohneBedeutung++;
    }
    if (leer > 3) meld(`… und ${leer - 3} weitere ohne Anzeigetext`);
    if (ohneBedeutung) meld(`${ohneBedeutung} Items ohne Bedeutung im Tooltip`);

    if (!probleme) console.log('  ✓ alles vollständig');
  }

  console.log(probleme ? `\n✗ ${probleme} Problem(e)` : '\n✓ alle Sprachen vollständig verdrahtet');
  process.exit(probleme ? 1 : 0);
}
main();
