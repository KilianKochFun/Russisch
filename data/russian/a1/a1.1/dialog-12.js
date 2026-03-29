module.exports = {
  typ: `dialog`,
  titel: `In der Stadt`,
  tts: true,
  zeilen: [
    { sprecher: `Турист`, text: `Извините, где здесь гостиница?`, de: `Entschuldigung, wo ist hier das Hotel?` },
    { sprecher: `Прохожий`, text: `Гостиница? Она там, на улице Горького.`, de: `Hotel? Es ist dort, in der Gorkistraße.` },
    { sprecher: `Турист`, text: `Это далеко?`, de: `Ist das weit?` },
    { sprecher: `Прохожий`, text: `Нет, не далеко. Пять минут пешком.`, de: `Nein, nicht weit. Fünf Minuten zu Fuß.` },
    { sprecher: `Турист`, text: `Спасибо! А где здесь банк? Мне нужны деньги.`, de: `Danke! Und wo ist hier eine Bank? Ich brauche Geld.` },
    { sprecher: `Прохожий`, text: `Банк у вокзала. У входа стоит банкомат.`, de: `Die Bank ist beim Bahnhof. Am Eingang steht ein Geldautomat.` },
    { sprecher: `Турист`, text: `Вокзал — это где?`, de: `Der Bahnhof — wo ist der?` },
    { sprecher: `Прохожий`, text: `Вот вокзал — прямо перед вами! (смеётся)`, de: `Da ist der Bahnhof — direkt vor Ihnen! (lacht)` },
    { sprecher: `Турист`, text: `Ой! Спасибо большое!`, de: `Oh! Danke schön!` },
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
      q: `Wo ist die Bank laut dem Passanten?`,
      a: [`В центре города`, `У вокзала`, `На улице Горького`],
      c: 1,
      m: `„Банк у вокзала." — у + Genitiv: вокзал → у вокзала = beim Bahnhof. Lageangabe mit у.`
    },
    {
      q: `Wo ist der Bahnhof — und was ist daran komisch?`,
      a: [`Er ist weit weg`, `Er ist direkt vor dem Touristen`, `Er ist neben der Bank`],
      c: 1,
      m: `„Вот вокзал — прямо перед вами!" — вот = da ist; прямо = direkt; перед вами = vor Ihnen. Der Tourist steht direkt davor!`
    },
  ]
}
