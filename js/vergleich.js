// Vergleich: die eigene Bestenliste neben der von anderen — gesamt und je Sprache.
//
// Die Zahlen kommen aus der Datenbankfunktion `bestenliste()`. Die läuft mit
// `security definer` an der Zeilensicherheit vorbei, gibt aber ausschließlich
// Summen zurück; einzelne Karten anderer Leute bekommt niemand zu sehen.
// Siehe supabase/migrations/20260807120000_bestenliste.sql.
//
// Hängt sich wie trainer.js und buecher.js an `window`, um Import-Zyklen mit
// ui.js zu vermeiden.

import { S } from './state.js';
import { getClient } from './progress.js';

// Anzeigenamen der Sprachen. Was hier fehlt, wird mit seinem rohen Schlüssel
// angezeigt — besser eine hässliche Zeile als eine verschwundene Sprache.
const SPRACH_NAME = {
  'chinese-tw':    '🇹🇼 Mandarin',
  'russian-morph': '🇷🇺 Russisch (Bausteine)',
  'russian':       '🇷🇺 Russisch (Vokabeln)',
  'french':        '🇫🇷 Französisch',
  'kurdish':       '🌞 Kurdisch (Kurmancî)',
};

let _zeilen = null;      // Rohdaten der letzten Abfrage
let _meineId = null;

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ── Daten ──────────────────────────────────────────────────────────────────

async function hole() {
  const sb = getClient();
  if (!sb) return null;
  const [{ data, error }, { data: sess }] = await Promise.all([
    sb.rpc('bestenliste'),
    sb.auth.getUser(),
  ]);
  if (error) throw error;
  _meineId = sess?.user?.id || null;
  return data || [];
}

// Eine Zeile je Nutzer, über alle Sprachen summiert.
function summiere(zeilen) {
  const proNutzer = new Map();
  for (const z of zeilen) {
    const v = proNutzer.get(z.user_id) || { user_id: z.user_id, name: z.name, karten: 0, gelernt: 0, guru: 0, gebrannt: 0, sprachen: 0 };
    v.karten += Number(z.karten);
    v.gelernt += Number(z.gelernt);
    v.guru += Number(z.guru);
    v.gebrannt += Number(z.gebrannt);
    v.sprachen++;
    proNutzer.set(z.user_id, v);
  }
  return [...proNutzer.values()];
}

// Sortiert wird nach Guru — nicht nach der reinen Kartenzahl. Wer tausend
// Karten einmal gesehen hat, kann weniger als wer dreihundert wirklich sitzen
// hat, und eine Bestenliste soll das Richtige belohnen.
const nachGuru = (a, b) => b.guru - a.guru || b.gelernt - a.gelernt;

// ── Anzeige ────────────────────────────────────────────────────────────────

function balken(anteil, farbe) {
  const p = Math.round(Math.max(0, Math.min(1, anteil)) * 100);
  return `<span style="display:inline-block;width:70px;height:6px;border-radius:3px;background:var(--border);vertical-align:middle;overflow:hidden;">
    <span style="display:block;width:${p}%;height:100%;background:${farbe};"></span></span>`;
}

