// UI: Sprachen-Menü + Russisch-SRS-Trainer.
// Der alte Kapitelbaum (Grammatik/Dialog/Text/Hören/Theorie/Quiz) wurde entfernt —
// er lebt in der Git-History (Commit 58632d3 und davor) weiter.
import { S, SRS_STAGES } from './state.js';
import { speak } from './tts.js';
import { getSetting, setSetting, istEingeloggt, abmelden } from './progress.js';
import { zeigeScreen } from './screen.js';

const GENUS_FARBEN = { m: 'var(--blue)', f: '#e05080', n: '#a78bfa' };

// ── Utilities ──────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const show = zeigeScreen;

function getGenus(karte) {
  if (!karte.m) return null;
  const m = karte.m.trimStart();
  if (m.startsWith('m.')) return 'm';
  if (m.startsWith('f.')) return 'f';
  if (m.startsWith('n.')) return 'n';
  return null;
}

function highlightRu(text) {
  if (!text) return '';
  return text.replace(/[\u0400-\u04FF][\u0400-\u04FF\-]*/g,
    w => `<span class="ru-wort">${w}</span>`);
}

// ── Sprachen Menu ──────────────────────────────────────────────────────────
// Neuausrichtung: reine Trainer-Plattform. Der alte Kapitelbaum (Grammatik,
// Dialoge, Texte) ist nicht mehr erreichbar — jede Sprache führt direkt in
// ihr Trainer-Dashboard.
// Hängt „N fällig“ vor die Beschreibung, wenn etwas ansteht.
function mitFaellig(lang, text) {
  const z = _faellig?.[lang];
  if (!z || !z.jetzt) return text;
  return `<b style="color:var(--accent);">${z.jetzt} fällig</b> · ${text}`;
}

function getSprachenItems() {
  const items = [];
  items.push({
    trainer: 'chinese-tw', sprache: { id: 'chinese-tw', sprache: '中文（台灣）', icon: '🇹🇼' },
    name: '🇹🇼 中文 — Mandarin (traditionell)',
    desc: mitFaellig('chinese-tw', 'Zhuyin ㄅㄆㄇ · Zeichen · Wörter'),
  });
  items.push({
    trainer: 'russian-morph',
    sprache: { id: 'russian-morph', sprache: 'Русский', icon: '🇷🇺' },
    name: '🇷🇺 Русский — Wortbausteine',
    desc: mitFaellig('russian-morph', 'Wörter aus Präfixen und Wurzeln zusammensetzen'),
  });
  items.push({
    trainer: 'french',
    sprache: { id: 'french', sprache: 'Français', icon: '🇫🇷' },
    name: '🇫🇷 Français — A1',
    desc: mitFaellig('french', 'die häufigsten Wörter · Aussprache · Brücken zum Deutschen'),
  });
  items.push({
    trainer: 'kurdish',
    sprache: { id: 'kurdish', sprache: 'Kurdî', icon: '🌞' },
    name: '🌞 Kurdî — Kurmancî',
    desc: mitFaellig('kurdish', 'Lateinische Schrift · Buchstaben, dann Grundwortschatz'),
  });
  items.push({
    isVergleich: true, name: '🏆 Vergleich',
    desc: 'Wie du gegen die anderen stehst — gesamt und je Sprache',
  });
  items.push({
    isBuecher: true, name: '📚 Bücherregal',
    desc: 'Japanisch N3→N2 · Chinesisch von innen heraus — im Browser lesen',
  });
  items.push({ isExport: true, name: '⬇ Lernstand sichern',
    desc: 'Alles als Datei herunterladen — Versicherung gegen Datenverlust' });
  items.push({ isPedal: true, name: '⚙ Pedal-Tasten belegen', desc: 'Aktuell: A · B · C (oder eigene Belegung)' });
  if (istEingeloggt()) items.push({ isLogout: true, name: 'Abmelden', desc: 'Fortschritt bleibt gespeichert' });
  return items;
}

