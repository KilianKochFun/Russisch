module.exports = {
  typ: `text`,
  titel: `Lesetext: Sashas Woche`,
  tts: true,
  inhalt: `В понедельник Саша работает весь день. Во вторник вечером он звонит маме. В среду он идёт в кино с Катей. В пятницу и субботу он свободен. В воскресенье он всегда дома.`,
  fragen: [
    {
      q: `Wann ruft Sascha seine Mutter an?`,
      a: [`В понедельник утром`, `Во вторник вечером`, `В среду днём`],
      c: 1,
      m: `„Во вторник вечером он звонит маме." — во вторник = am Dienstag; звонить маме = Mutter anrufen (Dat.).`
    },
    {
      q: `Mit wem geht Sascha ins Kino?`,
      a: [`С другом`, `Один`, `С Катей`],
      c: 2,
      m: `„В среду он идёт в кино с Катей." — с + Instrumental = mit jemandem; с Катей = mit Katja.`
    },
    {
      q: `Wann ist Sascha immer zu Hause?`,
      a: [`В субботу`, `В пятницу`, `В воскресенье`],
      c: 2,
      m: `„В воскресенье он всегда дома." — воскресенье = Sonntag; всегда = immer; дома = zu Hause.`
    }
  ]
}
