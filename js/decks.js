// Lädt Lerninhalte (vocab_items) aus Supabase — nur mit Login lesbar (RLS).
import { getClient } from './progress.js';

const _cache = {};

export async function ladeDeckItems(language) {
  if (_cache[language]) return _cache[language];
  const sb = getClient();
  if (!sb) throw new Error('Nicht eingeloggt — Inhalte sind nur mit Anmeldung verfügbar.');

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
    if (error) throw new Error('Inhalte nicht geladen: ' + error.message);
    alle.push(...data);
    if (data.length < SEITE) break;
  }
  _cache[language] = alle;
  return alle;
}
