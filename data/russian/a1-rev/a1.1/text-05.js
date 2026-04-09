module.exports = {
  typ: `text`,
  titel: `Lesetext: Кто это?`,
  tts: true,
  inhalt: `Кто это? Это брат. Он студент. А кто она? Она врач. Что это? Это письмо. А это? Это газета. Это не книга, это газета.`,
  absaetze: [
    { ru: `Кто это?`, de: `Wer ist das?` },
    { ru: `Это брат.`, de: `Das ist der Bruder.` },
    { ru: `Он студент.`, de: `Er ist Student.` },
    { ru: `А кто она?`, de: `Und wer ist sie?` },
    { ru: `Она врач.`, de: `Sie ist Ärztin.` },
    { ru: `Что это?`, de: `Was ist das?` },
    { ru: `Это письмо.`, de: `Das ist ein Brief.` },
    { ru: `А это?`, de: `Und das?` },
    { ru: `Это газета.`, de: `Das ist eine Zeitung.` },
    { ru: `Это не книга, это газета.`, de: `Das ist kein Buch, das ist eine Zeitung.` },
  ],
  fragen: [
    {
      q: `Кто он?`,
      a: [`Врач`, `Студент`, `Друг`],
      c: 1,
      m: `Он студент. — Er ist Student.`
    },
    {
      q: `Что это — книга?`,
      a: [`Да, это книга.`, `Нет, это газета.`, `Нет, это письмо.`],
      c: 1,
      m: `Это не книга, это газета. — Das ist kein Buch, das ist eine Zeitung.`
    },
    {
      q: `Кто она?`,
      a: [`Студент`, `Врач`, `Сестра`],
      c: 1,
      m: `Она врач. — Sie ist Ärztin.`
    },
  ]
}
