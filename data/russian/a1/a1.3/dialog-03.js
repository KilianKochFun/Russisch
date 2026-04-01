module.exports = {
  typ: `dialog`,
  titel: `Im Café — Was haben wir?`,
  tts: true,
  zeilen: [
    { sprecher: `Официант`, text: `Добрый день! Что вы будете?` },
    { sprecher: `Катя`, text: `У вас есть зелёный чай?` },
    { sprecher: `Официант`, text: `Нет, зелёного чая нет. Есть только чёрный.` },
    { sprecher: `Катя`, text: `Хорошо, тогда чёрный чай, пожалуйста. А у вас есть пирожное?` },
    { sprecher: `Официант`, text: `Пирожных нет, но есть торт. Очень вкусный!` },
    { sprecher: `Катя`, text: `Отлично! Мне кусок торта, пожалуйста.` },
    { sprecher: `Официант`, text: `И больше ничего?` },
    { sprecher: `Катя`, text: `Нет, больше ничего. У меня мало времени.` },
  ],
  fragen: [
    {
      q: `Warum sagt der Kellner „зелёного чая нет"?`,
      a: [`Weil er grünen Tee nicht mag`, `Genitiv nach нет: зелёный чай → зелёного чая`, `Er versteht Katya nicht`],
      c: 1,
      m: `нет verlangt den Genitiv: зелёный чай (Nom.) → зелёного чая (Gen.). нет + Genitiv = es gibt kein...`
    },
    {
      q: `Was bestellt Катя?`,
      a: [`Grünen Tee und Gebäck`, `Schwarzen Tee und ein Stück Torte`, `Kaffee und Kuchen`],
      c: 1,
      m: `„Чёрный чай" und „кусок торта". кусок = ein Stück. торт = Torte.`
    },
    {
      q: `„У меня мало времени." — Was bedeutet das?`,
      a: [`Ich habe viel Zeit`, `Ich habe keine Uhr`, `Ich habe wenig Zeit`],
      c: 2,
      m: `мало + Genitiv: время → времени. У меня мало времени = Ich habe wenig Zeit. Mengenangabe мало fordert Genitiv.`
    },
  ]
}
