module.exports = {
  typ: `text`,
  titel: `Lesetext: Моя квартира`,
  tts: true,
  inhalt: `Это моя квартира. Это моя комната. А это? Это мой дом. Мой папа — врач. Моя мама — студент. Это мой брат. А это моя сестра. Это её машина.`,
  absaetze: [
    { ru: `Это моя квартира.`, de: `Das ist meine Wohnung.` },
    { ru: `Это моя комната.`, de: `Das ist mein Zimmer.` },
    { ru: `А это?`, de: `Und das?` },
    { ru: `Это мой дом.`, de: `Das ist mein Haus.` },
    { ru: `Мой папа — врач.`, de: `Mein Papa ist Arzt.` },
    { ru: `Моя мама — студент.`, de: `Meine Mama ist Studentin.` },
    { ru: `Это мой брат.`, de: `Das ist mein Bruder.` },
    { ru: `А это моя сестра.`, de: `Und das ist meine Schwester.` },
    { ru: `Это её машина.`, de: `Das ist ihr Auto.` },
  ],
  fragen: [
    {
      q: `Кто папа?`,
      a: [`Студент`, `Врач`, `Друг`],
      c: 1,
      m: `Мой папа — врач. Papa ist Arzt.`
    },
    {
      q: `Кто мама?`,
      a: [`Врач`, `Сестра`, `Студент`],
      c: 2,
      m: `Моя мама — студент. Mama ist Studentin.`
    },
    {
      q: `Чья машина? (Wessen Auto?)`,
      a: [`Его (sein)`, `Её (ihr)`, `Мой`],
      c: 1,
      m: `Это её машина. — Das ist ihr (der Schwester) Auto.`
    },
  ]
}
