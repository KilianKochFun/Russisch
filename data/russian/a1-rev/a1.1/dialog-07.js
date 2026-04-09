module.exports = {
  typ: `dialog`,
  titel: `Dialog: Новый или старый?`,
  tts: true,
  zeilen: [
    { sprecher: `А`, text: `Это твой дом?`, de: `Ist das dein Haus?` },
    { sprecher: `Б`, text: `Да. Это старый дом.`, de: `Ja. Das ist ein altes Haus.` },
    { sprecher: `А`, text: `А квартира?`, de: `Und die Wohnung?` },
    { sprecher: `Б`, text: `Квартира новая. Большая комната, маленькая комната.`, de: `Die Wohnung ist neu. Großes Zimmer, kleines Zimmer.` },
    { sprecher: `А`, text: `Хорошая квартира!`, de: `Gute Wohnung!` },
    { sprecher: `Б`, text: `Да, хорошая. А это моя новая машина.`, de: `Ja, gut. Und das ist mein neues Auto.` },
  ],
  fragen: [
    {
      q: `Дом новый или старый?`,
      a: [`Новый`, `Старый`, `Большой`],
      c: 1,
      m: `„Это старый дом." — Das Haus ist alt.`
    },
    {
      q: `А квартира?`,
      a: [`Старая`, `Маленькая`, `Новая`],
      c: 2,
      m: `„Квартира новая." — Die Wohnung ist neu.`
    },
    {
      q: `Was zeigt Б am Ende?`,
      a: [`Ein neues Haus`, `Ein neues Auto`, `Ein neues Zimmer`],
      c: 1,
      m: `„А это моя новая машина." — Und das ist mein neues Auto.`
    },
  ]
}
