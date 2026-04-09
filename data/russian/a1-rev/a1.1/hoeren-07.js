module.exports = {
  typ: `hoeren`,
  titel: `Hörtext: Большой или маленький?`,
  tts: true,
  text: `Это большой парк. А это маленький магазин. Это новая школа. Школа — не старая. Это хороший ресторан. А это старая библиотека. Она большая.`,
  fragen: [
    {
      q: `Wie ist der Park?`,
      a: [`Klein`, `Groß`, `Neu`],
      c: 1,
      m: `„Это большой парк." — Das ist ein großer Park.`
    },
    {
      q: `Ist die Schule alt oder neu?`,
      a: [`Alt`, `Neu`, `Klein`],
      c: 1,
      m: `„Это новая школа. Школа — не старая." — Die Schule ist neu, nicht alt.`
    },
    {
      q: `Wie ist die Bibliothek?`,
      a: [`Neu und klein`, `Alt und groß`, `Alt und klein`],
      c: 1,
      m: `„Старая библиотека. Она большая." — Alt und groß.`
    },
  ]
}
