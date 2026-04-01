module.exports = {
  typ: `dialog`,
  titel: `Am Bahnhof`,
  tts: true,
  zeilen: [
    { sprecher: `Анна`, text: `Извините, вы едете в центр?` },
    { sprecher: `Мужчина`, text: `Нет, я еду на вокзал. Вам нужен центр?` },
    { sprecher: `Анна`, text: `Да, мне нужно в музей. Там выставка.` },
    { sprecher: `Мужчина`, text: `Тогда вам нужен автобус номер двенадцать. Он идёт прямо туда.` },
    { sprecher: `Анна`, text: `А где его остановка?` },
    { sprecher: `Мужчина`, text: `Вон там, у входа. Вы его уже видите?` },
    { sprecher: `Анна`, text: `Да, вижу. Спасибо вам!` },
    { sprecher: `Мужчина`, text: `Пожалуйста. Счастливого пути!` },
  ],
  fragen: [
    {
      q: `Wohin fährt der Mann?`,
      a: [`Ins Museum`, `Ins Zentrum`, `Zum Bahnhof`],
      c: 2,
      m: `„Я еду на вокзал." — ехать (Fahrzeug, einmalig) + на вокзал (Akkusativ, unbelebtes Maskulinum = unverändert).`
    },
    {
      q: `Was sagt Anna über den Bus: „Вы его уже видите?" — Was bedeutet „его" hier?`,
      a: [`Sein (Possessivpronomen)`, `Ihn (Akkusativ von он — der Bus)`, `Zu ihm`],
      c: 1,
      m: `„его" nach видеть (sehen) = Akkusativ von он. автобус ist maskulin → er = он → Akkusativ: его.`
    },
    {
      q: `Welche Busformen beschreiben eine aktuelle Bewegung (Linie fährt gerade)?`,
      a: [`Автобус ходит`, `Автобус едет`, `Автобус идёт`],
      c: 2,
      m: `Für Fahrzeuge die einen Weg gehen (Linie, Route) verwendet man idiomatisch идти: автобус идёт = der Bus fährt (auf seiner Route). ехать wäre für ein spezifisches, gerade fahrendes Fahrzeug.`
    },
  ]
}
