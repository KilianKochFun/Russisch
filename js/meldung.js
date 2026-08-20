// „Hier stimmt was nicht“ — Meldungen zu einzelnen Karten.
//
// Der Zweck ist eine Rückmeldeschleife. Wenn eine Übersetzung falsch ist oder
// eine Lesung nicht stimmt, fällt das beim Lernen auf — und genau dann will
// man nicht Fehler melden, sondern lernen. Ein Knopf auf der Karte fängt es
// auf; gelesen wird später über scripts/meldungen.js.
//
// Die Antwort läuft denselben Weg zurück: Was dort geschrieben wird, steht in
// der App unter der Karte. Eine Meldung, auf die nie jemand reagiert, meldet
// man kein zweites Mal.
//
// Wie merksatz.js: einmal je Sprache geladen, damit die Kartenanzeige synchron
// darauf zugreifen kann — sie baut HTML-Strings und kann nicht warten.

import { getClient } from './progress.js';
import { escapeHtml } from './html.js';

const _cache = {};            // lang → { card_key: [meldung, …] }
let _aktuelleSprache = null;

const basis = key => String(key).split('#')[0];
const lokalKey = lang => 'meldungen-' + lang;

const STATUS_TEXT = {
  offen:     { farbe: 'var(--muted)',            wort: 'gemeldet' },
  geaendert: { farbe: 'var(--green,#2ecc71)',    wort: 'geändert' },
  bleibt:    { farbe: 'var(--accent)',           wort: 'bleibt so' },
  erledigt:  { farbe: 'var(--muted)',            wort: 'erledigt' },
};

// ── Laden ──────────────────────────────────────────────────────────────────

export async function ladeMeldungen(lang) {
  _aktuelleSprache = lang;
  let map = {};
  try { map = JSON.parse(localStorage.getItem(lokalKey(lang)) || '{}'); } catch {}
  _cache[lang] = map;

  const sb = getClient();
  if (!sb) return map;
  const { data, error } = await sb.from('meldungen')
    .select('card_key, text, status, antwort, created_at').eq('lang', lang)
    .order('created_at', { ascending: false });
  if (error) return map;

  map = {};
  for (const r of (data || [])) (map[r.card_key] = map[r.card_key] || []).push(r);
  _cache[lang] = map;
  try { localStorage.setItem(lokalKey(lang), JSON.stringify(map)); } catch {}
  return map;
}

export function meldungenVon(key, lang = _aktuelleSprache) {
  return _cache[lang]?.[basis(key)] || [];
}

// ── Melden ─────────────────────────────────────────────────────────────────

export async function melde(lang, key, anzeige, nachher) {
  const text = prompt(
    'Was stimmt hier nicht?\n\n'
    + 'Zum Beispiel: „Die Bedeutung ist falsch, das heißt eher …“ oder\n'
    + '„Die Lesung stimmt nicht“ oder „Das Wort benutzt niemand“.\n\n'
    + 'Wird gelesen und beantwortet — die Antwort steht danach hier auf der Karte.');
  if (text === null || !text.trim()) return;

  const sb = getClient();
  if (!sb) { alert('Ohne Verbindung lässt sich nichts melden.'); return; }
  const { data: sess } = await sb.auth.getUser();
  const uid = sess?.user?.id;
  if (!uid) return;

  const zeile = {
    user_id: uid, lang, card_key: basis(key), anzeige: anzeige || null,
    text: text.trim().slice(0, 1000), status: 'offen',
  };
  const { error } = await sb.from('meldungen').insert(zeile);
  if (error) { alert('Meldung nicht gespeichert: ' + error.message); return; }

  const map = _cache[lang] || (_cache[lang] = {});
  (map[basis(key)] = map[basis(key)] || []).unshift({ ...zeile, created_at: new Date().toISOString() });
  try { localStorage.setItem(lokalKey(lang), JSON.stringify(map)); } catch {}
  nachher?.();
}

// ── Anzeige ────────────────────────────────────────────────────────────────
// Der Knopf steht immer da; darunter, was schon gemeldet wurde, samt Antwort.

export function meldungHtml(key, anzeige, lang = _aktuelleSprache) {
  const eigene = meldungenVon(key, lang);
  const liste = eigene.map(m => {
    const st = STATUS_TEXT[m.status] || STATUS_TEXT.offen;
    return `<div style="margin-top:6px;font-size:13px;text-align:left;">
      <span style="font-family:var(--mono);font-size:10px;color:${st.farbe};">${st.wort.toUpperCase()}</span>
      &nbsp;<span style="color:var(--muted);">${escapeHtml(m.text)}</span>
      ${m.antwort ? `<div style="margin-top:3px;padding-left:10px;border-left:2px solid ${st.farbe};">${escapeHtml(m.antwort)}</div>` : ''}
    </div>`;
  }).join('');

  return `<div style="margin-top:8px;text-align:left;">
    <span class="melde-knopf" data-melde="${escapeHtml(key)}" data-anzeige="${escapeHtml(anzeige || '')}"
      title="Fehler oder Anmerkung zu dieser Karte melden"
      style="display:inline-block;font-size:12px;color:var(--muted);border:1px dashed var(--border);
             border-radius:8px;padding:4px 10px;cursor:pointer;">⚑ stimmt hier was nicht?</span>
    ${liste}
  </div>`;
}
