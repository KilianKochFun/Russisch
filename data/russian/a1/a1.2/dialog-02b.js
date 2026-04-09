module.exports = {
  typ: `dialog`,
  titel: `Im Laden (Akkusativ üben)`,
  tts: true,
  zeilen: [
    { sprecher: `Анна`, text: `Добрый день! Я ищу подарок.` },
    { sprecher: `Продавец`, text: `Что вы ищете? Книгу? Сумку?` },
    { sprecher: `Анна`, text: `Я ищу книгу. Мой брат любит читать.` },
    { sprecher: `Продавец`, text: `Вот хорошая книга. Вы знаете этого автора?` },
    { sprecher: `Анна`, text: `Да, я знаю его. Отлично! Я беру книгу.` },
    { sprecher: `Продавец`, text: `Ещё что-нибудь? Может, газету?` },
    { sprecher: `Анна`, text: `Нет, спасибо. Только книгу.` },
    { sprecher: `Продавец`, text: `Двести рублей, пожалуйста.` },
  ],
  fragen: [
    {
      q: `Was sucht Anna?`,
      a: [`Eine Tasche`, `Ein Geschenk (ein Buch)`, `Eine Zeitung`],
      c: 1,
      m: `„Я ищу подарок." + „Я ищу книгу." — подарок (mask. unbelebt, unverändert), книгу (fem. Akk: -у).`
    },
    {
      q: `„Вы знаете этого автора?" — Warum автора und nicht автор?`,
      a: [`Genitiv`, `Akkusativ maskulin belebt: автор → автора`, `Dativ`],
      c: 1,
      m: `автор = maskulin, belebt (Person) → Akkusativ: +а → автора. Kennen Sie diesen Autor?`
    },
    {
      q: `Wie viel kostet das Buch?`,
      a: [`100 Rubel`, `200 Rubel`, `300 Rubel`],
      c: 1,
      m: `„Двести рублей." — двести = 200. рублей = Genitiv Plural (nach Zahlen ab 5).`
    },
  ]
}
