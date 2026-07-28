// Fortschritt & Einstellungen (Phase 2).
// Jede Antwort wird sofort lokal gemerkt und per Upsert nach Supabase geschrieben.
// Simples SRS: gewusst → interval_days verdoppeln (min. 1), due_date = heute + Intervall;
// nochmal → Intervall 0, due_date = heute.
import { S } from './state.js';

let _sb = null;              // Supabase-Client (null = offline / nicht eingeloggt)
let _userId = null;
const _progress = new Map(); // card_id → {known_count, again_count, interval_days, due_date, updated_at}
let _settings = {};          // Inhalt von settings.data

export function progressInit(supabase, userId) {
  _sb = supabase;
  _userId = userId;
}

export function getClient() { return _sb; }

export function istEingeloggt() { return !!_userId; }

// Für den Export: der komplette Settings-Stand, wie er im Speicher liegt.
export function alleSettings() { return _settings; }

export async function abmelden() {
  if (_sb) await _sb.auth.signOut();
  location.reload();
}

function heute() {
  return new Date().toISOString().slice(0, 10);
}

// ── Laden beim Start ────────────────────────────────────────────────────────
export async function ladeProgress() {
  if (!_sb) return;
  const { data, error } = await _sb.from('progress').select('*').limit(10000);
  if (error) { console.warn('Fortschritt nicht geladen:', error.message); return; }
  _progress.clear();
  for (const row of data) _progress.set(row.card_id, row);
}

export async function ladeSettings() {
  if (!_sb) return {};
  const { data, error } = await _sb.from('settings').select('data').maybeSingle();
  if (error) { console.warn('Settings nicht geladen:', error.message); return {}; }
  _settings = data?.data || {};
  return _settings;
}

// ── Antworten speichern ─────────────────────────────────────────────────────
export function recordAnswer(cardId, gewusst) {
  if (!cardId) return; // synthetische Fragen (z.B. Kapiteltest-Vokabel-MC) haben keine ID

  const alt = _progress.get(cardId) || { known_count: 0, again_count: 0, interval_days: 0, due_date: null };
  const eintrag = { ...alt, card_id: cardId };

  if (gewusst) {
    eintrag.known_count++;
    eintrag.interval_days = Math.max(1, eintrag.interval_days * 2);
  } else {
    eintrag.again_count++;
    eintrag.interval_days = 0;
  }
  const due = new Date();
  due.setDate(due.getDate() + eintrag.interval_days);
  eintrag.due_date = due.toISOString().slice(0, 10);
  eintrag.updated_at = new Date().toISOString();

  _progress.set(cardId, eintrag);

  if (_sb && _userId) {
    _sb.from('progress')
      .upsert({ user_id: _userId, ...eintrag })
      .then(({ error }) => { if (error) console.warn('Fortschritt nicht gespeichert:', error.message); });
  }
}

export function getProgress(cardId) {
  return _progress.get(cardId) || null;
}

// ── Fällige Karten (SRS-Wiederholung über alle Kapitel einer Sprache) ──────
export function getFaelligeKarten(sprache) {
  const faellig = [];
  const stichtag = heute();
  for (const kap of (sprache.kapitel || [])) {
    for (const uk of (kap.unterkapitel || [])) {
      for (const einheit of (uk.einheiten || [])) {
        if (einheit.typ !== 'vokabeln' || !einheit.karten) continue;
        for (const karte of einheit.karten) {
          const p = karte.id && _progress.get(karte.id);
          if (p && p.due_date && p.due_date <= stichtag) faellig.push(karte);
        }
      }
    }
  }
  return faellig;
}

// Fortschritt einer Einheit: wie viele Karten/Fragen schon mal gewusst wurden
export function einheitFortschritt(einheit) {
  const items = einheit.karten || einheit.fragen || einheit.aufgaben || [];
  let gelernt = 0;
  for (const item of items) {
    const p = item.id && _progress.get(item.id);
    if (p && p.known_count > 0) gelernt++;
  }
  return { gelernt, total: items.length };
}

// ── Settings (zuletzt geöffnete Position, Eingabemodus) ─────────────────────
export function getSetting(key) {
  return _settings[key] !== undefined ? _settings[key] : getLokalesSetting(key);
}

export function setSetting(key, value) {
  _settings[key] = value;
  // Pro Gerät zusätzlich lokal (z.B. Eingabemodus Handy≠PC, Phase 3)
  try { localStorage.setItem('setting-' + key, JSON.stringify(value)); } catch {}
  if (_sb && _userId) {
    _sb.from('settings')
      .upsert({ user_id: _userId, data: _settings, updated_at: new Date().toISOString() })
      .then(({ error }) => { if (error) console.warn('Settings nicht gespeichert:', error.message); });
  }
}

export function getLokalesSetting(key) {
  try {
    const raw = localStorage.getItem('setting-' + key);
    return raw ? JSON.parse(raw) : undefined;
  } catch { return undefined; }
}
