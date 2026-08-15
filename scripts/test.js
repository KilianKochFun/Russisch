#!/usr/bin/env node
// Führt die Tests in tests/ aus.
//
//   node scripts/test.js            alle
//   node scripts/test.js menue      nur tests/menue.test.mjs
//   node scripts/test.js --sichtbar mit sichtbarem Browserfenster (zum Zusehen)
//
// Jeder Test ist eine .test.mjs mit `export const name` und
// `export default async (app, soll) => { … }`. Wirft er nichts, ist er grün.

const fs = require('fs');
const path = require('path');
const TESTS = path.join(__dirname, '..', 'tests');

(async () => {
  const args = process.argv.slice(2);
  const sichtbar = args.includes('--sichtbar');
  const filter = args.filter(a => !a.startsWith('--'))[0];

  const dateien = fs.readdirSync(TESTS).filter(f => f.endsWith('.test.mjs'))
    .filter(f => !filter || f.includes(filter)).sort();
  if (!dateien.length) { console.error('Keine Tests gefunden' + (filter ? ` für „${filter}“` : '')); process.exit(1); }

  const { starte, soll, raeumeAuf } = await import('../tests/harness.mjs');
  const app = await starte({ sichtbar });
  let gruen = 0, rot = 0;

  for (const datei of dateien) {
    const mod = await import(path.join(TESTS, datei));
    const name = mod.name || datei;
    const start = Date.now();
    try {
      await mod.default(app, soll);
      console.log(`✓ ${name}  (${Date.now() - start} ms)`);
      gruen++;
    } catch (e) {
      console.log(`✗ ${name}\n   ${e.message.split('\n')[0]}`);
      try { console.log('   Bild: ' + await app.bild('fehler-' + datei.replace(/\W+/g, '-'))); } catch {}
      rot++;
    }
  }

  await raeumeAuf(app.nutzer.id);
  await app.ende();
  console.log(rot ? `\n✗ ${rot} von ${gruen + rot} Tests rot.` : `\n✓ alle ${gruen} Tests grün.`);
  process.exit(rot ? 1 : 0);
})();
