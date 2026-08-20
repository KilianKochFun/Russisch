// Welche Decks es je Sprache gibt.
//
// Steht in einer eigenen Datei, weil zwei sehr verschiedene Stellen sie
// brauchen: der Trainer (was zeige ich an?) und die Speicherschicht (welche
// Karten zähle ich als fällig?).
//
// Der Anlass war ein Fehler: Als Zhuyin vom SRS-Deck zum Schnelldurchlauf
// wurde, blieben die alten Zhuyin-Karten in srs_cards stehen. Die
// Tagesübersicht zählte sie weiter als fällig — aber es gab kein Deck mehr,
// in dem man sie hätte abarbeiten können. Eine Zahl, die nie kleiner wird.


export const DECKS = {
  'chinese-tw': [
    { key: 'radikale', titel: '部首 Radikale', typen: ['component'] },
    { key: 'hanzi', titel: '漢字 Zeichen', typen: ['character'] },
    { key: 'woerter', titel: '詞 Wörter', typen: ['word'] },
  ],
  // Russisch morphologisch: erst die Bausteine, dann die Wörter, die aus
  // ihnen zusammenkleben. Gesperrt, bis alle Teile eines Worts sitzen.
  'russian-morph': [
    { key: 'bausteine', titel: 'Bausteine', typen: ['morph'] },
    { key: 'ruwoerter', titel: 'Wörter', typen: ['rusword'] },
  ],
  // Französisch. Morphologie hilft hier nicht — siehe scripts/seed_french.js.
  //
  // Die Wörter stehen ZUERST. Anfangs stand die Aussprache vorn („erst lesen
  // können“), aber gesperrt war sie nie, und der Dashboard-Cursor landet auf
  // dem ersten freigeschalteten Eintrag: Wer Wörter lernen wollte, musste sich
  // mit dem Pedal jedes Mal fünfmal nach unten hangeln. Die Ausspracheregeln
  // sind ein Nachschlagewerk, keine Vorstufe — die Aussprache steht auf jeder
  // Wortkarte mit drauf.
  french: [
    { key: 'frwoerter',  titel: 'Wörter — A1 nach Häufigkeit', typen: ['fword'] },
    { key: 'aussprache', titel: 'Aussprache', typen: ['aussprache'] },
    { key: 'bruecken',   titel: 'Brücken zum Deutschen', typen: ['bruecke'] },
    { key: 'reise',      titel: 'Unterwegs', typen: ['reise'] },
  ],
  // Kurdisch (Kurmancî): erst die Buchstaben, die ein Deutschsprachiger falsch
  // liest, dann der Grundwortschatz. Keine Sperre — die Bedeutung von `masî`
  // hängt an keiner Buchstabenregel. Siehe scripts/seed_kurdish.js.
  kurdish: [
    { key: 'alfabe',    titel: 'Alfabe — die Buchstaben', typen: ['alfabe'] },
    { key: 'kuwoerter', titel: 'Wörter — Swadesh-Grundwortschatz', typen: ['kuwort'] },
  ],
};
