// Sprachausgabe.
// Lokal (localhost + laufender node server.js) wird der /tts-Proxy bevorzugt
// (Google-TTS, bessere Qualität am Desktop). Überall sonst — insbesondere auf
// GitHub Pages — läuft die Web Speech API (speechSynthesis). Fehlt eine passende
// Stimme, gibt es nur einen Konsolen-Hinweis, keinen Fehler.
import { S } from './state.js';

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

export function speak(text, lang) {
  if (!text) return;
  stopTTS();
  const l = lang || _ttsLang();

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
