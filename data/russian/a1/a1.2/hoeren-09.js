module.exports = {
  typ: `hoeren`,
  titel: `Hören: Am Bahnhof`,
  tts: true,
  text: `Добрый день! Я еду на вокзал. Мне нужен билет до Москвы. Поезд отправляется в три часа. Мне нужно купить билет сейчас. Кассир продаёт билеты здесь. Я вижу его.`,
  fragen: [
    {
      q: `Wohin fährt die Person?`,
      a: [`In die Bibliothek`, `Zum Bahnhof`, `Ins Museum`],
      c: 1,
      m: `„Я еду на вокзал." — ехать + на вокзал (Akkusativ, unbelebtes Maskulinum).`
    },
    {
      q: `Was will die Person kaufen?`,
      a: [`Einen Brief`, `Eine Zeitung`, `Ein Ticket`],
      c: 2,
      m: `„Мне нужно купить билет." — купить (kaufen) + билет (Akkusativ, unbelebtes Maskulinum = unverändert).`
    },
    {
      q: `„Я вижу его." — Auf wen oder was bezieht sich „его"?`,
      a: [`Den Zug`, `Den Kassierer`, `Das Ticket`],
      c: 1,
      m: `„кассир" (Kassierer) ist maskulin → er = он → Akkusativ: его. Ich sehe ihn (den Kassierer).`
    },
  ]
}
