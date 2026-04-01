module.exports = {
  typ: `hoeren`,
  titel: `Kurz-Hörtext 2: Im Café`,
  tts: true,
  text: `— Добрый день! Что вы будете заказывать?
— Здравствуйте. Мне, пожалуйста, чашку кофе и кусок торта.
— С молоком или без?
— Без молока, спасибо. А торт — какой есть?
— Есть шоколадный и фруктовый.
— Возьму шоколадный. Сколько это стоит?
— Кофе — сто двадцать рублей, торт — двести пятьдесят. Итого триста семьдесят рублей.
— Хорошо. Вот карта.
— Спасибо. Приятного аппетита!`,
  fragen: [
    {
      q: `Was bestellt der Kunde?`,
      a: [`Tee und Kuchen`, `Kaffee und ein Stück Torte`, `Kaffee und ein Sandwich`],
      c: 1,
      m: `„...чашку кофе и кусок торта." — ча́шку = Tasse (Akkusativ). ку́сок то́рта = ein Stück Torte.`
    },
    {
      q: `„Без молока, спасибо." — Was bedeutет без + Genitiv hier?`,
      a: [`Mit Milch`, `Ohne Milch`, `Ein bisschen Milch`],
      c: 1,
      m: `без + Genitiv = ohne. молоко́ → молока́ (Genitiv). Без молока = ohne Milch.`
    },
    {
      q: `Wie viel kostet alles zusammen?`,
      a: [`120 Rubel`, `250 Rubel`, `370 Rubel`],
      c: 2,
      m: `„Итого триста семьдесят рублей." — ито́го = insgesamt. 300 + 70 = 370. три́ста семьдеся́т.`
    },
  ]
}
