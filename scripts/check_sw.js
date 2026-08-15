#!/usr/bin/env node
// Prüft, dass sw.js jede Datei aus js/ in seiner Offline-Liste führt.
//
// Der Service Worker cacht eine fest getippte Liste. Wer ein Modul hinzufügt
// und die Liste vergisst, merkt nichts — online lädt der Browser die Datei
// ganz normal nach. Erst im Flugmodus oder im Funkloch fehlt sie, und dann
// steht die App. Genau das ist mit vergleich.js, merksatz.js, screen.js und
// html.js passiert.
//
// Aufruf: node scripts/check_sw.js

const fs = require('fs');
const path = require('path');
const WURZEL = path.join(__dirname, '..');

const sw = fs.readFileSync(path.join(WURZEL, 'sw.js'), 'utf-8');
const liste = sw.slice(sw.indexOf('const SHELL = ['), sw.indexOf('];', sw.indexOf('const SHELL = [')));

const dateien = fs.readdirSync(path.join(WURZEL, 'js')).filter(f => f.endsWith('.js')).sort();
const fehlend = dateien.filter(f => !liste.includes(`'js/${f}'`));

// Und umgekehrt: Einträge, die es nicht mehr gibt, lassen die Installation
// des Service Workers komplett scheitern — addAll ist alles-oder-nichts.
const genannt = [...liste.matchAll(/'js\/([^']+)'/g)].map(m => m[1]);
const verwaist = genannt.filter(f => !dateien.includes(f));

for (const f of fehlend) console.error(`✗ js/${f} fehlt in der SHELL-Liste von sw.js — offline nicht verfügbar`);
for (const f of verwaist) console.error(`✗ sw.js nennt js/${f}, die Datei gibt es nicht — addAll scheitert komplett`);

if (!fehlend.length && !verwaist.length) console.log(`✓ sw.js führt alle ${dateien.length} Module aus js/.`);
process.exit(fehlend.length + verwaist.length ? 1 : 0);
