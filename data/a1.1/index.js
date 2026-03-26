module.exports = {
  id: `a1.1`,
  name: `A1.1 — Erste Kontakte`,
  beschreibung: `Alphabet, Begrüßung, Grundvokabular`,
  einheiten: [
    require('./01-vokabeln'),   // Россия–библиотека (20 Wörter)
    require('./02-theorie'),    // Theorie: Personalpronomen & Nullkopula
    require('./02-grammatik'),  // Übung: Nullkopula & Pronomen
    require('./03-dialog'),     // Dialog: Erste Begegnung
    require('./03-hoeren'),     // Hören: Erste Begegnung
    require('./04-vokabeln'),   // бизнесмен–вино (20 Wörter)
    require('./05-theorie'),    // Theorie: Verneinung & Haben
    require('./05-grammatik'),  // Übung: Verneinung & Haben
    require('./06-dialog'),     // Dialog: Im Café
    require('./06-hoeren'),     // Hören: Im Café
    require('./07-vokabeln'),   // внук–город (20 Wörter)
    require('./08-theorie'),    // Theorie: Genus & Adjektivkongruenz
    require('./08-grammatik'),  // Übung: Genus & Adjektive
    require('./09-dialog'),     // Dialog: Familie vorstellen
    require('./09-hoeren'),     // Hören: Familie vorstellen
    require('./10-vokabeln'),   // городской–деньги (20 Wörter)
    require('./11-theorie'),    // Theorie: Fragewörter & Präpositiv
    require('./11-grammatik'),  // Übung: Fragewörter & Ortsangaben
    require('./12-dialog'),     // Dialog: In der Stadt
    require('./12-hoeren'),     // Hören: In der Stadt
    require('./13-vokabeln'),   // Haushalt & Besitz (20 Wörter)
    require('./13-theorie'),    // Theorie: Verbkonjugation Präsens
    require('./13-grammatik'),  // Übung: Verbkonjugation
    require('./13-dialog'),     // Dialog: Was machst du so?
    require('./13-hoeren'),     // Hören: Was machst du so?
    require('./14-vokabeln'),   // Verben & Gesundheit (20 Wörter)
    require('./14-theorie'),    // Theorie: Zeitangaben
    require('./14-grammatik'),  // Übung: Zeitangaben
    require('./14-dialog'),     // Dialog: Pläne für die Woche
    require('./14-hoeren'),     // Hören: Pläne für die Woche
    require('./15-text'),       // Abschlusstext: Меня зовут Анна
  ]
}
