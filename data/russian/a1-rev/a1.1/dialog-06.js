module.exports = {
  typ: `dialog`,
  titel: `Dialog: Это твой дом?`,
  tts: true,
  zeilen: [
    { sprecher: `А`, text: `Это твой дом?`, de: `Ist das dein Haus?` },
    { sprecher: `Б`, text: `Да, это мой дом.`, de: `Ja, das ist mein Haus.` },
    { sprecher: `А`, text: `А это? Это твоя комната?`, de: `Und das? Ist das dein Zimmer?` },
    { sprecher: `Б`, text: `Нет, это не моя комната. Это комната брата.`, de: `Nein, das ist nicht mein Zimmer. Das ist das Zimmer des Bruders.` },
    { sprecher: `А`, text: `Кто это?`, de: `Wer ist das?` },
    { sprecher: `Б`, text: `Это мой папа. Он врач.`, de: `Das ist mein Papa. Er ist Arzt.` },
  ],
  fragen: [
    {
      q: `Это его дом?`,
      a: [`Нет`, `Да, это его дом`, `Да, но не его комната`],
      c: 1,
      m: `„Да, это мой дом." — Ja, das ist sein Haus.`
    },
    {
      q: `Это его комната?`,
      a: [`Да`, `Нет, это комната брата`, `Нет, это комната мамы`],
      c: 1,
      m: `„Нет, это не моя комната. Это комната брата." — Nein, das Zimmer des Bruders.`
    },
    {
      q: `Кто папа?`,
      a: [`Студент`, `Друг`, `Врач`],
      c: 2,
      m: `„Это мой папа. Он врач." — Sein Papa ist Arzt.`
    },
  ]
}
