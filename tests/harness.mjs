// Testgerüst: startet die App lokal, steuert einen echten Browser, klickt und
// tippt wie ein Mensch.
//
// Warum überhaupt: Bisher konnte ich Änderungen nur lesen, nicht ausprobieren.
// Fehler wie „der Zähler steht auf 1, obwohl nichts fällig ist“ oder „auf der
// Karte steht undefined“ sind mir deshalb erst aufgefallen, als Kilian sie
// gemeldet hat. Mit diesem Gerüst kann ich sie selbst finden.
//
// Aufbau:
//   · ein statischer Server auf einem freien Port (wie GitHub Pages)
//   · Chromium headless über playwright-core
//   · ein eigener Testnutzer, damit kein echter Lernstand angefasst wird
//
// Der Testnutzer bekommt bei jedem Lauf ein frisches Zufallspasswort über die
// Admin-Schnittstelle. Kein Passwort steht irgendwo in einer Datei, und der
// geheime Schlüssel wird nur benutzt, nie ausgegeben.
//
// Aufruf: node scripts/test.js [name]

import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const WURZEL = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TEST_MAIL = 'test-harness@example.invalid';

// ── Konfiguration aus dem Projekt ziehen ───────────────────────────────────
function env(name) {
  for (const z of fs.readFileSync(path.join(WURZEL, '.env'), 'utf-8').split('\n'))
    if (z.startsWith(name + '=')) return z.slice(name.length + 1).trim();
  throw new Error(name + ' fehlt in .env');
}
const cfg = fs.readFileSync(path.join(WURZEL, 'js', 'config.js'), 'utf-8');
export const SUPA_URL = cfg.match(/https:\/\/[a-z0-9]+\.supabase\.co/)[0];
const ANON = cfg.match(/(?:ANON_KEY|PUBLISHABLE\w*)\s*=\s*'([^']+)'/)[1];

// ── Statischer Server, genau wie GitHub Pages ihn ausliefert ───────────────
const TYPEN = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.css': 'text/css', '.pdf': 'application/pdf' };

function starteServer() {
  return new Promise(res => {
    const s = http.createServer((req, rep) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const datei = path.join(WURZEL, p);
      if (!datei.startsWith(WURZEL) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory()) {
        rep.writeHead(404); rep.end('nicht da'); return;
      }
      rep.writeHead(200, { 'Content-Type': TYPEN[path.extname(datei)] || 'application/octet-stream' });
      fs.createReadStream(datei).pipe(rep);
    });
    s.listen(0, '127.0.0.1', () => res(s));
  });
}