// ── Tagesübersicht über ALLE Sprachen ──────────────────────────────────────
// Bisher musste man in jede Sprache hineingehen, um zu sehen, ob dort etwas
// fällig ist. Bei vier Sprachen sind das vier Wege mit drei Pedaltasten, nur
// um festzustellen, dass nichts ansteht. Die Zahlen kommen aus srs_cards und
// brauchen die Vokabeldaten nicht — siehe faelligkeiten() in sync.js.
let _faellig = null;
let _faelligLaeuft = false;

const SPRACH_KURZ = {
  'chinese-tw': '🇹🇼 Mandarin', 'russian-morph': '🇷🇺 Bausteine',
  french: '🇫🇷 Französisch', kurdish: '🌞 Kurdisch', russian: '🇷🇺 Vokabeln',
};

// Beim ersten Zeichnen den Cursor dorthin setzen, wo etwas ansteht. Mit drei
// Pedaltasten ist jede Zeile davor Arbeit, und dass der Cursor stur auf dem
// ersten Eintrag steht, hat mit dem Tag nichts zu tun. Nur beim ersten Mal —
// danach gehört er dem, der ihn bewegt hat.
let _cursorGesetzt = false;

// Gibt zurück, ob sich dadurch etwas geändert hat — der Aufrufer entscheidet
// dann, ob neu gezeichnet werden muss. Ohne diese Rückgabe stand hier
// `S.sprachenCursor` als Bedingung, und weil der nach dem Setzen dauerhaft
// ungleich Null ist, zeichnete sich das Menü endlos neu und die Seite hing.
function cursorAufFaelliges() {
  if (_cursorGesetzt || !_faellig) return false;
  _cursorGesetzt = true;
  const items = getSprachenItems();
  const mitReviews = items.findIndex(i => i.trainer && (_faellig[i.trainer]?.jetzt || 0) > 0);
  if (mitReviews < 0 || mitReviews === S.sprachenCursor) return false;
  S.sprachenCursor = mitReviews;
  return true;
}

async function ladeFaellig() {
  if (_faelligLaeuft) return;
  _faelligLaeuft = true;
  let neu;
  try {
    const { faelligkeiten } = await import('./sync.js');
    neu = await faelligkeiten();
  } catch { neu = {}; }
  _faelligLaeuft = false;
  // Nur neu zeichnen, wenn sich wirklich etwas geändert hat — sonst dreht sich
  // renderSprachen → ladeFaellig → renderSprachen im Kreis.
  const anders = JSON.stringify(neu) !== JSON.stringify(_faellig);
  _faellig = neu;
  const cursorVersetzt = cursorAufFaelliges();
  if ((anders || cursorVersetzt) && S.state === 'sprachen-menu') renderSprachen();
}

