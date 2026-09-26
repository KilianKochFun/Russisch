// Sprachausgabe.
// Lokal (localhost + laufender node server.js) wird der /tts-Proxy bevorzugt
// (Google-TTS, bessere Qualität am Desktop). Überall sonst — insbesondere auf
// GitHub Pages — läuft die Web Speech API (speechSynthesis). Fehlt eine passende
// Stimme, gibt es nur einen Konsolen-Hinweis, keinen Fehler.
//
// Mandarin spricht NUR aus fertigen Aufnahmen im Bucket `audio` (erzeugt mit
// scripts/audio_zh.js), nie mit einer Stimme: Browser-Stimmen klingen für zh-TW
// nach nichts Echtem. Fehlt eine Aufnahme, bleibt es still. Einmal geladen,
// liegt jede Datei im Cache `audio-v1` und spielt auch offline.
import { S } from './state.js';
import { getClient } from './progress.js';

const LANG_TAGS = { ru: 'ru-RU', ja: 'ja-JP', de: 'de-DE', zh: 'zh-TW' };
const IST_LOCALHOST = ['localhost', '127.0.0.1'].includes(location.hostname);

let _currentAudio = null;
let _ttsPlaying = false;
let _proxyOk = null;           // null = noch nicht getestet, false = Proxy nicht erreichbar
const _gewarnt = {};

if ('speechSynthesis' in window) {
  // Stimmenliste früh anstoßen — manche Browser liefern sie erst asynchron
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener?.('voiceschanged', () => speechSynthesis.getVoices());
}

function _ttsLang() {
  const langMap = { russian: 'ru', japanese: 'ja', 'chinese-tw': 'zh-TW' };
  return langMap[S.aktiveSprache?.id] || 'ru';
}

export function stopTTS() {
  _ttsPlaying = false;
  _auftrag++;   // eine Aufnahme, die noch lädt, soll danach nicht mehr losgehen
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function _speakWeb(text, lang) {
  if (!('speechSynthesis' in window)) {
    if (!_gewarnt._api) { console.warn('Keine Sprachausgabe: Web Speech API nicht verfügbar.'); _gewarnt._api = true; }
    return;
  }
  const tag = LANG_TAGS[lang] || lang || 'ru-RU';
  const u = new SpeechSynthesisUtterance(text);
  u.lang = tag;
  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang === tag)
    || voices.find(v => v.lang.replace('_', '-').startsWith(tag.slice(0, 2)));
  if (voice) {
    u.voice = voice;
  } else if (!_gewarnt[tag]) {
    console.warn(`Keine ${tag}-Stimme gefunden — Browser-Standardstimme wird versucht.`);
    _gewarnt[tag] = true;
  }
  speechSynthesis.speak(u);
}

// ── Aufnahmen aus dem Bucket ────────────────────────────────────────────────

const AUFNAHME_SPRACHEN = new Set(['zh-TW']);
const AUDIO_CACHE = 'audio-v1';
const _fehlt = new Set();   // Pfade, die es im Bucket nicht gibt — nicht jedes Mal neu fragen
let _auftrag = 0;           // jeder speak()-Aufruf zählt hoch; ältere Downloads spielen dann nicht mehr

// Muss mit audioPfad() in scripts/audio_zh.js übereinstimmen.
function audioPfad(sprache, text) {
  return `${sprache}/${[...text].map(c => c.codePointAt(0).toString(16)).join('-')}.mp3`;
}

async function ladeAufnahme(pfad) {
  // Der Cache-Schlüssel ist nur ein Name, unter dem nie wirklich etwas abgerufen wird.
  const schluessel = new Request('audio-cache/' + pfad);
  const cache = await caches.open(AUDIO_CACHE).catch(() => null);
  const treffer = await cache?.match(schluessel);
  if (treffer) return treffer.blob();

  const sb = getClient();
  if (!sb) return null;
  const { data, error } = await sb.storage.from('audio').download(pfad);
  if (error || !data) { _fehlt.add(pfad); return null; }
  cache?.put(schluessel, new Response(data, { headers: { 'Content-Type': 'audio/mpeg' } }));
  return data;
}

