// Zentraler App-State — alle Module lesen/schreiben über das S-Objekt.
// States: 'login' | 'sprachen-menu' | 'pedal-setup' | 'srs-*' (Russisch-Trainer)
// | 'tr-*' (generischer Trainer, z.B. Mandarin — eigener State in js/trainer.js)
export const S = {
  state: 'sprachen-menu',

  sprachenData: [],         // aus content/sprachen.json (liefert die Russisch-Vokabeln)
  aktiveSprache: null,      // {id, sprache, icon} — steuert u.a. die TTS-Sprache
  sprachenCursor: 0,

  // Russisch-SRS
  srsData: { cards: {}, unlockedLevel: 1 },
  srsAllCards: [],          // alle Vokabelkarten aus den Inhalten
  srsCardMap: {},           // Key "ru|de" → Karte {ru, de, m}
  srsDashboardCursor: 0,
  srsReviewPool: [],        // [{key, card, ruDeOk, deRuOk}]
  srsReviewFailed: new Set(), // in dieser Session falsch → kein Level-Up beim Retry
  srsReviewDone: 0,
  srsReviewTotal: 0,
  srsLessonCards: [],
  srsLessonIdx: 0,
  srsLessonPhase: 'show',   // 'show' | 'review'
  srsBatchQueue: [],
  srsBatchIdx: 0,
  srsResultCursor: 0,
  srsPauseCursor: 0,
  srsSessionStats: { up: 0, down: 0, burned: 0 },
  srsCurrentReview: null,   // {poolIdx, pair, direction}
};

export const SRS_STAGES = [
  { name: 'Neu',          interval: 0,             color: '#666' },
  { name: 'Apprentice 1', interval: 4*3600000,     color: '#e05080' },
  { name: 'Apprentice 2', interval: 8*3600000,     color: '#e05080' },
  { name: 'Apprentice 3', interval: 24*3600000,    color: '#e05080' },
  { name: 'Apprentice 4', interval: 48*3600000,    color: '#e05080' },
  { name: 'Guru 1',       interval: 7*24*3600000,  color: '#9b59b6' },
  { name: 'Guru 2',       interval: 14*24*3600000, color: '#9b59b6' },
  { name: 'Master',       interval: 30*24*3600000, color: '#3498db' },
  { name: 'Enlightened',  interval: 120*24*3600000, color: '#2ecc71' },
  { name: 'Burned',       interval: Infinity,      color: '#95a5a6' },
];
