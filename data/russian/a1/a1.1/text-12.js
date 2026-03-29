module.exports = {
  typ: `text`,
  titel: `Lesetext: In der Stadt`,
  tts: true,
  inhalt: `Я живу в Москве. Это большой и красивый город. В центре города есть красивый парк. У парка — старый театр. Рядом с театром — библиотека. Турист стоит у входа и спрашивает: «Где банк?» Я говорю: «Банк там, у вокзала!»`,
  absaetze: [
    { ru: `Я живу в Москве.`, de: `Ich wohne in Moskau.` },
    { ru: `Это большой и красивый город.`, de: `Das ist eine große und schöne Stadt.` },
    { ru: `В центре города есть красивый парк.`, de: `Im Zentrum der Stadt gibt es einen schönen Park.` },
    { ru: `У парка — старый театр.`, de: `Beim Park gibt es ein altes Theater.` },
    { ru: `Рядом с театром — библиотека.`, de: `Neben dem Theater gibt es eine Bibliothek.` },
    { ru: `Турист стоит у входа и спрашивает: «Где банк?»`, de: `Ein Tourist steht am Eingang und fragt: "Wo ist die Bank?"` },
    { ru: `Я говорю: «Банк там, у вокзала!»`, de: `Ich sage: "Die Bank ist dort, beim Bahnhof!"` },
  ],
  fragen: [
    {
      q: `Was befindet sich am Park (у парка)?`,
      a: [`Eine Bibliothek`, `Eine Bank`, `Ein altes Theater`],
      c: 2,
      m: `„У парка — старый театр." — у + Genitiv: парк → у парка = am Park. Nullkopula: kein Verb nötig.`
    },
    {
      q: `Wo steht der Tourist?`,
      a: [`У театра`, `У банка`, `У входа`],
      c: 2,
      m: `„Турист стоит у входа." — у + Genitiv: вход → у входа = am Eingang. стоит = er steht.`
    },
    {
      q: `Wo ist die Bank laut der erzählenden Person?`,
      a: [`В центре`, `У вокзала`, `На улице`],
      c: 1,
      m: `„Банк там, у вокзала!" — у + Genitiv: вокзал → у вокзала = beim Bahnhof. Näheangabe mit у.`
    }
  ]
}
