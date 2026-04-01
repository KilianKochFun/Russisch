module.exports = {
  typ: `dialog`,
  titel: `Ein Geschenk kaufen`,
  tts: true,
  zeilen: [
    { sprecher: `Андрей`, text: `Лена, скоро день рождения мамы. Я хочу купить ей подарок.` },
    { sprecher: `Лена`, text: `Хорошая идея! Что ты думаешь ей подарить?` },
    { sprecher: `Андрей`, text: `Не знаю. Ей нравятся цветы и книги.` },
    { sprecher: `Лена`, text: `Тогда купи ей красивые цветы и интересную книгу!` },
    { sprecher: `Андрей`, text: `Отличная идея! Я позвоню ей сегодня и спрошу, что она хочет.` },
    { sprecher: `Лена`, text: `Нет-нет, не звони ей! Пусть будет сюрприз!` },
    { sprecher: `Андрей`, text: `Ты права. Помоги мне выбрать книгу?` },
    { sprecher: `Лена`, text: `Конечно помогу! Пойдём в книжный магазин вместе.` },
  ],
  fragen: [
    {
      q: `Warum will Andrej seiner Mutter etwas schenken?`,
      a: [`Sie hat Geburtstag`, `Sie ist krank`, `Sie reist ab`],
      c: 0,
      m: `„Скоро день рождения мамы." — день рождения = Geburtstag. скоро = bald. мамы = Genitiv von мама (Besitz).`
    },
    {
      q: `„Ей нравятся цветы и книги." — Welcher Kasus ist „ей"?`,
      a: [`Akkusativ von она`, `Dativ von она`, `Genitiv von она`],
      c: 1,
      m: `нравиться + Dativ: она → ей. Ihr gefallen Blumen und Bücher. (нравятся wegen Plural-Subjekt)`
    },
    {
      q: `Was rät Lena: Warum soll Andrej nicht anrufen?`,
      a: [`Die Mutter schläft`, `Es soll eine Überraschung sein`, `Das Telefon ist kaputt`],
      c: 1,
      m: `„Пусть будет сюрприз!" — пусть + будет = lass es sein. сюрприз = Überraschung. не звони = ruf nicht an (Imperativ negiert).`
    },
  ]
}
