module.exports = {
  typ: `dialog`,
  titel: `Dialog: Нет, это не музей`,
  tts: true,
  zeilen: [
    { sprecher: `А`, text: `Это музей?`, de: `Ist das ein Museum?` },
    { sprecher: `Б`, text: `Нет, это не музей. Это магазин.`, de: `Nein, das ist kein Museum. Das ist ein Geschäft.` },
    { sprecher: `А`, text: `А это? Это ресторан?`, de: `Und das? Ist das ein Restaurant?` },
    { sprecher: `Б`, text: `Да, это ресторан.`, de: `Ja, das ist ein Restaurant.` },
    { sprecher: `А`, text: `Он врач?`, de: `Ist er Arzt?` },
    { sprecher: `Б`, text: `Нет, он не врач. Он студент.`, de: `Nein, er ist kein Arzt. Er ist Student.` },
  ],
  fragen: [
    {
      q: `Was fragt A zuerst?`,
      a: [`Ist das ein Restaurant?`, `Ist das ein Museum?`, `Ist das ein Park?`],
      c: 1,
      m: `„Это музей?" — Ist das ein Museum?`
    },
    {
      q: `Ist es ein Museum?`,
      a: [`Ja`, `Nein, es ist ein Geschäft`, `Nein, es ist ein Park`],
      c: 1,
      m: `„Нет, это не музей. Это магазин." — Nein, das ist ein Geschäft.`
    },
    {
      q: `Ist „он" Arzt?`,
      a: [`Ja, er ist Arzt`, `Nein, er ist Student`, `Nein, er ist nicht Student`],
      c: 1,
      m: `„Нет, он не врач. Он студент." — Nein, er ist Student.`
    },
  ]
}
