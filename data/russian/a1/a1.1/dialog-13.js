module.exports = {
  typ: `dialog`,
  titel: `Was machst du so?`,
  tts: true,
  zeilen: [
    { sprecher: `Анна`, text: `Борис, что ты обычно делаешь утром?` },
    { sprecher: `Борис`, text: `Я читаю и пью кофе. А ты?` },
    { sprecher: `Анна`, text: `Я занимаюсь спортом. Я люблю бегать!` },
    { sprecher: `Борис`, text: `Серьёзно? Я не люблю спорт. Я работаю дома.` },
    { sprecher: `Анна`, text: `Где ты работаешь?` },
    { sprecher: `Борис`, text: `Я работаю в офисе. Я пишу статьи о музыке.` },
    { sprecher: `Анна`, text: `Интересно! Я тоже пишу — я веду блог на русском.` },
    { sprecher: `Борис`, text: `Отлично! Значит, мы оба пишем и учимся!` },
  ],
  fragen: [
    {
      q: `Was macht Борис am Morgen?`,
      a: [`Er macht Sport`, `Er liest und trinkt Kaffee`, `Er arbeitet im Büro`],
      c: 1,
      m: `Борис говорит: „Я читаю и пью кофе." — читаю = ich lese; пью = ich trinke (von пить).`
    },
    {
      q: `Wo arbeitet Борис?`,
      a: [`Er arbeitet zu Hause`, `Er arbeitet in der Bibliothek`, `Er arbeitet im Büro`],
      c: 2,
      m: `„Я работаю в офисе." — офис = Büro; работаю = ich arbeite (работать, 1. Konj.).`
    },
    {
      q: `Was schreibt Анна?`,
      a: [`Artikel über Musik`, `Einen Blog auf Russisch`, `Einen Brief`],
      c: 1,
      m: `„Я веду блог на русском." — веду = ich führe (von вести); на русском = auf Russisch.`
    },
  ]
}
