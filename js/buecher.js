// Bücherregal: die selbstgebauten Lehrbücher als PDF, direkt im Browser lesbar.
//
// Die PDFs liegen im Supabase-Bucket `buecher`, der NICHT public ist. Ohne gültige
// Session gibt es keine URL, die funktioniert. Nach dem Login holt sich die App
// eine signierte URL mit kurzer Laufzeit und hängt sie in ein <iframe> — der
// eingebaute PDF-Viewer des Browsers übernimmt Anzeige, Zoom und Suche.
// Herunterladen geht ebenfalls, über denselben Link.
//
// Hängt sich wie trainer.js an `window`, um Import-Zyklen mit ui.js zu vermeiden.

import { S } from './state.js';

const BUECHER = [
  {
    datei: 'japanisch.pdf',
    titel: '🇯🇵 Japanese from the Inside Out',
    unter: '367 Seiten · N3 → N2 · Grammatik nach Tae Kim',
    beschreibung: 'Lesekurs ohne Schreibaufgaben. Kanji der WaniKani-Level 1–10 ' +
                  'stehen blank, alles andere trägt Furigana. Lesetexte ohne ' +
                  'Englisch, Übersetzungen zeilenweise im Lösungsteil.',
  },
  {
    datei: 'franzoesisch.pdf',
    titel: '🇫🇷 Französisch für Deutschsprachige',
    unter: '80 Seiten · bis A1 · Teil I: Aussprache',
    beschreibung: 'Auf Deutsch. Aussprache in deutscher Näherung statt ' +
                  'Lautschrift. Der Kern sind die Brücken: das Dach auf forêt ' +
                  'markiert ein verlorenes s — und das steht in „Forst“ noch da.',
  },
  {
    datei: 'chinesisch.pdf',
    titel: '🇹🇼 Chinese from the Inside Out',
    unter: '278 Seiten · Traditionell · 160 Zeichen, 88 Wörter',
    beschreibung: 'Aufbau vom Zeichen her: jedes Zeichen wird zerlegt, jede ' +
                  'Lesung in Zhuyin erklärt. Lesetexte nutzen ausschließlich ' +
                  'Zeichen, die vorher eingeführt wurden.',
  },
];

// Signierte URLs eine Stunde lang cachen, damit Zurückblättern nicht jedes Mal
// eine neue Runde zum Server kostet.
const _urlCache = {}; // datei → { url, bis }

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ── Liste ──────────────────────────────────────────────────────────────────

export function buecherShowListe() {
  S.state = 'buecher-liste';
  if (S.buecherCursor == null) S.buecherCursor = 0;
  show('buecher-screen');

  const list = document.getElementById('buecher-list');
  list.innerHTML = '';

  BUECHER.forEach((b, i) => {
    const div = document.createElement('div');
    div.className = 'menu-item' + (i === S.buecherCursor ? ' selected' : '');
    div.innerHTML = `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name">${b.titel}</span>
        <span class="menu-item-desc">${b.unter}</span>
        <span class="menu-item-desc" style="margin-top:4px;opacity:.75;">${b.beschreibung}</span>
      </span>`;
    div.style.cursor = 'pointer';
    div.onclick = () => { S.buecherCursor = i; buecherSelect(); };
    list.appendChild(div);
  });

  const zurueck = document.createElement('div');
  const iZ = BUECHER.length;
  zurueck.className = 'menu-item' + (S.buecherCursor === iZ ? ' selected' : '');
  zurueck.innerHTML = `
    <span class="cursor-arrow">›</span>
    <span class="menu-item-body">
      <span class="menu-item-name" style="color:var(--muted)">Zurück</span>
      <span class="menu-item-desc">Zum Sprachen-Menü</span>
    </span>`;
  zurueck.style.cursor = 'pointer';
  zurueck.onclick = () => { S.buecherCursor = iZ; buecherSelect(); };
  list.appendChild(zurueck);
}

export function buecherMove(dir) {
  const n = BUECHER.length + 1; // + „Zurück“
  S.buecherCursor = ((S.buecherCursor || 0) + dir + n) % n;
  buecherShowListe();
}

export function buecherSelect() {
  if (S.buecherCursor === BUECHER.length) {
    window.renderSprachenGlobal?.();
    return;
  }
  buecherOeffnen(BUECHER[S.buecherCursor]);
}

// ── Viewer ─────────────────────────────────────────────────────────────────

async function signierteUrl(datei) {
  const c = _urlCache[datei];
  if (c && c.bis > Date.now() + 60_000) return c.url;

  const { supabase } = await import('./supabase.js');
  const { data, error } = await supabase.storage
    .from('buecher')
    .createSignedUrl(datei, 3600);
  if (error) throw error;

  _urlCache[datei] = { url: data.signedUrl, bis: Date.now() + 3600_000 };
  return data.signedUrl;
}

export async function buecherOeffnen(buch) {
  S.state = 'buch-viewer';
  S.aktivesBuch = buch;
  show('buch-viewer-screen');

  document.getElementById('buch-titel').textContent = buch.titel;
  const rahmen = document.getElementById('buch-rahmen');
  const dl = document.getElementById('buch-download');
  rahmen.innerHTML = '<p style="text-align:center;color:var(--muted);padding:48px 0;">Buch wird geladen …</p>';
  dl.style.display = 'none';

  try {
    const url = await signierteUrl(buch.datei);
    rahmen.innerHTML = `<iframe src="${url}#view=FitH" title="${buch.titel}"
      style="width:100%;height:100%;border:0;border-radius:4px;background:#fff;"></iframe>`;
    dl.href = url;
    dl.download = buch.datei;
    dl.style.display = '';
  } catch (e) {
    rahmen.innerHTML = `<p style="text-align:center;color:var(--muted);padding:48px 0;">
      Konnte das Buch nicht laden.<br>
      <span style="font-size:12px;">${e.message || e}</span></p>`;
  }
}

export function buchHerunterladen() {
  document.getElementById('buch-download')?.click();
}

export function buchZurueck() {
  buecherShowListe();
}

// Für input.js und die onclick-Handler im Markup.
Object.assign(window, {
  buecherShowListe, buecherMove, buecherSelect,
  buchZurueck, buchHerunterladen,
});
