const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIR = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

http.createServer((req, res) => {
  // Kapitel-API: /api/kapitel
  if (req.url === '/api/kapitel') {
    try {
      // Cache leeren damit Änderungen sofort wirken
      Object.keys(require.cache).forEach(k => { if (k.includes('/data/')) delete require.cache[k]; });
      const data = require('./data');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    } catch(e) {
      res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // TTS-Proxy: /tts?q=солнце
  if (req.url.startsWith('/tts?')) {
    const q = new URLSearchParams(req.url.slice(5)).get('q') || '';
    const ttsUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=ru&client=tw-ob&q='
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
  const url = req.url === '/' ? '/russisch_quiz.html' : req.url;
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
}).listen(PORT, () => {
  console.log(`Quiz läuft auf http://localhost:${PORT}`);
  console.log(`TTS-Proxy aktiv: http://localhost:${PORT}/tts?q=солнце`);
});
