// Lädt Lerninhalte (vocab_items) aus Supabase — nur mit Login lesbar (RLS).
import { getClient } from './progress.js';

const _cache = {};

export async function ladeDeckItems(language) {
  if (_cache[language]) return _cache[language];
  const sb = getClient();
  if (!sb) return ladeOffline(language, 'Nicht eingeloggt — Inhalte sind nur mit Anmeldung verfügbar.');

  // Supabase liefert max. 1000 Zeilen pro Request → seitenweise laden
  const alle = [];
  const SEITE = 1000;
  for (let von = 0; ; von += SEITE) {
    const { data, error } = await sb
      .from('vocab_items')
      .select('item_type, level, position, data')
      .eq('language', language)
      .order('item_type', { ascending: true })
      .order('level', { ascending: true })
      .order('position', { ascending: true })
      .range(von, von + SEITE - 1);
    if (error) return ladeOffline(language, 'Inhalte nicht geladen: ' + error.message);
    alle.push(...data);
    if (data.length < SEITE) break;
  }
  _cache[language] = alle;
  // Offline-Kopie für die PWA (Flugmodus etc.)
  try { localStorage.setItem('deck-' + language, JSON.stringify(alle)); } catch {}
  return alle;
}

// Fallback: zuletzt geladene Inhalte aus localStorage (offline)
function ladeOffline(language, grund) {
  try {
    const raw = localStorage.getItem('deck-' + language);
    if (raw) {
      console.warn('Offline-Inhalte:', grund);
      return (_cache[language] = JSON.parse(raw));
    }
  } catch {}
  throw new Error(grund);
}
