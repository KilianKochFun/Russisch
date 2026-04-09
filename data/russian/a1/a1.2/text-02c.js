module.exports = {
  typ: `text`,
  titel: `Lesetext: Antons Tag`,
  tts: true,
  inhalt: `Меня зовут Антон. Каждый день я читаю газету и пью кофе. Утром я вижу сестру — она тоже любит читать. Она любит книги, а я люблю газеты. Днём я покупаю хлеб и молоко в магазине. Вечером я слушаю музыку и пишу письмо другу. Я люблю мой день!`,
  absaetze: [
    { ru: `Меня зовут Антон.`, de: `Ich heiße Anton.` },
    { ru: `Каждый день я читаю газету и пью кофе.`, de: `Jeden Tag lese ich die Zeitung und trinke Kaffee.` },
    { ru: `Утром я вижу сестру — она тоже любит читать.`, de: `Morgens sehe ich meine Schwester — sie liest auch gern.` },
    { ru: `Она любит книги, а я люблю газеты.`, de: `Sie mag Bücher, und ich mag Zeitungen.` },
    { ru: `Днём я покупаю хлеб и молоко в магазине.`, de: `Tagsüber kaufe ich Brot und Milch im Laden.` },
    { ru: `Вечером я слушаю музыку и пишу письмо другу.`, de: `Abends höre ich Musik und schreibe einen Brief an einen Freund.` },
    { ru: `Я люблю мой день!`, de: `Ich mag meinen Tag!` },
  ],
  fragen: [
    {
      q: `Was macht Anton jeden Morgen?`,
      a: [`Er kauft Brot`, `Er liest Zeitung und trinkt Kaffee`, `Er schreibt Briefe`],
      c: 1,
      m: `„Я читаю газету и пью кофе." — газету = Akkusativ von газета (-а → -у). кофе ist unveränderlich.`
    },
    {
      q: `„Днём я покупаю хлеб и молоко." — Warum bleiben хлеб und молоко unverändert?`,
      a: [`Sie stehen im Nominativ`, `хлеб = mask. unbelebt, молоко = Neutrum → Akk. unverändert`, `Es ist ein Fehler`],
      c: 1,
      m: `Maskulin unbelebt (хлеб) und Neutrum (молоко) ändern sich im Akkusativ nicht. Nur Feminina und belebte Maskulina ändern sich.`
    },
    {
      q: `Was macht Antons Schwester gern?`,
      a: [`Musik hören`, `Lesen`, `Zeitungen kaufen`],
      c: 1,
      m: `„Она тоже любит читать." — любить + Infinitiv: gern lesen. „Она любит книги." — книги = Akk. Plural.`
    },
  ]
}