// Fehlt die Aufnahme, bleibt es still.
async function spieleAufnahme(text, lang, auftrag) {
  const pfad = audioPfad(lang, text.trim());
  if (_fehlt.has(pfad)) return false;
  let blob;
  try { blob = await ladeAufnahme(pfad); } catch { return false; }
  if (!blob) return false;
  if (auftrag !== _auftrag) return true;   // inzwischen weitergeblättert — nichts mehr sagen

  const blobUrl = URL.createObjectURL(blob);
  const audio = new Audio(blobUrl);
  _currentAudio = audio;
  audio.addEventListener('ended', () => URL.revokeObjectURL(blobUrl), { once: true });
  try { await audio.play(); } catch { URL.revokeObjectURL(blobUrl); return false; }
  return true;
}

export function speak(text, lang) {
  if (!text) return;
  stopTTS();
  const l = lang || _ttsLang();
  const auftrag = ++_auftrag;

  // Mandarin nur aus der Aufnahme. Die Browser-Stimme redete sonst über die
  // Aufnahme drüber — und klingt für zh-TW ohnehin nach nichts Echtem.
  if (AUFNAHME_SPRACHEN.has(l)) { spieleAufnahme(text, l, auftrag); return; }
  sprichMitStimme(text, l);
}

function sprichMitStimme(text, l) {
  if (IST_LOCALHOST && _proxyOk !== false) {
    const audio = new Audio('/tts?q=' + encodeURIComponent(text) + '&lang=' + l);
    _currentAudio = audio;
    let fallbackDone = false;
    const fallback = () => {
      if (fallbackDone) return;
      fallbackDone = true;
      _proxyOk = false;
      _speakWeb(text, l);
    };
    audio.addEventListener('playing', () => { _proxyOk = true; }, { once: true });
    audio.addEventListener('error', fallback, { once: true });
    audio.play().catch(fallback);
  } else {
    _speakWeb(text, l);
  }
}

// Liest mehrere Sätze nacheinander vor (Text-Einheiten)
export async function enqueueTTSQueue(sentences) {
  stopTTS();
  _ttsPlaying = true;
  const l = _ttsLang();
  const saetze = sentences.filter(s => s.trim());

  if (!(IST_LOCALHOST && _proxyOk !== false)) {
    // speechSynthesis hat eine eigene Warteschlange
    for (const s of saetze) _speakWeb(s, l);
    return;
  }

  for (let i = 0; i < saetze.length; i++) {
    if (!_ttsPlaying) break;

    try {
      const url = '/tts?q=' + encodeURIComponent(saetze[i]) + '&lang=' + l;
      const res = await fetch(url);
      if (!res.ok) continue;

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const audio = new Audio(blobUrl);
      _currentAudio = audio;

      audio.play().catch(() => {});

      // Warte bis Audio fertig ist
      await new Promise((resolve) => {
        const onended = () => { URL.revokeObjectURL(blobUrl); resolve(); };
        const timeout = setTimeout(onended, 10000); // 10s fallback
        audio.addEventListener('ended', () => { clearTimeout(timeout); onended(); }, { once: true });
        audio.addEventListener('error', () => { clearTimeout(timeout); onended(); }, { once: true });
      });

      // Kleine Pause zwischen Sätzen
      await new Promise(r => setTimeout(r, 150));
    } catch (e) {
      // Proxy weg → Rest der Sätze über Web Speech
      _proxyOk = false;
      if (_ttsPlaying) for (const s of saetze.slice(i)) _speakWeb(s, l);
      return;
    }
  }

  _ttsPlaying = false;
}

export function extractRussian(text) {
  const m = text.match(/[Ѐ-ӿ]+/g);
  return m ? m.join(' ') : null;
}
