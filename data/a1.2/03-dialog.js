module.exports = {
  typ: `dialog`,
  titel: `Im Laden`,
  tts: true,
  zeilen: [
    { sprecher: `Анна`, text: `Добрый день! Что у вас есть?` },
    { sprecher: `Продавец`, text: `У нас есть хлеб, молоко, вода и сок.` },
    { sprecher: `Анна`, text: `Хорошо. Я беру хлеб и воду, пожалуйста.` },
    { sprecher: `Продавец`, text: `Вы берёте эту газету тоже?` },
    { sprecher: `Анна`, text: `Да! Я читаю эту газету каждый день. Я люблю читать.` },
    { sprecher: `Продавец`, text: `Что ещё? Вы видите наше молоко?` },
    { sprecher: `Анна`, text: `Да, вижу. Я не беру молоко — я не люблю молоко.` },
    { sprecher: `Продавец`, text: `Понятно. Итого: сто пятьдесят рублей.` },
  ],
  fragen: [
    {
      q: `Was kauft Анна? (3 Sachen)`,
      a: [`Хлеб, молоко и газету`, `Хлеб, воду и газету`, `Воду, сок и газету`],
      c: 1,
      m: `Анна берёт хлеб, воду и газету. беру/берёт = nehme/nimmt (брать). Objekte im Akkusativ: воду (вода→воду).`
    },
    {
      q: `Warum kauft Анна kein Milch?`,
      a: [`Es ist zu teuer`, `Sie hat schon Milch`, `Sie mag keine Milch`],
      c: 2,
      m: `„Я не люблю молоко." — любить + Akkusativ: молоко bleibt unverändert (Neutrum).`
    },
    {
      q: `Was macht Анна jeden Tag?`,
      a: [`Sie kauft Brot`, `Sie liest die Zeitung`, `Sie geht in den Laden`],
      c: 1,
      m: `„Я читаю эту газету каждый день." — читаю = ich lese; эту газету = diese Zeitung (Akkusativ).`
    },
  ]
}