// ── Testnutzer ─────────────────────────────────────────────────────────────
async function adminRuf(pfad, body, methode = 'POST') {
  const k = env('SUPABASE_SECRET_KEY');
  const r = await fetch(SUPA_URL + pfad, {
    method: methode,
    headers: { apikey: k, Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, daten: await r.json().catch(() => null) };
}

// Legt den Testnutzer an, falls es ihn nicht gibt, und setzt ein frisches
// Zufallspasswort. Gibt E-Mail, Passwort und ID zurück — das Passwort lebt nur
// in diesem Prozess.
export async function testNutzer() {
  const { daten } = await adminRuf('/auth/v1/admin/users?per_page=200', null, 'GET');
  let nutzer = (daten?.users || []).find(u => u.email === TEST_MAIL);
  const passwort = 'T-' + crypto.randomBytes(18).toString('base64url');

  if (!nutzer) {
    const a = await adminRuf('/auth/v1/admin/users', { email: TEST_MAIL, password: passwort, email_confirm: true });
    if (a.status !== 200) throw new Error('Testnutzer ließ sich nicht anlegen: ' + JSON.stringify(a.daten));
    nutzer = a.daten;
  } else {
    const a = await adminRuf(`/auth/v1/admin/users/${nutzer.id}`, { password: passwort, email_confirm: true }, 'PUT');
    if (a.status !== 200) throw new Error('Passwort ließ sich nicht setzen: ' + JSON.stringify(a.daten));
  }
  return { mail: TEST_MAIL, passwort, id: nutzer.id };
}

// Alles wegräumen, was der Testnutzer angesammelt hat. Sonst steht er
// irgendwann in der Bestenliste.
export async function raeumeAuf(uid) {
  const k = env('SUPABASE_SECRET_KEY');
  const h = { apikey: k, Authorization: 'Bearer ' + k };
  for (const t of ['srs_cards', 'srs_decks', 'merksaetze', 'profiles', 'settings'])
    await fetch(`${SUPA_URL}/rest/v1/${t}?user_id=eq.${uid}`, { method: 'DELETE', headers: h }).catch(() => {});
}

// Karten für den Testnutzer setzen — damit ein Test einen bestimmten Zustand
// herstellen kann, statt ihn sich zusammenzuklicken. `srs` und `next_review`
// sind genau die zwei Werte, an denen Fälligkeit hängt.
//
// Der Schlüssel bekommt automatisch das Prüfungssuffix, wenn keines dasteht.
// Ohne das schrieb ein Test Zeilen, wie die App sie nie schreibt: der Trainer
// legte beim Antworten NEUE Zeilen mit Suffix an, die alten blieben ewig
// fällig stehen — und ein Rundgang meldete daraufhin einen Fehler, den es gar
// nicht gab. Ein Testgerüst, das unrealistische Daten erzeugt, ist schlimmer
// als keines.
const PRUEFUNG_STANDARD = 'bedeutung';

export async function setzeKarten(uid, karten) {
  const k = env('SUPABASE_SECRET_KEY');
  const h = { apikey: k, Authorization: 'Bearer ' + k, 'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates' };
  const zeilen = karten.map(c => ({
    user_id: uid, lang: c.lang, deck: c.deck,
    card_key: c.key.includes('#') ? c.key : `${c.key}#${PRUEFUNG_STANDARD}`,
    srs: c.srs, next_review: c.faelligIn === undefined ? null
      : new Date(Date.now() + c.faelligIn).toISOString(),
    updated_at: new Date().toISOString(),
  }));
  const r = await fetch(`${SUPA_URL}/rest/v1/srs_cards`, { method: 'POST', headers: h, body: JSON.stringify(zeilen) });
  if (!r.ok) throw new Error('Karten setzen fehlgeschlagen: ' + await r.text());
}

// ── Der Browser ────────────────────────────────────────────────────────────
export async function starte({ sichtbar = false } = {}) {
  const server = await starteServer();
  const port = server.address().port;
  const browser = await chromium.launch({ headless: !sichtbar });
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });

  const konsole = [];
  page.on('console', m => konsole.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', e => konsole.push('pageerror: ' + e.message));
  // Fehlgeschlagene Anfragen MIT Adresse. Die Konsole meldet nur „404“ ohne zu
  // sagen, wofür — damit sucht man lange.
  page.on('response', r => {
    if (r.status() >= 400) konsole.push(`http ${r.status()}: ${r.url()}`);
  });

  const nutzer = await testNutzer();

  const app = {
    page, nutzer, konsole,
    url: `http://127.0.0.1:${port}/`,

    async oeffne() {
      await page.goto(app.url, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#login-screen.active, #sprachen-screen.active', { timeout: 15000 });
      if (await page.isVisible('#login-screen.active')) await app.melde();
    },

    // Über die echte Maske, nicht an ihr vorbei — so wird sie mitgetestet.
    async melde() {
      await page.fill('#login-email', nutzer.mail);
      await page.fill('#login-passwort', nutzer.passwort);
      await page.click('#login-submit');
      await page.waitForSelector('#sprachen-screen.active', { timeout: 20000 });
    },

    // Pedaltritt. Genau der Weg, den auch das echte Pedal nimmt: ein keydown.
    async pedal(taste, mal = 1) {
      for (let i = 0; i < mal; i++) { await page.keyboard.press(taste); await page.waitForTimeout(90); }
    },

    async klick(sel) { await page.click(sel); await page.waitForTimeout(120); },
    async text(sel) { return (await page.textContent(sel).catch(() => null))?.trim() ?? null; },
    async sichtbar(sel) { return page.isVisible(sel).catch(() => false); },
    async warte(sel, ms = 10000) { await page.waitForSelector(sel, { timeout: ms }); },

    // Welcher Bildschirm gerade aktiv ist — praktisch für Navigationstests.
    async screen() { return page.evaluate(() => document.querySelector('.screen.active')?.id ?? null); },

    // Eine Sprache über ihren Namen im Menü öffnen — verlässlicher als sich mit
    // dem Pedal hinzuzählen, wenn sich die Reihenfolge des Menüs ändert.
    async oeffneSprache(teilname) {
      await app.warte('#sprachen-screen.active');
      const treffer = app.page.locator('#sprachen-list .menu-item', { hasText: teilname }).first();
      await treffer.click();
      await page.waitForTimeout(400);
    },

    async bild(name) {
      const ordner = path.join(WURZEL, 'tests', 'bilder');
      fs.mkdirSync(ordner, { recursive: true });
      const ziel = path.join(ordner, name + '.png');
      await page.screenshot({ path: ziel, fullPage: true });
      return ziel;
    },

    // Fehler aus der Browser-Konsole. Ein Test, der keine erwartet, sollte das
    // prüfen — „undefined auf der Karte“ war ein Konsolenfehler, den niemand sah.
    fehlerInKonsole() {
      return konsole.filter(z => z.startsWith('error:') || z.startsWith('pageerror:') || z.startsWith('http '))
        // Der 404-Text der Konsole ist nutzlos, die http-Zeile daneben sagt alles
        .filter(z => !/^error: Failed to load resource/.test(z))
        // Erwartet: tts.js probiert den lokalen /tts-Proxy genau einmal und
        // schaltet danach auf die Browser-Stimme um. Der Testserver liefert
        // ihn nicht aus (er stellt GitHub Pages nach), also gibt es genau
        // diesen einen 404. Kein Fehler, sondern der eingebaute Rückfall.
        .filter(z => !/^http 404: \S+\/tts\?/.test(z));
    },

    async ende() { await browser.close(); server.close(); },
  };
  return app;
}

// ── Behauptungen ───────────────────────────────────────────────────────────
export class TestFehler extends Error {}

export const soll = {
  wahr(x, was) { if (!x) throw new TestFehler(`${was} — war: ${JSON.stringify(x)}`); },
  gleich(ist, erwartet, was) {
    if (ist !== erwartet) throw new TestFehler(`${was} — erwartet ${JSON.stringify(erwartet)}, war ${JSON.stringify(ist)}`);
  },
  enthaelt(text, teil, was) {
    if (!String(text ?? '').includes(teil)) throw new TestFehler(`${was} — „${teil}“ fehlt in „${text}“`);
  },
  leer(liste, was) {
    if (liste.length) throw new TestFehler(`${was} — ${liste.length}: ${liste.slice(0, 3).join(' | ')}`);
  },
};
