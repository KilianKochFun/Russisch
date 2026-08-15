// Speicherschicht für den Lernstand.
//
// Vorher: jede beantwortete Karte schickte den kompletten Settings-Klumpen an
// Supabase, feuerte los und vergaß das Ergebnis. Drei Folgen davon:
//   · viel Verkehr, wachsend mit jeder gelernten Karte
//   · Fehlschläge landeten nur in der Konsole — man lernte weiter im Glauben,
//     alles sei gesichert
//   · ohne Netz ging gar nichts hoch, und beim Wiederverbinden auch nicht
//   · zwei Geräte überschrieben sich, weil jedes den ganzen Stand schrieb
//
// Jetzt: Änderungen sammeln, gebündelt als EINZELNE ZEILEN schreiben (eine je
// Karte), bei Fehlschlag im Puffer behalten und erneut versuchen. Der Puffer
// liegt in localStorage und übersteht damit Neuladen und Flugmodus.

import { istFaellig } from './state.js';

const PUFFER_KEY = 'srs-sync-puffer';
const RUHE_MS = 2500;        // so lange nach der letzten Antwort warten
const MAX_STAU = 40;         // … oder sofort, wenn so viel aufgelaufen ist

let _sb = null, _userId = null;
let _puffer = ladePuffer();  // { "lang/deck/key": {lang, deck, key, srs, next_review, ts} }
let _decks = {};             // { "lang/deck": {lang, deck, unlocked_level, ts} }
let _timer = null;
let _laeuft = false;
let _fehler = null;          // letzte Fehlermeldung, für die Anzeige
let _horcher = [];

function ladePuffer() {
  try { return JSON.parse(localStorage.getItem(PUFFER_KEY) || '{}'); } catch { return {}; }
}
function schreibePuffer() {
  try { localStorage.setItem(PUFFER_KEY, JSON.stringify(_puffer)); } catch {}
}

export function syncInit(sb, userId) {
  _sb = sb; _userId = userId;
  // Was beim letzten Mal liegengeblieben ist, sofort nachreichen.
  if (offen()) plane(0);
  window.addEventListener('online', () => plane(0));
  melde();
}

export function offen() { return Object.keys(_puffer).length + Object.keys(_decks).length; }
export function syncFehler() { return _fehler; }

// Die UI hängt sich hier ein, um den Status anzuzeigen.
export function aufSyncStatus(fn) { _horcher.push(fn); fn(status()); }
function status() {
  return { offen: offen(), laeuft: _laeuft, fehler: _fehler, online: navigator.onLine };
}
function melde() { for (const f of _horcher) { try { f(status()); } catch {} } }

// ── Eintragen ──────────────────────────────────────────────────────────────

export function merkeKarte(lang, deck, key, karte) {
  _faelligCache = null;   // die Tagesübersicht stimmt jetzt nicht mehr
  _puffer[`${lang}/${deck}/${key}`] = {
    lang, deck, key,
    srs: karte.srs ?? 0,
    next_review: karte.nextReview ?? null,
    ts: Date.now(),
  };
  schreibePuffer();
  melde();
  plane(Object.keys(_puffer).length >= MAX_STAU ? 0 : RUHE_MS);
}

export function merkeDeck(lang, deck, unlockedLevel) {
  _decks[`${lang}/${deck}`] = { lang, deck, unlocked_level: unlockedLevel, ts: Date.now() };
  melde();
  plane(RUHE_MS);
}

function plane(ms) {
  clearTimeout(_timer);
  _timer = setTimeout(schreibe, ms);
}

// ── Schreiben ──────────────────────────────────────────────────────────────

export async function schreibe() {
  if (_laeuft || !_sb || !_userId) return;
  if (!offen()) return;
  if (!navigator.onLine) { _fehler = 'offline'; melde(); return; }

  _laeuft = true; melde();

  // Kopie ziehen: was während des Schreibens dazukommt, geht in die nächste Runde.
  const karten = Object.values(_puffer);
  const decks = Object.values(_decks);

  try {
    if (karten.length) {
      const zeilen = karten.map(k => ({
        user_id: _userId, lang: k.lang, deck: k.deck, card_key: k.key,
        srs: k.srs, next_review: k.next_review, updated_at: new Date(k.ts).toISOString(),
      }));
      const { error } = await _sb.from('srs_cards')
        .upsert(zeilen, { onConflict: 'user_id,lang,deck,card_key' });
      if (error) throw error;
      for (const k of karten) {
        const id = `${k.lang}/${k.deck}/${k.key}`;
        if (_puffer[id]?.ts === k.ts) delete _puffer[id];   // nur wenn unverändert
      }
    }

    if (decks.length) {
      const { error } = await _sb.from('srs_decks').upsert(decks.map(d => ({
        user_id: _userId, lang: d.lang, deck: d.deck,
        unlocked_level: d.unlocked_level, updated_at: new Date(d.ts).toISOString(),
      })), { onConflict: 'user_id,lang,deck' });
      if (error) throw error;
      for (const d of decks) {
        const id = `${d.lang}/${d.deck}`;
        if (_decks[id]?.ts === d.ts) delete _decks[id];
      }
    }

    _fehler = null;
    schreibePuffer();
  } catch (e) {
    // Nichts wegwerfen — beim nächsten Versuch noch mal.
    _fehler = e.message || String(e);
    schreibePuffer();
    plane(15000);
  } finally {
    _laeuft = false;
    melde();
  }
}

