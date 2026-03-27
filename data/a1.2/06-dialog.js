module.exports = {
  typ: `dialog`,
  titel: `Куда ты идёшь?`,
  tts: true,
  zeilen: [
    { sprecher: `Борис`, text: `Катя, куда ты идёшь?` },
    { sprecher: `Катя`, text: `Я иду в магазин. Мне нужны продукты. А ты?` },
    { sprecher: `Борис`, text: `Я еду в центр — на метро. Там мой офис.` },
    { sprecher: `Катя`, text: `Ты каждый день ездишь туда на метро?` },
    { sprecher: `Борис`, text: `Да, я езжу на работу на метро каждый день. Это быстро.` },
    { sprecher: `Катя`, text: `А вечером ты идёшь домой сразу?` },
    { sprecher: `Борис`, text: `Нет, сегодня я иду в спортзал. Я хожу туда по вторникам.` },
    { sprecher: `Катя`, text: `Здорово! Я тоже хочу пойти в спортзал. Пойдём вместе?` },
    { sprecher: `Борис`, text: `Конечно! В следующий вторник?` },
    { sprecher: `Катя`, text: `Отлично!` },
  ],
  fragen: [
    {
      q: `Wohin geht Катя gerade?`,
      a: [`In den Sportclub`, `In die Arbeit`, `In den Laden`],
      c: 2,
      m: `„Я иду в магазин." — идти (gerade unterwegs) + в + Akkusativ: в магазин (unbelebtes Maskulinum, unverändert).`
    },
    {
      q: `Womit fährt Борис jeden Tag zur Arbeit?`,
      a: [`Mit dem Bus`, `Mit der Metro`, `Zu Fuß`],
      c: 1,
      m: `„Я езжу на работу на метро каждый день." — ездить (Gewohnheit) + на метро = mit der Metro.`
    },
    {
      q: `Wohin geht Борис heute Abend?`,
      a: [`Nach Hause`, `In den Laden`, `In den Sportclub`],
      c: 2,
      m: `„Сегодня я иду в спортзал." — идти (einmalig heute) + в спортзал (Akkusativ). Спортзал = Fitnessstudio.`
    },
  ]
}
