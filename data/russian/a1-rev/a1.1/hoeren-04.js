module.exports = {
  typ: `hoeren`,
  titel: `Hörtext: Это не школа`,
  tts: true,
  text: `Это школа? Нет, это не школа. Это библиотека. Это парк? Да, это парк. Он студент? Нет, он не студент. Он врач. Это книга? Да, это книга.`,
  fragen: [
    {
      q: `Was ist es — eine Schule oder eine Bibliothek?`,
      a: [`Eine Schule`, `Eine Bibliothek`, `Ein Museum`],
      c: 1,
      m: `„Нет, это не школа. Это библиотека." — Es ist eine Bibliothek.`
    },
    {
      q: `„Это парк?" — Was ist die Antwort?`,
      a: [`Нет`, `Да, это парк.`, `Нет, это не парк.`],
      c: 1,
      m: `„Да, это парк." — Ja, das ist ein Park.`
    },
    {
      q: `Was ist „он"?`,
      a: [`Student`, `Arzt`, `Weder noch`],
      c: 1,
      m: `„Нет, он не студент. Он врач." — Er ist Arzt.`
    },
  ]
}