function tabelle(eintraege, zeigeSprachen) {
  if (!eintraege.length) return '<p style="color:var(--muted);">Noch niemand.</p>';
  const max = Math.max(...eintraege.map(e => e.guru), 1);
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr style="color:var(--muted);font-size:12px;text-align:left;">
      <th style="padding:4px 6px;width:28px;"></th><th style="padding:4px 6px;">Name</th>
      <th style="padding:4px 6px;text-align:right;">Guru+</th>
      <th style="padding:4px 6px;text-align:right;">gelernt</th>
      <th style="padding:4px 6px;text-align:right;">fertig</th>
      <th style="padding:4px 6px;"></th>
    </tr>
    ${eintraege.map((e, i) => {
      const ich = e.user_id === _meineId;
      return `<tr style="${ich ? 'background:var(--accent-soft,rgba(99,102,241,.12));font-weight:700;' : ''}border-top:1px solid var(--border);">
        <td style="padding:6px;color:var(--muted);">${i + 1}</td>
        <td style="padding:6px;">${e.name}${ich ? ' <span style="color:var(--accent);">· du</span>' : ''}${
          zeigeSprachen && e.sprachen > 1 ? ` <span style="color:var(--muted);font-weight:400;">· ${e.sprachen} Sprachen</span>` : ''}</td>
        <td style="padding:6px;text-align:right;">${e.guru}</td>
        <td style="padding:6px;text-align:right;color:var(--muted);">${e.gelernt}</td>
        <td style="padding:6px;text-align:right;color:var(--muted);">${e.gebrannt}</td>
        <td style="padding:6px;">${balken(e.guru / max, 'var(--accent)')}</td>
      </tr>`;
    }).join('')}
  </table>`;
}

function abschnitt(titel, unter, eintraege, zeigeSprachen) {
  return `<div style="margin-bottom:26px;">
    <div style="font-family:var(--display);font-weight:900;font-size:15px;margin-bottom:2px;">${titel}</div>
    <div style="color:var(--muted);font-size:12px;margin-bottom:8px;">${unter}</div>
    ${tabelle(eintraege, zeigeSprachen)}
  </div>`;
}

function render() {
  const el = document.getElementById('vergleich-content');
  if (!_zeilen) { el.innerHTML = '<p style="color:var(--muted);">Wird geladen …</p>'; return; }
  if (!_zeilen.length) {
    el.innerHTML = `<p style="color:var(--muted);">Noch hat niemand etwas gelernt — auch du nicht.
      Sobald die erste Karte auf Apprentice steht, steht hier eine Liste.</p>`;
    return;
  }

  const gesamt = summiere(_zeilen).sort(nachGuru);
  const meiner = gesamt.find(e => e.user_id === _meineId);
  const platz = meiner ? gesamt.indexOf(meiner) + 1 : null;

  let html = '';
  if (platz) {
    html += `<div style="margin-bottom:20px;padding:12px 14px;border:1px solid var(--border);border-radius:10px;">
      <div style="font-size:13px;color:var(--muted);">Über alle Sprachen</div>
      <div style="font-size:22px;font-weight:900;font-family:var(--display);">Platz ${platz} von ${gesamt.length}</div>
      <div style="font-size:13px;color:var(--muted);">${meiner.guru} Karten auf Guru oder höher · ${meiner.gelernt} überhaupt gelernt</div>
    </div>`;
  }

  html += abschnitt('Gesamt', 'Alle Sprachen zusammengezählt, sortiert nach Karten ab Guru', gesamt, true);

  // Je Sprache, die mit den meisten Lernenden zuerst
  const sprachen = [...new Set(_zeilen.map(z => z.lang))]
    .map(l => ({ lang: l, eintraege: _zeilen.filter(z => z.lang === l)
      .map(z => ({ ...z, karten: +z.karten, gelernt: +z.gelernt, guru: +z.guru, gebrannt: +z.gebrannt }))
      .sort(nachGuru) }))
    .sort((a, b) => b.eintraege.length - a.eintraege.length);

  for (const s of sprachen) {
    html += abschnitt(SPRACH_NAME[s.lang] || s.lang,
      `${s.eintraege.length} ${s.eintraege.length === 1 ? 'Lernender' : 'Lernende'}`,
      s.eintraege, false);
  }

  html += `<p style="color:var(--muted);font-size:12px;margin-top:20px;">
    Sortiert nach <b>Guru+</b>, nicht nach der reinen Kartenzahl: Wer tausend Karten
    einmal gesehen hat, kann weniger als wer dreihundert wirklich sitzen hat.
    Andere sehen von dir nur diese Summen und deinen Namen — keine einzelne Karte.</p>`;

  el.innerHTML = html;
}

// ── Name ───────────────────────────────────────────────────────────────────

export async function vergleichSetzeNamen() {
  const alt = _zeilen?.find(z => z.user_id === _meineId)?.name;
  const name = prompt('Wie sollst du in der Bestenliste heißen? (1–24 Zeichen)',
    alt && alt !== 'ohne Namen' ? alt : '');
  if (name === null) return;
  const sauber = name.trim().slice(0, 24);
  if (!sauber) return;
  const sb = getClient();
  if (!sb || !_meineId) return;
  const { error } = await sb.from('profiles')
    .upsert({ user_id: _meineId, name: sauber, updated_at: new Date().toISOString() });
  if (error) { alert('Ging nicht: ' + error.message); return; }
  await vergleichZeige();
}

// ── Einstieg ───────────────────────────────────────────────────────────────

export async function vergleichZeige() {
  S.state = 'vergleich';
  show('vergleich-screen');
  _zeilen = null;
  render();
  try {
    _zeilen = await hole();
  } catch (e) {
    document.getElementById('vergleich-content').innerHTML =
      `<p style="color:var(--bad,#c0392b);">Die Bestenliste ließ sich nicht laden: ${e.message}</p>`;
    return;
  }
  render();
}

window.vergleichZeige = vergleichZeige;
window.vergleichSetzeNamen = vergleichSetzeNamen;
