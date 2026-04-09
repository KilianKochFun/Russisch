module.exports = {
  typ: `dialog`,
  titel: `Dialog: Кто он?`,
  tts: true,
  zeilen: [
    { sprecher: `А`, text: `Кто это?`, de: `Wer ist das?` },
    { sprecher: `Б`, text: `Это друг. Он студент.`, de: `Das ist ein Freund. Er ist Student.` },
    { sprecher: `А`, text: `А кто она?`, de: `Und wer ist sie?` },
    { sprecher: `Б`, text: `Она? Она врач.`, de: `Sie? Sie ist Ärztin.` },
    { sprecher: `А`, text: `Что это?`, de: `Was ist das?` },
    { sprecher: `Б`, text: `Это газета. Это не книга.`, de: `Das ist eine Zeitung. Das ist kein Buch.` },
  ],
  fragen: [
    {
      q: `Кто он?`,
      a: [`Врач`, `Друг, студент`, `Брат`],
      c: 1,
      m: `„Это друг. Он студент." — Er ist ein Freund und Student.`
    },
    {
      q: `Кто она?`,
      a: [`Студент`, `Друг`, `Врач`],
      c: 2,
      m: `„Она врач." — Sie ist Ärztin.`
    },
    {
      q: `Это книга?`,
      a: [`Да`, `Нет, это газета`, `Нет, это письмо`],
      c: 1,
      m: `„Это газета. Это не книга." — Nein, das ist eine Zeitung.`
    },
  ]
}
