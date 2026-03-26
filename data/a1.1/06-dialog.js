module.exports = {
  typ: `dialog`,
  titel: `Im Café`,
  tts: true,
  zeilen: [
    { sprecher: `Официант`, text: `Добрый день! Что вы хотите?` },
    { sprecher: `Клиент`, text: `Мне, пожалуйста, вино и воду.` },
    { sprecher: `Официант`, text: `Извините, у нас нет вина сегодня. Есть сок и вода.` },
    { sprecher: `Клиент`, text: `Хорошо, тогда воду, пожалуйста. У вас есть меню?` },
    { sprecher: `Официант`, text: `Да, конечно. Вот меню.` },
    { sprecher: `Клиент`, text: `Спасибо. А у вас есть билеты на балет?` },
    { sprecher: `Официант`, text: `Нет, это кафе, не театр! (смеётся)` },
    { sprecher: `Клиент`, text: `Извините! Я не знал. Просто воду, спасибо.` },
  ],
  fragen: [
    {
      q: `Was bestellt der Kunde zuerst?`,
      a: [`Wasser und Saft`, `Wein und Wasser`, `Kaffee und Wein`],
      c: 1,
      m: `Клиент говорит: „Мне вино и воду." — вино = Wein; воду = Akkusativ von вода (Wasser).`
    },
    {
      q: `Warum bekommt er keinen Wein?`,
      a: [`Er hat kein Geld`, `Das Café hat heute keinen Wein`, `Er bestellt keinen Wein`],
      c: 1,
      m: `Официант говорит: „У нас нет вина сегодня." — у нас нет = wir haben kein; сегодня = heute.`
    },
    {
      q: `Was fragt der Kunde noch — und was ist daran lustig?`,
      a: [`Er fragt nach Ballett-Tickets im Café`, `Er fragt nach der Adresse`, `Er fragt nach dem Preis`],
      c: 0,
      m: `„У вас есть билеты на балет?" — билет = Ticket. Das Café ist kein Theater — daher lacht der Kellner.`
    },
  ]
}
