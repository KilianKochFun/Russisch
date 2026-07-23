// Zentraler App-State — alle Module lesen/schreiben über das S-Objekt.
// Die state-Strings bilden die State-Machine ab:
// 'sprachen-menu' | 'menu' | 'einheiten-menu' | 'pakete-menu' | 'richtung-wahl' |
// 'karte-front' | 'karte-back' | 'hoeren-lauschen' | 'hoeren-frage' | 'hoeren-beantwortet' |
// 'theorie' | 'dialog-lesen' | 'dialog-fertig' | 'dialog-review' | 'text-lesen' | 'text-review' |
// 'quiz-answering' | 'quiz-answered' | 'end' | 'srs-*'
export const S = {
  state: 'sprachen-menu',
  menuCursor: 0,
  endCursor: 0,

  // Mehrsprachen-Modus
  sprachenData: [],
  aktiveSprache: null,      // {id, sprache, icon, kapitel[]}
  sprachenCursor: 0,
  hierarchiePfad: [],       // Stack für Zurück-Navigation
  aktiveKapitelEbene: null, // Current level in hierarchy
  cursorStack: [],          // Speichert menuCursor für jeden Level
  einheitenCursorStack: [], // Speichert einheitenCursor für jeden Unterkapitel

  // Kapitel-Modus
  aktivesKapitel: null,
  einheitIdx: 0,
  einheitenModus: false,
  aktiveEinheit: null,
  einheitenCursor: 0,
  isKapiteltest: false,
  kapiteltestConfig: null,
  kapiteltestPhase: null,   // 'vokabeln' | 'grammatik' | 'dialog-text' | 'hoeren' | 'result'
  kapiteltestUnitsQueue: [],
  kapiteltestPhaseResults: {},
  _kapiteltestScoreKey: null,

  // Karteikarten
  karteiStapel: [],
  nochmalStapel: [],
  karteiGewusst: 0,
  karteiPaketGroesse: 0,
  aktiveKarte: null,
  aktiveRichtung: 'ru-de',  // 'ru-de' | 'de-ru' | 'mc'
  karteRichtung: 'ru-de',

  // Pakete
  paketeCursor: 0,
  aktivesPaket: [],         // aktuelle 5er-Auswahl (leer = alle)

  // Theorie
  theorieKarteIdx: 0,

  // Hören
  hoerenIdx: 0,
  hoerenAnswered: false,

  // Dialog
  dialogZeileIdx: 0,

  // Quiz (waren implizite Globals in der alten Version)
  shuffled: [],
  current: 0,
  answered: false,
  scores: {},
  totals: {},
  isDialogQuiz: false,
  isTextQuiz: false,

  // SRS
  srsData: { cards: {}, unlockedLevel: 1 },
  srsAllCards: [],          // Flat array of all vocab cards from loaded data
  srsCardMap: {},           // Key "ru|de" → card object {ru, de, m}
  srsDashboardCursor: 0,
  srsReviewPool: [],        // Pool of {key, card, ruDeOk: false, deRuOk: false}
  srsReviewFailed: new Set(), // Keys that were wrong this session → no level-up on retry
  srsReviewDone: 0,         // Count of pairs completed successfully
  srsReviewTotal: 0,        // Total pairs at start of batch
  srsLessonCards: [],       // Cards being learned in current lesson
  srsLessonIdx: 0,
  srsLessonPhase: 'show',   // 'show' or 'review'
  srsBatchQueue: [],        // All due cards, split into batches
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