function renderHeute() {
  const el = document.getElementById('heute-panel');
  if (!el) return;
  // Bei JEDEM Betreten nachladen, nicht nur beim ersten Mal. Sonst zeigt die
  // Übersicht nach einer Lernrunde noch die Zahlen von vorher — der Cache in
  // sync.js macht das billig und wird nach jeder Antwort verworfen.
  ladeFaellig();
  if (_faellig === null) { el.innerHTML = ''; return; }

  const jetzt = Object.values(_faellig).reduce((n, z) => n + z.jetzt, 0);
  const spaeter = Object.values(_faellig).reduce((n, z) => n + z.heuteNoch, 0);
  const umlauf = Object.values(_faellig).reduce((n, z) => n + z.imUmlauf, 0);
  if (!umlauf) { el.innerHTML = ''; return; }   // wer nichts gelernt hat, braucht keinen Kasten

  const proSprache = Object.entries(_faellig)
    .filter(([, z]) => z.jetzt + z.heuteNoch > 0)
    .sort((a, b) => b[1].jetzt - a[1].jetzt)
    .map(([lang, z]) => `<span style="white-space:nowrap;">${SPRACH_KURZ[lang] || lang}
        <b style="color:${z.jetzt ? 'var(--accent)' : 'var(--muted)'};">${z.jetzt}</b>${
        z.heuteNoch ? `<span style="color:var(--muted);"> +${z.heuteNoch}</span>` : ''}</span>`)
    .join(' &nbsp;·&nbsp; ');

  const kopf = jetzt
    ? `<b style="font-size:22px;color:var(--accent);">${jetzt}</b> jetzt fällig`
    : `<b style="font-size:22px;">Nichts fällig</b>`;
  const rest = spaeter ? ` &nbsp;·&nbsp; ${spaeter} kommen heute noch` : (jetzt ? '' : ' — du bist durch für heute');

  el.innerHTML = `<div style="margin:0 0 20px;padding:12px 14px;border:1px solid var(--border);border-radius:10px;">
    <div style="font-size:11px;letter-spacing:.08em;color:var(--muted);font-family:var(--display);font-weight:900;">HEUTE</div>
    <div style="margin:2px 0 6px;">${kopf}<span style="color:var(--muted);">${rest}</span></div>
    ${proSprache ? `<div style="font-size:13px;">${proSprache}</div>` : ''}
  </div>`;
}

function renderSprachen() {
  S.state = 'sprachen-menu';
  show('sprachen-screen');
  renderHeute();
  const list = document.getElementById('sprachen-list');
  list.innerHTML = '';

  getSprachenItems().forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'menu-item' + (i === S.sprachenCursor ? ' selected' : '');
    div.innerHTML = `
      <span class="cursor-arrow">›</span>
      <span class="menu-item-body">
        <span class="menu-item-name"${(item.isLogout || item.isPedal) ? ' style="color:var(--muted)"' : ''}>${item.name}</span>
        <span class="menu-item-desc">${item.desc}</span>
      </span>`;
    div.onclick = () => { S.sprachenCursor = i; sprachenSelect(); };
    div.style.cursor = 'pointer';
    list.appendChild(div);
  });
}

function sprachenMove(dir) {
  const n = getSprachenItems().length;
  S.sprachenCursor = (S.sprachenCursor + dir + n) % n;
  renderSprachen();
}

function sprachenSelect() {
  const item = getSprachenItems()[S.sprachenCursor];
  if (!item) return;
  if (item.isLogout) { abmelden(); return; }
  if (item.isPedal) { window.startePedalSetup?.(); return; }
  if (item.isExport) {
    import('./sync.js').then(async ({ exportiereAlles }) => {
      const { alleSettings } = await import('./progress.js');
      const n = await exportiereAlles(alleSettings());
      alert(`Lernstand gesichert — ${n} Karten in der Datei.`);
    });
    return;
  }
  if (item.isVergleich) { window.vergleichZeige?.(); return; }
  if (item.isBuecher) { S.buecherCursor = 0; window.buecherShowListe?.(); return; }
  S.aktiveSprache = item.sprache;
  if (item.trainer === 'russian-morph') {
    window.trainerShowDashboard?.('russian-morph');
  } else if (item.trainer === 'french') {
    window.trainerShowDashboard?.('french');
  } else if (item.trainer === 'kurdish') {
    window.trainerShowDashboard?.('kurdish');
  } else {
    // Mandarin-Trainer (js/trainer.js hängt sich an window, um Zyklen zu vermeiden)
    window.trainerShowDashboard?.('chinese-tw');
  }
}

// ── SRS System ────────────────────────────────────────────────────────────

// ── SRS Dashboard ──

// ── SRS Lesson ──

// ── SRS Reviews ──

// ── SRS Browse (Vokabel-Übersicht) ──

// ── Inline-onclick-Handler aus index.html brauchen globalen Zugriff ────────
Object.assign(window, {
  renderSprachenGlobal: renderSprachen,
});

export {
  renderSprachen, sprachenMove, sprachenSelect,
};
