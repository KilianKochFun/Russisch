#!/usr/bin/env node
// Baut content/sprachen.json aus der data/-Hierarchie (statisches Pendant zu /api/sprachen).
// Aufruf: npm run build:content  (oder: node scripts/build_content.js)
//
// Vergibt dabei stabile IDs für Fortschritts-Speicherung (Supabase):
//   Einheit:      russian/a1/a1.1/vokabeln-01
//   Vokabelkarte: russian/a1/a1.1/vokabeln-01#солнце   (Pfad + RU-Wort; Duplikate: ~2, ~3 …)
//   Frage/Karte:  russian/a1/a1.1/grammatik-02#f0      (Pfad + Index)
// IDs bleiben stabil solange Karten/Fragen nur ANGEHÄNGT werden — nie mittendrin einfügen!

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUT_DIR = path.join(ROOT, 'content');
const OUT_FILE = path.join(OUT_DIR, 'sprachen.json');

function readMeta(dir) {
  const p = path.join(dir, 'meta.json');
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e) {
    console.warn(`⚠ ${path.relative(ROOT, p)} konnte nicht geladen werden: ${e.message}`);
    return null;
  }
}

// Vergibt IDs für alle Karten/Fragen einer Einheit (in place, auf einer Kopie)
function mitIds(einheit, basisId) {
  const e = JSON.parse(JSON.stringify(einheit));
  e.id = basisId;

  if (Array.isArray(e.karten)) {
    if (e.typ === 'vokabeln') {
      const gesehen = {};
      e.karten.forEach(k => {
        const wort = (k.ru || k.ja || k.zh || '').trim();
        gesehen[wort] = (gesehen[wort] || 0) + 1;
        k.id = basisId + '#' + wort + (gesehen[wort] > 1 ? '~' + gesehen[wort] : '');
      });
    } else {
      // theorie-Karten u.ä. — Index-basiert
      e.karten.forEach((k, i) => { k.id = basisId + '#k' + i; });
    }
  }
  if (Array.isArray(e.fragen)) {
    e.fragen.forEach((f, i) => { f.id = basisId + '#f' + i; });
  }
  if (Array.isArray(e.aufgaben)) {
    e.aufgaben.forEach((a, i) => { a.id = basisId + '#a' + i; });
  }
  return e;
}

function loadSprachen() {
  const sprachen = [];

  for (const spracheName of fs.readdirSync(DATA_DIR).sort()) {
    const sprachePfad = path.join(DATA_DIR, spracheName);
    if (!fs.statSync(sprachePfad).isDirectory()) continue;

    const metaDaten = readMeta(sprachePfad);
    if (!metaDaten) continue;

    const spracheObj = {
      id: spracheName,
      sprache: metaDaten.sprache || spracheName,
      icon: metaDaten.icon || '',
      kapitel: []
    };

    for (const kapitelEintrag of (metaDaten.ordnung || [])) {
      if (kapitelEintrag.typ !== 'folder') continue;

      const kapitelPfad = path.join(sprachePfad, kapitelEintrag.ordner);
      const kapitelMeta = readMeta(kapitelPfad);
      if (!kapitelMeta) continue;

      const kapitelObj = {
        id: kapitelEintrag.ordner,
        name: kapitelEintrag.name,
        unterkapitel: []
      };

      for (const ukEintrag of (kapitelMeta.ordnung || [])) {
        if (ukEintrag.typ !== 'folder') continue;

        const ukPfad = path.join(kapitelPfad, ukEintrag.ordner);
        const ukMeta = readMeta(ukPfad);
        if (!ukMeta) continue;

        const einheiten = [];

        for (const einheitEintrag of (ukMeta.ordnung || [])) {
          if (einheitEintrag.typ !== 'file') continue;

          const einheitPfad = path.join(ukPfad, einheitEintrag.datei);
          if (!fs.existsSync(einheitPfad)) {
            console.warn(`⚠ Datei nicht gefunden: ${path.relative(ROOT, einheitPfad)}`);
            continue;
          }

          let einheitData;
          try {
            delete require.cache[require.resolve(einheitPfad)];
            einheitData = require(einheitPfad);
          } catch (e) {
            console.warn(`⚠ Fehler beim Laden von ${einheitEintrag.datei}: ${e.message}`);
            continue;
          }

          if (einheitData.typ !== einheitEintrag.format) {
            console.warn(`⚠ Format-Mismatch: ${einheitEintrag.datei} hat typ="${einheitData.typ}" aber format="${einheitEintrag.format}"`);
            continue;
          }

          const basisId = [
            spracheName,
            kapitelEintrag.ordner,
            ukEintrag.ordner,
            einheitEintrag.datei.replace(/\.js$/, '')
          ].join('/');

          einheiten.push(mitIds(einheitData, basisId));
        }

        kapitelObj.unterkapitel.push({
          id: ukEintrag.ordner,
          name: ukEintrag.name,
          beschreibung: ukMeta.beschreibung || '',
          einheiten
        });
      }

      spracheObj.kapitel.push(kapitelObj);
    }

    sprachen.push(spracheObj);
  }

  return sprachen;
}

const sprachen = loadSprachen();
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(sprachen));

let einheiten = 0, items = 0;
for (const s of sprachen)
  for (const k of s.kapitel)
    for (const uk of k.unterkapitel)
      for (const e of uk.einheiten) {
        einheiten++;
        items += (e.karten?.length || 0) + (e.fragen?.length || 0) + (e.aufgaben?.length || 0);
      }
console.log(`✓ ${path.relative(ROOT, OUT_FILE)} geschrieben — ${sprachen.length} Sprachen, ${einheiten} Einheiten, ${items} Karten/Fragen`);
