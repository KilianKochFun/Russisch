// Review-Vorschau — gemeinsam für den Russisch-SRS und den Mandarin-Trainer.
//
// Beide speichern ihre Karten in derselben Form ({srs, nextReview}), also gibt es
// hier auch nur eine Implementierung. Wer sie aufruft, liefert nur zwei Dinge mit:
// die Karten und eine Funktion, die aus einem Schlüssel etwas Anzeigbares macht.
//
// Was die Ansicht kann, und was die alte nicht konnte: sie zeigt nicht nur, *wie
// viele* Karten wann drankommen, sondern auch *welche*. Ein Tag lässt sich
// aufklappen, dann stehen die Stunden da, und in jeder Stunde die Karten selbst.

import { S } from './state.js';
import { SRS_STAGES } from './state.js';

const STUNDE = 3600000;
const TAG = 86400000;
const TAGE = 7;              // so weit reicht die Tagesansicht
const WOCHENTAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

// Karten, die nie wieder drankommen: neu (noch nicht gelernt) oder gebrannt.
const zaehlt = c => c && c.srs >= 1 && c.srs < 9 && c.nextReview;

function stufeVon(srs) {
  return SRS_STAGES[srs] || SRS_STAGES[0];
}

// ── Rechnen ────────────────────────────────────────────────────────────────

// Ein einziger Durchlauf über alle Karten. Die alte Fassung lief 7×24-mal durch
// den ganzen Bestand; bei ein paar tausend Karten ist das spürbar.
export function berechneEimer(cards) {
  const jetzt = Date.now();
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const tag0 = heute.getTime();

  const tage = [];
  for (let d = 0; d < TAGE; d++) {
    tage.push({ index: d, start: tag0 + d * TAG, anzahl: 0, stunden: new Map() });
  }
  const faellig = [];          // schon überfällig
  let spaeter = 0;             // jenseits der sieben Tage

  for (const [key, c] of Object.entries(cards || {})) {
    if (!zaehlt(c)) continue;
    const t = new Date(c.nextReview).getTime();
    if (!Number.isFinite(t)) continue;

    if (t <= jetzt) { faellig.push({ key, srs: c.srs, t }); continue; }

    const d = Math.floor((t - tag0) / TAG);
    if (d < 0 || d >= TAGE) { spaeter++; continue; }

    const tagObj = tage[d];
    tagObj.anzahl++;
    const h = new Date(t).getHours();
    if (!tagObj.stunden.has(h)) tagObj.stunden.set(h, []);
    tagObj.stunden.get(h).push({ key, srs: c.srs, t });
  }

  faellig.sort((a, b) => a.t - b.t);
  return { faellig, tage, spaeter, jetzt };
}

function tagName(index, start) {
  if (index === 0) return 'Heute';
  if (index === 1) return 'Morgen';
  const d = new Date(start);
  return `${WOCHENTAGE[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}.`;
}

// ── Anzeige ────────────────────────────────────────────────────────────────

let _ctx = null;   // {cards, aufloesen, titel, zurueck}

export function zeigeForecast(ctx) {
  if (ctx) {
    _ctx = ctx;
    if (S.fcCursor == null) S.fcCursor = 0;
    if (S.fcOffen == null) S.fcOffen = -1;
  }
  if (!_ctx) return;

  S.state = 'forecast';
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('forecast-screen').classList.add('active');

  const { faellig, tage, spaeter } = berechneEimer(_ctx.cards);
  const max = Math.max(1, ...tage.map(t => t.anzahl));
  const gesamt = faellig.length + tage.reduce((s, t) => s + t.anzahl, 0) + spaeter;

  document.getElementById('forecast-titel').textContent = _ctx.titel || 'Review-Vorschau';

  // Kopfzeile: was jetzt ansteht, und wie viel insgesamt noch im Umlauf ist
  document.getElementById('forecast-kopf').innerHTML = `
    <div style="display:flex;gap:24px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;">
      <div style="text-align:center;">
        <div style="font-family:var(--display);font-size:34px;font-weight:900;color:${faellig.length ? 'var(--green)' : 'var(--muted)'};line-height:1;">${faellig.length}</div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:.1em;margin-top:4px;">JETZT FÄLLIG</div>
      </div>
      <div style="text-align:center;">
        <div style="font-family:var(--display);font-size:34px;font-weight:900;line-height:1;">${tage[0].anzahl}</div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:.1em;margin-top:4px;">HEUTE NOCH</div>
      </div>
      <div style="text-align:center;">
        <div style="font-family:var(--display);font-size:34px;font-weight:900;line-height:1;">${gesamt}</div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:.1em;margin-top:4px;">IM UMLAUF</div>
      </div>
    </div>`;

  const zeilen = eimerListe(faellig, tage, spaeter);
  const box = document.getElementById('forecast-liste');
  box.innerHTML = zeilen.map((z, i) => zeileHtml(z, i, max)).join('');

  // Klick/Touch: dieselbe Wirkung wie das Pedal
  [...box.children].forEach((el, i) => {
    el.style.cursor = 'pointer';
    el.onclick = () => { S.fcCursor = i; forecastSelect(); };
  });

  const aktiv = box.children[S.fcCursor];
  aktiv?.scrollIntoView({ block: 'nearest' });
}

// Die Liste, durch die das Pedal läuft: die Tage plus „Später“ plus „Zurück“.
function eimerListe(faellig, tage, spaeter) {
  const zeilen = tage.map(t => ({ art: 'tag', tag: t }));
  if (spaeter > 0) zeilen.push({ art: 'spaeter', anzahl: spaeter });
  zeilen.push({ art: 'zurueck' });
  return zeilen;
}