// Beim Verlassen der Seite noch schnell wegschreiben, was offen ist.
window.addEventListener('visibilitychange', () => { if (document.hidden) schreibe(); });
window.addEventListener('pagehide', () => { schreibe(); });

// ── Laden ──────────────────────────────────────────────────────────────────

// Liefert { cards: {key: {srs, nextReview}}, unlockedLevel } für ein Deck.
// Was im Puffer liegt, gewinnt gegen den Server — es ist neuer.
export async function ladeDeck(lang, deck) {
  const out = { cards: {}, unlockedLevel: 1 };
  if (_sb && _userId) {
    const [k, d] = await Promise.all([
      _sb.from('srs_cards').select('card_key, srs, next_review').eq('lang', lang).eq('deck', deck),
      _sb.from('srs_decks').select('unlocked_level').eq('lang', lang).eq('deck', deck).maybeSingle(),
    ]);
    if (!k.error) for (const r of (k.data || [])) {
      out.cards[r.card_key] = { srs: r.srs, nextReview: r.next_review };
    }
    if (!d.error && d.data) out.unlockedLevel = d.data.unlocked_level;
  }
  for (const p of Object.values(_puffer)) {
    if (p.lang === lang && p.deck === deck) out.cards[p.key] = { srs: p.srs, nextReview: p.next_review };
  }
  const dp = _decks[`${lang}/${deck}`];
  if (dp) out.unlockedLevel = dp.unlocked_level;
  return out;
}

// ── Tagesübersicht ─────────────────────────────────────────────────────────

// Wie viel heute in JEDER Sprache ansteht — ohne die Vokabeldaten zu laden.
//
// Das ist der Punkt: Der Trainer weiß erst, was fällig ist, wenn er die Items
// einer Sprache aus `vocab_items` geholt hat. Für eine Übersicht über alle
// Sprachen müsste er das viermal tun, bevor überhaupt ein Menü steht. Die
// Fälligkeit hängt aber gar nicht an den Items, sondern allein an
// `srs_cards.next_review` — eine Abfrage, ein paar hundert Zeilen.
//
// Gezählt wird nach Karten, nicht nach Prüfungen: Ein Zeichen mit Bedeutungs-
// und Lesungsfrage sind hier zwei Zeilen, und das ist richtig — es sind zwei
// Abfragen, die du machen musst.

let _faelligCache = null;   // { zeit, daten }
const FAELLIG_FRISCH_MS = 60_000;

export async function faelligkeiten({ neu = false } = {}) {
  if (!neu && _faelligCache && Date.now() - _faelligCache.zeit < FAELLIG_FRISCH_MS)
    return _faelligCache.daten;

  const jetzt = Date.now();
  const tagesende = new Date(); tagesende.setHours(23, 59, 59, 999);

  // Erst der Puffer: Was noch nicht hochgeschrieben ist, ist trotzdem wahr.
  const karten = new Map();   // lang/deck/key → {srs, next}
  if (_sb && _userId) {
    const { data, error } = await _sb.from('srs_cards').select('lang, deck, card_key, srs, next_review');
    if (error) return _faelligCache?.daten || {};
    for (const r of (data || [])) karten.set(`${r.lang}/${r.deck}/${r.card_key}`, { lang: r.lang, srs: r.srs, next: r.next_review });
  }
  for (const p of Object.values(_puffer)) karten.set(`${p.lang}/${p.deck}/${p.key}`, { lang: p.lang, srs: p.srs, next: p.next_review });

  const daten = {};
  for (const { lang, srs, next } of karten.values()) {
    const z = daten[lang] || (daten[lang] = { jetzt: 0, heuteNoch: 0, imUmlauf: 0, fertig: 0 });
    // Dieselbe Regel wie im Trainer, aus state.js — nicht noch einmal
    // hingeschrieben. Vorher zählte diese Stelle Karten auf Stufe 0 mit, die
    // in den Lektionsstapel gehören: im Menü stand „1 fällig“, im Trainer
    // war nichts.
    if (srs >= 9 || !next) { z.fertig++; continue; }
    if (srs < 1) continue;                        // zurückgefallen → Lektion, kein Review
    z.imUmlauf++;
    if (istFaellig(srs, next, jetzt)) z.jetzt++;
    else if (new Date(next).getTime() <= tagesende.getTime()) z.heuteNoch++;
  }
  _faelligCache = { zeit: Date.now(), daten };
  return daten;
}

// Nach jeder Antwort stimmt der Cache nicht mehr.
export function faelligVeraltet() { _faelligCache = null; }

// ── Ausfuhr ────────────────────────────────────────────────────────────────

// Alles, was an Lernstand da ist, als eine JSON-Datei. Versicherung gegen den
// Fall, dass das Supabase-Projekt verschwindet.
export async function exportiereAlles(settings) {
  const daten = { erzeugt: new Date().toISOString(), version: 1, settings, srs_cards: [], srs_decks: [] };
  if (_sb && _userId) {
    const k = await _sb.from('srs_cards').select('*');
    const d = await _sb.from('srs_decks').select('*');
    daten.srs_cards = k.data || [];
    daten.srs_decks = d.data || [];
  }
  daten.puffer = _puffer;
  const blob = new Blob([JSON.stringify(daten, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sprachen-lernstand-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return daten.srs_cards.length;
}
