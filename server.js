const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIR = __dirname;
const DATA_DIR = path.join(DIR, 'data');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

// ── Hierarchische Ladelogik ────────────────────────────────────────────────
async function loadSprachen() {
  const sprachen = [];

  try {
    const spracheOrdner = await fs.promises.readdir(DATA_DIR);

    for (const spracheName of spracheOrdner) {
      const sprachePfad = path.join(DATA_DIR, spracheName);
      const stat = await fs.promises.stat(sprachePfad);

      if (!stat.isDirectory()) continue;

      const metaPfad = path.join(sprachePfad, 'meta.json');
      let metaDaten;

      try {
        const metaContent = await fs.promises.readFile(metaPfad, 'utf-8');
        metaDaten = JSON.parse(metaContent);
      } catch (e) {
        console.warn(`⚠ ${spracheName}/meta.json konnte nicht geladen werden:`, e.message);
        continue;
      }

      const spracheObj = {
        id: spracheName,
        sprache: metaDaten.sprache || spracheName,
        icon: metaDaten.icon || '',
        kapitel: []
      };

      // Lade Kapitel (Ebene 2)
      for (const kapitelEintrag of (metaDaten.ordnung || [])) {
        if (kapitelEintrag.typ !== 'folder') continue;

        const kapitelPfad = path.join(sprachePfad, kapitelEintrag.ordner);
        const kapitelMetaPfad = path.join(kapitelPfad, 'meta.json');

        let kapitelMeta;
        try {
          const metaContent = await fs.promises.readFile(kapitelMetaPfad, 'utf-8');
          kapitelMeta = JSON.parse(metaContent);
        } catch (e) {
          console.warn(`⚠ ${spracheName}/${kapitelEintrag.ordner}/meta.json nicht gefunden`);
          continue;
        }

        const kapitelObj = {
          id: kapitelEintrag.ordner,
          name: kapitelEintrag.name,
          unterkapitel: []
        };

        // Lade Unterkapitel (Ebene 3)
        for (const ukEintrag of (kapitelMeta.ordnung || [])) {
          if (ukEintrag.typ !== 'folder') continue;

          const ukPfad = path.join(kapitelPfad, ukEintrag.ordner);
          const ukMetaPfad = path.join(ukPfad, 'meta.json');

          let ukMeta;
          try {
            const metaContent = await fs.promises.readFile(ukMetaPfad, 'utf-8');
            ukMeta = JSON.parse(metaContent);
          } catch (e) {
            console.warn(`⚠ ${spracheName}/${kapitelEintrag.ordner}/${ukEintrag.ordner}/meta.json nicht gefunden`);
            continue;
          }

          const einheiten = [];

          // Lade Einheiten (Ebene 4)
          for (const einheitEintrag of (ukMeta.ordnung || [])) {
            if (einheitEintrag.typ !== 'file') continue;

            const einheitPfad = path.join(ukPfad, einheitEintrag.datei);

            // Prüfe ob Datei existiert
            try {
              await fs.promises.access(einheitPfad);
            } catch (e) {
              console.warn(`⚠ Datei nicht gefunden: ${spracheName}/${kapitelEintrag.ordner}/${ukEintrag.ordner}/${einheitEintrag.datei}`);
              continue;
            }

            // Lade Einheit via require()
            try {
              // Cache leeren für Entwicklung
              delete require.cache[require.resolve(einheitPfad)];
              const einheitData = require(einheitPfad);

              // Validiere format === typ
              if (einheitData.typ !== einheitEintrag.format) {
                console.warn(`⚠ Format-Mismatch: ${einheitEintrag.datei} hat typ="${einheitData.typ}" aber format="${einheitEintrag.format}"`);
                continue;
              }

              einheiten.push(einheitData);
            } catch (e) {
              console.warn(`⚠ Fehler beim Laden von ${einheitEintrag.datei}:`, e.message);
              continue;
            }
          }

          const ukObj = {
            id: ukEintrag.ordner,
            name: ukEintrag.name,
            beschreibung: ukMeta.beschreibung || '',
            einheiten
          };

          kapitelObj.unterkapitel.push(ukObj);
        }

        spracheObj.kapitel.push(kapitelObj);
      }

      sprachen.push(spracheObj);
    }
  } catch (e) {
    console.error('Fehler beim Laden der Sprachen:', e.message);
  }

  return sprachen;
}

// ── HTTP Server ────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {

  // Sprachen-API: /api/sprachen
  if (req.url === '/api/sprachen') {
    try {
      const sprachen = await loadSprachen();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(sprachen));
    } catch (e) {
      console.error('API-Fehler:', e.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // TTS-Proxy: /tts?q=солнце&lang=ru (default ru, aber lang=ja für Japanisch)
  if (req.url.startsWith('/tts?')) {
    const params = new URLSearchParams(req.url.slice(5));
    const q = params.get('q') || '';
    const lang = params.get('lang') || 'ru';
    const ttsUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=' + lang + '&client=tw-ob&q='
      + encodeURIComponent(q);

    https.get(ttsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (ttsRes) => {
      // Google leitet manchmal um
      if (ttsRes.statusCode === 302 || ttsRes.statusCode === 301) {
        https.get(ttsRes.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r2) => {
          res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
          r2.pipe(res);
        }).on('error', () => { res.writeHead(502); res.end(); });
        return;
      }
      res.writeHead(ttsRes.statusCode === 200 ? 200 : 502, { 'Content-Type': 'audio/mpeg' });
      ttsRes.pipe(res);
    }).on('error', (e) => {
      console.error('TTS-Fehler:', e.message);
      res.writeHead(502); res.end();
    });
    return;
  }

  // Statische Dateien
  const url = req.url === '/' ? '/index.html' : req.url;
  const file = path.join(DIR, url);

  if (!file.startsWith(DIR)) {
    res.writeHead(403); res.end(); return;
  }

  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Quiz läuft auf http://localhost:${PORT}`);
  console.log(`📡 Sprachen-API: http://localhost:${PORT}/api/sprachen`);
  console.log(`🔊 TTS-Proxy: http://localhost:${PORT}/tts?q=солнце`);
});