function zeileHtml(z, i, max) {
  const gewaehlt = i === S.fcCursor;
  const rahmen = gewaehlt ? 'border-left:3px solid var(--accent);' : 'border-left:3px solid transparent;';
  const pad = 'padding:8px 10px;';

  if (z.art === 'zurueck') {
    return `<div style="${rahmen}${pad}color:var(--muted);font-family:var(--mono);font-size:12px;">
      ${gewaehlt ? '›' : '&nbsp;'} Zurück</div>`;
  }
  if (z.art === 'spaeter') {
    return `<div style="${rahmen}${pad}display:flex;justify-content:space-between;font-family:var(--mono);font-size:12px;color:var(--muted);">
      <span>${gewaehlt ? '›' : '&nbsp;'} Später als 7 Tage</span><span>${z.anzahl}</span></div>`;
  }

  const t = z.tag;
  const offen = S.fcOffen === t.index;
  const breite = Math.round((t.anzahl / max) * 100);

  let html = `<div style="${rahmen}${pad}">
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-family:var(--mono);font-size:12px;min-width:90px;color:${offen ? 'var(--accent)' : 'inherit'};">
        ${gewaehlt ? '›' : '&nbsp;'} ${tagName(t.index, t.start)}
      </span>
      <span style="flex:1;height:10px;background:var(--border);border-radius:2px;overflow:hidden;">
        <span style="display:block;height:100%;width:${breite}%;background:${t.anzahl ? 'var(--accent)' : 'transparent'};"></span>
      </span>
      <span style="font-family:var(--mono);font-size:12px;min-width:34px;text-align:right;color:${t.anzahl ? 'inherit' : 'var(--muted)'};">${t.anzahl}</span>
    </div>`;

  if (offen) html += stundenHtml(t);
  return html + '</div>';
}

// Reihenfolge der Kartenarten — so, wie sie auch gelernt werden.
const GRUPPEN_FOLGE = ['Zhuyin', 'Radikale', 'Zeichen', 'Wörter'];

function chip(k, inhalt) {
  const st = stufeVon(k.srs);
  const titel = `${inhalt.hinten || ''} · ${st.name}`.trim();
  return `<span title="${escape2(titel)}" style="font-size:12px;padding:2px 6px;border:1px solid ${st.color};
    color:${st.color};border-radius:3px;white-space:nowrap;">${escape2(inhalt.vorne)}</span>`;
}

// Aufgeklappter Tag: Stunde für Stunde, und in jeder Stunde die Karten selbst.
// Liefert `aufloesen` einen Gruppennamen mit (Mandarin: Radikal / Zeichen / Wort),
// wird die Stunde danach gegliedert — sonst stehen die Karten schlicht in einer Reihe.
function stundenHtml(tag) {
  if (tag.anzahl === 0) {
    return `<div style="font-family:var(--mono);font-size:11px;color:var(--muted);padding:8px 0 4px 12px;">
      Keine Reviews an diesem Tag.</div>`;
  }
  const stunden = [...tag.stunden.entries()].sort((a, b) => a[0] - b[0]);
  let html = '<div style="margin:8px 0 4px 12px;border-left:1px solid var(--border);padding-left:12px;">';

  for (const [h, karten] of stunden) {
    html += `<div style="margin-bottom:10px;">
      <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:3px;">
        ${String(h).padStart(2, '0')}:00 &nbsp;·&nbsp; ${karten.length}
      </div>`;

    // Karten auflösen und nach Art bündeln
    const nachGruppe = new Map();
    for (const k of karten) {
      const inhalt = _ctx.aufloesen?.(k.key);
      if (!inhalt) continue;
      const g = inhalt.gruppe || '';
      if (!nachGruppe.has(g)) nachGruppe.set(g, []);
      nachGruppe.get(g).push(chip(k, inhalt));
    }

    if (nachGruppe.size === 1 && nachGruppe.has('')) {
      html += `<div style="display:flex;flex-wrap:wrap;gap:4px;">${nachGruppe.get('').join('')}</div>`;
    } else {
      const namen = [...nachGruppe.keys()].sort(
        (a, b) => (GRUPPEN_FOLGE.indexOf(a) + 1 || 99) - (GRUPPEN_FOLGE.indexOf(b) + 1 || 99));
      for (const g of namen) {
        html += `<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:3px;">
          <span style="font-family:var(--mono);font-size:10px;color:var(--muted);min-width:62px;flex-shrink:0;">${escape2(g) || '—'}</span>
          <span style="display:flex;flex-wrap:wrap;gap:4px;">${nachGruppe.get(g).join('')}</span>
        </div>`;
      }
    }
    html += '</div>';
  }
  return html + '</div>';
}

const escape2 = s => String(s ?? '').replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ── Steuerung ──────────────────────────────────────────────────────────────

function zeilenAnzahl() {
  const { tage, spaeter } = berechneEimer(_ctx.cards);
  return tage.length + (spaeter > 0 ? 1 : 0) + 1;
}

export function forecastMove(dir) {
  const n = zeilenAnzahl();
  S.fcCursor = ((S.fcCursor || 0) + dir + n) % n;
  zeigeForecast();
}

export function forecastSelect() {
  const n = zeilenAnzahl();
  if (S.fcCursor === n - 1) {          // „Zurück“
    S.fcOffen = -1;
    _ctx.zurueck?.();
    return;
  }
  const { spaeter } = berechneEimer(_ctx.cards);
  if (spaeter > 0 && S.fcCursor === n - 2) return;   // „Später“ klappt nicht auf

  S.fcOffen = (S.fcOffen === S.fcCursor) ? -1 : S.fcCursor;
  zeigeForecast();
}

Object.assign(window, { zeigeForecast, forecastMove, forecastSelect });
