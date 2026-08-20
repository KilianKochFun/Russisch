#!/usr/bin/env node
// Die Meldungen aus der App lesen und beantworten.
//
// Kilian meldet aus der App heraus, wenn eine Karte nicht stimmt („die
// Bedeutung ist falsch“, „das Wort benutzt niemand“). Hier hole ich sie mir,
// arbeite sie ab und schreibe zurück — die Antwort steht danach in der App
// unter genau dieser Karte.
//
// Der Rückweg ist der Punkt. Eine Meldung, auf die nie jemand reagiert,
// schreibt man kein zweites Mal.
//
//   node scripts/meldungen.js                  offene anzeigen
//   node scripts/meldungen.js --alle           auch erledigte
//   node scripts/meldungen.js <id> geaendert "Stimmt, ist korrigiert."
//   node scripts/meldungen.js <id> bleibt     "Bleibt so, weil …"
//
// Status: offen · geaendert (Daten angepasst) · bleibt (bewusst so)
//         · erledigt (sonstiges)

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
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const FARBE = { offen: '\x1b[33m', geaendert: '\x1b[32m', bleibt: '\x1b[36m', erledigt: '\x1b[90m' };
const AUS = '\x1b[0m';

async function zeige(alle) {
  const filter = alle ? '' : '&status=eq.offen';
  const r = await fetch(`${SUPA_URL}/rest/v1/meldungen?select=*${filter}&order=created_at.desc`, { headers: H });
  const zeilen = await r.json();
  if (!Array.isArray(zeilen)) { console.error(zeilen); process.exit(1); }
  if (!zeilen.length) { console.log(alle ? 'Keine Meldungen.' : 'Keine offenen Meldungen.'); return; }

  for (const m of zeilen) {
    const f = FARBE[m.status] || '';
    console.log(`\n${f}#${m.id}  ${m.status.toUpperCase()}${AUS}  ${m.lang} · ${m.card_key}${
      m.anzeige ? `  („${m.anzeige}“)` : ''}`);
    console.log(`   ${new Date(m.created_at).toLocaleString('de-DE')}`);
    console.log(`   „${m.text}“`);
    if (m.antwort) console.log(`   → ${m.antwort}`);
  }
  const offen = zeilen.filter(m => m.status === 'offen').length;
  console.log(`\n${zeilen.length} Meldung(en)${alle ? '' : ''}${offen ? `, ${offen} offen` : ''}.`);
}

async function antworte(id, status, text) {
  if (!['offen', 'geaendert', 'bleibt', 'erledigt'].includes(status)) {
    console.error(`Status muss offen, geaendert, bleibt oder erledigt sein — nicht „${status}“.`);
    process.exit(1);
  }
  if (!text) { console.error('Ohne Antwort keine Erledigung — der Rückweg ist der ganze Sinn.'); process.exit(1); }
  const r = await fetch(`${SUPA_URL}/rest/v1/meldungen?id=eq.${id}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({ status, antwort: text, updated_at: new Date().toISOString() }),
  });
  const zeilen = await r.json();
  if (!r.ok || !zeilen.length) { console.error('Ging nicht:', zeilen); process.exit(1); }
  console.log(`✓ #${id} auf „${status}“ gesetzt. In der App steht jetzt unter der Karte:\n   ${text}`);
}

const args = process.argv.slice(2);
if (!args.length || args[0] === '--alle') zeige(args[0] === '--alle');
else antworte(args[0], args[1], args.slice(2).join(' '));
