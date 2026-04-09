module.exports = {
  typ: `text`,
  titel: `Lesetext: Новая квартира`,
  tts: true,
  inhalt: `Это новая квартира. Большая комната — это моя комната. Маленькая комната — это комната брата. Это старый дом, но хорошая квартира. Это большое окно. А это? Это новая машина. Это моя машина.`,
  absaetze: [
    { ru: `Это новая квартира.`, de: `Das ist eine neue Wohnung.` },
    { ru: `Большая комната — это моя комната.`, de: `Das große Zimmer ist mein Zimmer.` },
    { ru: `Маленькая комната — это комната брата.`, de: `Das kleine Zimmer ist das Zimmer des Bruders.` },
    { ru: `Это старый дом, но хорошая квартира.`, de: `Das ist ein altes Haus, aber eine gute Wohnung.` },
    { ru: `Это большое окно.`, de: `Das ist ein großes Fenster.` },
    { ru: `А это?`, de: `Und das?` },
    { ru: `Это новая машина.`, de: `Das ist ein neues Auto.` },
    { ru: `Это моя машина.`, de: `Das ist mein Auto.` },
  ],
  fragen: [
    {
      q: `Чья большая комната?`,
      a: [`Комната брата`, `Моя комната`, `Комната мамы`],
      c: 1,
      m: `„Большая комната — это моя комната." — Das große Zimmer ist meins.`
    },
    {
      q: `Der Erzähler sagt: „Это старый дом." Ist die Wohnung auch schlecht?`,
      a: [`Ja, alles ist alt`, `Nein, die Wohnung ist gut`, `Er sagt nichts dazu`],
      c: 1,
      m: `„Это старый дом, но хорошая квартира." — Altes Haus, aber gute Wohnung.`
    },
    {
      q: `Чья новая машина?`,
      a: [`Машина брата`, `Моя машина`, `Машина папы`],
      c: 1,
      m: `„Это моя машина." — Das ist mein Auto.`
    },
  ]
}
