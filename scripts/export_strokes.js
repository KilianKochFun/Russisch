#!/usr/bin/env node
// Exportiert Strichfolge-Daten (makemeahanzi graphics.txt) für alle aktuell
// geseedeten Einzelzeichen nach strokes/<zeichen>.json — die App lädt sie lokal
// statt von der CDN (robuster, offlinefähig). Nach jedem Seed-Lauf ausführen!
// Aufruf: node scripts/export_strokes.js

const fs = require('fs');
const path = require('path');

const CP = path.join(__dirname, '..', 'content-private');
const ZIEL = path.join(__dirname, '..', 'strokes');

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);
const KEY = env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error('SUPABASE_SECRET_KEY fehlt in .env'); process.exit(1); }

const grafiken = new Map();
for (const line of fs.readFileSync(path.join(CP, 'graphics.txt'), 'utf-8').split('\n')) {
  if (!line.trim()) continue;
  try { const e = JSON.parse(line); grafiken.set(e.character, e); } catch {}
}

async function main() {
  const headers = { apikey: KEY, Authorization: 'Bearer ' + KEY };
  const zeichen = new Set();
  for (let von = 0; ; von += 1000) {
    const res = await fetch(
      `https://qqvmovinqupunbsexiev.supabase.co/rest/v1/vocab_items?select=data&language=eq.chinese-tw&limit=1000&offset=${von}`,
      { headers });
    const batch = await res.json();
    for (const r of batch) {
      const z = r.data.zeichen;
      if (z && [...z].length === 1 && /\p{Script=Han}/u.test(z)) zeichen.add(z);
      // Zerlegungs-Teile mitnehmen (für die Detail-Ansicht der Radikale)
      for (const t of (r.data.zerlegung || [])) if ([...t.z].length === 1) zeichen.add(t.z);
    }
    if (batch.length < 1000) break;
  }

  fs.mkdirSync(ZIEL, { recursive: true });
  let ok = 0, fehlt = [];
  for (const z of zeichen) {
    const g = grafiken.get(z);
    if (!g) { fehlt.push(z); continue; }
    fs.writeFileSync(path.join(ZIEL, z + '.json'),
      JSON.stringify({ strokes: g.strokes, medians: g.medians }));
    ok++;
  }
  console.log(`✓ ${ok} Strichfolge-Dateien in strokes/ (${fehlt.length} ohne Daten: ${fehlt.join(' ') || '—'})`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
