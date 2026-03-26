module.exports = {
  typ: `dialog`,
  titel: `In der Stadt`,
  tts: true,
  zeilen: [
    { sprecher: `Турист`, text: `Извините, где здесь гостиница?` },
    { sprecher: `Прохожий`, text: `Гостиница? Она там, на улице Горького.` },
    { sprecher: `Турист`, text: `Это далеко?` },
    { sprecher: `Прохожий`, text: `Нет, не далеко. Пять минут пешком.` },
    { sprecher: `Турист`, text: `Спасибо! А где здесь банк? Мне нужны деньги.` },
    { sprecher: `Прохожий`, text: `Банк рядом с вокзалом. Там большое здание.` },
    { sprecher: `Турист`, text: `Вокзал — это где?` },
    { sprecher: `Прохожий`, text: `Вот вокзал — прямо перед вами! (смеётся)` },
    { sprecher: `Турист`, text: `Ой! Спасибо большое!` },
  ],
  fragen: [
    {
      q: `Was sucht der Tourist zuerst?`,
      a: [`Den Bahnhof`, `Die Bank`, `Das Hotel`],
      c: 2,
      m: `Турист спрашивает: „Где здесь гостиница?" — гостиница = Hotel; где = wo; здесь = hier.`
    },
    {
      q: `Wie weit ist das Hotel?`,
      a: [`10 Minuten mit dem Bus`, `5 Minuten zu Fuß`, `20 Minuten zu Fuß`],
      c: 1,
      m: `Прохожий говорит: „Пять минут пешком." — пять = fünf; минут = Minuten; пешком = zu Fuß.`
    },
    {
      q: `Wo ist der Bahnhof — und was ist daran komisch?`,
      a: [`Er ist weit weg`, `Er ist direkt vor dem Touristen`, `Er ist neben der Bank`],
      c: 1,
      m: `„Вот вокзал — прямо перед вами!" — вот = da ist; прямо = direkt; перед вами = vor Ihnen. Der Tourist steht direkt davor!`
    },
  ]
}
