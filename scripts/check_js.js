#!/usr/bin/env node
// Parst jede Datei in js/ als ES-Modul und meldet Syntaxfehler.
//
// Klingt banal, ist es nicht: Die App hat keinen Bundler und keinen
// Übersetzungsschritt. Ein Tippfehler in einer Datei fällt sonst erst auf,
// wenn der Browser den Bildschirm nicht mehr zeichnet — und dann sucht man
// ihn im falschen Modul.
//
// `node --check` allein reicht nicht: Es liest eine .js-Datei als CommonJS und
// stolpert über jedes `import`. Deshalb wird jede Datei als .mjs kopiert
// geprüft. (Genau darüber bin ich selbst gestolpert — mein Behelfstest
// kommentierte Importzeilen aus und zerschnitt dabei mehrzeilige Importe, was
// Fehler meldete, die es nicht gab.)
//
// Aufruf: node scripts/check_js.js

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const JS = path.join(__dirname, '..', 'js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jscheck-'));

let fehler = 0, geprueft = 0;
for (const datei of fs.readdirSync(JS).filter(f => f.endsWith('.js')).sort()) {
  const ziel = path.join(tmp, datei.replace(/\.js$/, '.mjs'));
  fs.copyFileSync(path.join(JS, datei), ziel);
  geprueft++;
  try {
    execFileSync(process.execPath, ['--check', ziel], { stdio: 'pipe' });
  } catch (e) {
    const meldung = (e.stderr || '').toString().split('\n').filter(Boolean).slice(0, 4).join('\n   ');
    console.error(`✗ js/${datei}\n   ${meldung}`);
    fehler++;
  }
}
fs.rmSync(tmp, { recursive: true, force: true });

console.log(fehler
  ? `\n✗ ${fehler} von ${geprueft} Dateien haben einen Syntaxfehler.`
  : `✓ ${geprueft} Dateien, alle syntaktisch in Ordnung.`);
process.exit(fehler ? 1 : 0);
