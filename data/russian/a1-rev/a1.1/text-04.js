module.exports = {
  typ: `text`,
  titel: `Lesetext: Это не парк`,
  tts: true,
  inhalt: `Это парк? Нет, это не парк. Это магазин. Это ресторан? Нет, это не ресторан. Это библиотека. Она врач? Нет, она не врач. Она студент. Это книга? Да, это книга.`,
  absaetze: [
    { ru: `Это парк?`, de: `Ist das ein Park?` },
    { ru: `Нет, это не парк.`, de: `Nein, das ist kein Park.` },
    { ru: `Это магазин.`, de: `Das ist ein Geschäft.` },
    { ru: `Это ресторан?`, de: `Ist das ein Restaurant?` },
    { ru: `Нет, это не ресторан.`, de: `Nein, das ist kein Restaurant.` },
    { ru: `Это библиотека.`, de: `Das ist eine Bibliothek.` },
    { ru: `Она врач?`, de: `Ist sie Ärztin?` },
    { ru: `Нет, она не врач.`, de: `Nein, sie ist keine Ärztin.` },
    { ru: `Она студент.`, de: `Sie ist Studentin.` },
    { ru: `Это книга?`, de: `Ist das ein Buch?` },
    { ru: `Да, это книга.`, de: `Ja, das ist ein Buch.` },
  ],
  fragen: [
    {
      q: `„Это парк?" — Was ist die Antwort im Text?`,
      a: [`Да, это парк.`, `Нет, это не парк. Это магазин.`, `Нет, это не парк. Это музей.`],
      c: 1,
      m: `Нет, это не парк. Это магазин. — Nein, kein Park, sondern ein Geschäft.`
    },
    {
      q: `Ist „она" Ärztin?`,
      a: [`Ja, sie ist Ärztin`, `Nein, sie ist Studentin`, `Nein, sie ist Lehrerin`],
      c: 1,
      m: `Нет, она не врач. Она студент. — Nein, sie ist Studentin.`
    },
    {
      q: `Was ist die Antwort auf „Это книга?"`,
      a: [`Нет`, `Нет, это не книга.`, `Да, это книга.`],
      c: 2,
      m: `Да, это книга. — Ja, das ist ein Buch.`
    },
  ]
}
