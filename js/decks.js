// Lädt Lerninhalte (vocab_items) aus Supabase — nur mit Login lesbar (RLS).
import { getClient } from './progress.js';

const _cache = {};

export async function ladeDeckItems(language) {
  if (_cache[language]) return _cache[language];
  const sb = getClient();
  if (!sb) throw new Error('Nicht eingeloggt — Inhalte sind nur mit Anmeldung verfügbar.');
  const { data, error } = await sb
    .from('vocab_items')
    .select('item_type, level, position, data')
    .eq('language', language)
    .order('level', { ascending: true })
    .order('position', { ascending: true })
    .limit(10000);
  if (error) throw new Error('Inhalte nicht geladen: ' + error.message);
  _cache[language] = data;
  return data;
}
