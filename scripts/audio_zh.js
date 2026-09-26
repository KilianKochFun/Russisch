#!/usr/bin/env node
// Aussprache für Mandarin → Supabase-Bucket `audio`.
//
// Liest alle Zeichen und Wörter aus vocab_items (plus die Beispielwörter der
// Zhuyin-Karten, denn die spricht die App dort), holt für jeden Text, der im
// Bucket noch fehlt, eine MP3 vom Google-Übersetzer und lädt sie hoch.
// Radikale nicht: Die spricht die App nie.
//
// Schon vorhandene Dateien werden übersprungen — nach neuen Wörtern in
// seed_words.js einfach nochmal laufen lassen.
//
// Aufruf: node scripts/audio_zh.js            fehlende erzeugen
//         node scripts/audio_zh.js --dry-run  nur zählen
//         node scripts/audio_zh.js --mehrdeutig  Zeichen mit mehreren Lesungen
//
// Google spricht ein einzelnes Zeichen immer in seiner häufigsten Lesung.
// Lehrt die Karte eine andere, passt die Aufnahme nicht — --mehrdeutig listet
// die Kandidaten zum Nachhören.

const fs = require('fs');
const path = require('path');

const SUPA_URL = 'https://qqvmovinqupunbsexiev.supabase.co';
const BUCKET = 'audio';
const SPRACHE = 'zh-TW';
const PAUSE_MS = 1000;   // eine Anfrage pro Sekunde — schneller sperrt Google die IP

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);
const KEY = env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error('SUPABASE_SECRET_KEY fehlt in .env'); process.exit(1); }
const HEAD = { apikey: KEY, Authorization: 'Bearer ' + KEY };

// Muss mit audioPfad() in js/tts.js übereinstimmen.
function audioPfad(sprache, text) {
  return `${sprache}/${[...text].map(c => c.codePointAt(0).toString(16)).join('-')}.mp3`;
}

async function texte() {
  const alle = new Set();
  for (let von = 0; ; von += 1000) {
    const r = await fetch(`${SUPA_URL}/rest/v1/vocab_items?select=item_type,data&language=eq.chinese-tw` +
      `&item_type=in.(character,word,zhuyin)&order=id&offset=${von}&limit=1000`, { headers: HEAD });
    if (!r.ok) throw new Error(`vocab_items: ${r.status} ${await r.text()}`);
    const zeilen = await r.json();
    for (const { item_type, data } of zeilen) {
      const t = item_type === 'zhuyin' ? data.beispiel?.zh : data.zeichen;
      if (t) alle.add(t.trim());
    }
    if (zeilen.length < 1000) break;
  }
  return [...alle];
}

async function vorhandene() {
  const r = await fetch(`${SUPA_URL}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST', headers: { ...HEAD, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: SPRACHE, limit: 100000 }),
  });
  if (!r.ok) throw new Error(`Bucket-Liste: ${r.status} ${await r.text()} — Migration eingespielt?`);
  return new Set((await r.json()).map(o => `${SPRACHE}/${o.name}`));
}

async function googleMp3(text) {
  const url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob' +
    `&tl=${SPRACHE}&q=${encodeURIComponent(text)}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const typ = r.headers.get('content-type') || '';
  if (!r.ok || !typ.startsWith('audio/')) throw new Error(`Google: ${r.status} ${typ}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 1000) throw new Error(`Google: nur ${buf.length} Bytes`);
  return buf;
}

async function hochladen(pfad, buf) {
  const r = await fetch(`${SUPA_URL}/storage/v1/object/${BUCKET}/${pfad}`, {
    method: 'POST',
    headers: { ...HEAD, 'Content-Type': 'audio/mpeg', 'x-upsert': 'true' },
    body: buf,
  });
  if (!r.ok) throw new Error(`Upload: ${r.status} ${await r.text()}`);
}

async function mehrdeutige() {
  const r = await fetch(`${SUPA_URL}/rest/v1/vocab_items?select=level,data&language=eq.chinese-tw` +
    `&item_type=eq.character&order=level,position&limit=1000`, { headers: HEAD });
  if (!r.ok) throw new Error(`vocab_items: ${r.status} ${await r.text()}`);
  for (const { level, data } of await r.json()) {
    const weitere = data.weitere_lesungen || [];
    if (!weitere.length) continue;
    console.log(`L${level} ${data.zeichen}  Karte: ${data.zhuyin} (${data.pinyin})  ` +
      `weitere: ${weitere.map(l => `${l.zhuyin} (${l.pinyin})`).join(', ')}`);
  }
}

(async () => {
  if (process.argv.includes('--mehrdeutig')) return mehrdeutige();
  const alle = await texte();
  const da = await vorhandene();
  const fehlen = alle.filter(t => !da.has(audioPfad(SPRACHE, t)));
  console.log(`${alle.length} Texte, ${alle.length - fehlen.length} schon da, ${fehlen.length} fehlen`);
  if (process.argv.includes('--dry-run')) return;

  let ok = 0;
  const kaputt = [];
  for (const [i, t] of fehlen.entries()) {
    try {
      await hochladen(audioPfad(SPRACHE, t), await googleMp3(t));
      ok++;
    } catch (e) {
      kaputt.push(`${t}: ${e.message}`);
      // Mehrere Fehler am Stück heißt meist: Google sperrt gerade. Aufhören
      // statt die Sperre zu verlängern — der nächste Lauf macht weiter.
      if (kaputt.length >= 5 && ok === 0) break;
    }
    if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${fehlen.length}`);
    await new Promise(r => setTimeout(r, PAUSE_MS));
  }
  console.log(`✓ ${ok} hochgeladen`);
  if (kaputt.length) { console.log(`✗ ${kaputt.length} fehlgeschlagen:`); kaputt.forEach(k => console.log('  ' + k)); }
})().catch(e => { console.error(e.message); process.exit(1); });
