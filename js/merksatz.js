// Eigene Merksätze pro Karte.
//
// Die mitgelieferten Merksätze sind allgemein gedacht; der, den man sich selbst
// ausdenkt, sitzt besser. Deshalb kann jede Karte einen eigenen bekommen — ein
// Zeichen, ein Radikal, ein Baustein, ein Wort, egal.
//
// Der Schlüssel ist der Item-Key OHNE Prüfungssuffix: Ein Merksatz gehört zum
// Zeichen, nicht zu einer seiner beiden Abfragen. `character:好` bekommt einen,
// nicht `character:好#lesung` und `character:好#bedeutung` je einen.
//
// Geladen wird einmal je Sprache, damit die Kartenanzeige synchron darauf
// zugreifen kann — sie baut HTML-Strings und kann nicht warten.

import { getClient } from './progress.js';

const _cache = {};          // lang → { key: text }
let _aktuelleSprache = null;

const lokalKey = lang => 'merksaetze-' + lang;

// ── Laden ──────────────────────────────────────────────────────────────────

export async function ladeMerksaetze(lang) {
  _aktuelleSprache = lang;
  if (_cache[lang]) return _cache[lang];

  // Erst die lokale Kopie: Im Zug ohne Netz sind die eigenen Merksätze das
  // Letzte, worauf man verzichten will.
  let map = {};
  try { map = JSON.parse(localStorage.getItem(lokalKey(lang)) || '{}'); } catch {}
  _cache[lang] = map;

  const sb = getClient();
  if (sb) {
    const { data, error } = await sb.from('merksaetze').select('card_key, text').eq('lang', lang);
    if (!error) {
      map = {};
      for (const r of (data || [])) map[r.card_key] = r.text;
      _cache[lang] = map;
      try { localStorage.setItem(lokalKey(lang), JSON.stringify(map)); } catch {}
    }
  }
  return _cache[lang];
}

// Synchron — die Kartenanzeige baut Strings und kann nicht warten.
export function merksatzVon(key, lang = _aktuelleSprache) {
  return _cache[lang]?.[basis(key)] || '';
}

// Prüfungssuffix abschneiden: `character:好#lesung` → `character:好`
const basis = key => String(key).split('#')[0];

// ── Ändern ─────────────────────────────────────────────────────────────────

export async function setzeMerksatz(lang, key, text) {
  const k = basis(key);
  const sauber = (text || '').trim().slice(0, 500);
  const map = _cache[lang] || (_cache[lang] = {});

  if (sauber) map[k] = sauber; else delete map[k];
  try { localStorage.setItem(lokalKey(lang), JSON.stringify(map)); } catch {}

  const sb = getClient();
  if (!sb) return;
  const { data: sess } = await sb.auth.getUser();
  const uid = sess?.user?.id;
  if (!uid) return;

  if (sauber) {
    await sb.from('merksaetze').upsert({
      user_id: uid, lang, card_key: k, text: sauber, updated_at: new Date().toISOString(),
    });
  } else {
    await sb.from('merksaetze').delete().eq('lang', lang).eq('card_key', k);
  }
}

// Der eine Weg, einen Merksatz zu bearbeiten — von der Karte wie von der
// Detailseite aus. `nachher` zeichnet neu, was gerade sichtbar ist.
export async function bearbeiteMerksatz(lang, key, nachher) {
  const alt = merksatzVon(key, lang);
  const neu = prompt(
    'Dein Merksatz für diese Karte.\nLeer lassen und OK drücken löscht ihn.',
    alt);
  if (neu === null) return;               // abgebrochen
  if (neu.trim() === alt) return;
  await setzeMerksatz(lang, key, neu);
  nachher?.();
}

// Ein Kasten für die Kartenrückseite und die Detailseite. Immer sichtbar,
// auch wenn noch nichts drinsteht — sonst findet man die Stelle nie.
export function merksatzHtml(key, lang = _aktuelleSprache) {
  const t = merksatzVon(key, lang);
  const inhalt = t
    ? `<span style="white-space:pre-wrap;">${t.replace(/</g, '&lt;')}</span>`
    : '<span style="opacity:.55;">✎ eigenen Merksatz hinzufügen</span>';
  return `<div class="mein-merksatz" data-merksatz="${String(key).replace(/"/g, '&quot;')}"
    title="Antippen zum Bearbeiten"
    style="margin-top:12px;padding:8px 12px;border:1px dashed var(--border);border-radius:8px;
           font-size:14px;cursor:pointer;text-align:left;">${inhalt}</div>`;
}
