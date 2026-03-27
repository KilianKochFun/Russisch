module.exports = {
  typ: `text`,
  titel: `Lesetext: In der Stadt`,
  tts: true,
  inhalt: `Я живу в Москве. Это большой и красивый город. В центре города есть красивый парк. У парка — старый театр. Рядом с театром — библиотека. Турист стоит у входа и спрашивает: «Где банк?» Я говорю: «Банк там, у вокзала!»`,
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
