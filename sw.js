// Service Worker: App-Shell offline (PWA, Phase 4).
// Strategie: stale-while-revalidate — sofort aus dem Cache antworten,
// im Hintergrund aktualisieren (Änderungen greifen beim nächsten Start).
// Supabase-API-Aufrufe werden nie gecacht.
const VERSION = 'sprachen-v13';

const SHELL = [
  '.',
  'index.html',
  'manifest.json',
  'icon.svg', 'favicon.ico',
  'icons/apple-touch-icon.png', 'icons/icon-192.png',
  'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'srs-levels.js',
  'srs-data.json',
  'content/sprachen.json',
  'vendor/hanzi-writer.min.js',
  'js/main.js', 'js/state.js', 'js/ui.js', 'js/input.js', 'js/content.js',
  'js/tts.js', 'js/config.js', 'js/supabase.js', 'js/progress.js',
  'js/decks.js', 'js/trainer.js', 'js/buecher.js', 'js/forecast.js', 'js/sync.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.hostname.endsWith('supabase.co')) return;         // API nie cachen
  if (url.pathname.startsWith('/tts')) return;              // lokaler TTS-Proxy

  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(e.request);
      const netz = fetch(e.request)
        .then((res) => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || netz;
    })
  );
});
