module.exports = {
  typ: `dialog`,
  titel: `Pläne für die Woche`,
  tts: true,
  zeilen: [
    { sprecher: `Саша`, text: `Катя, что ты делаешь в субботу?` },
    { sprecher: `Катя`, text: `Утром я дома. Вечером иду на концерт.` },
    { sprecher: `Саша`, text: `Здорово! Я тоже люблю музыку. Ты часто ходишь на концерты?` },
    { sprecher: `Катя`, text: `Иногда. Зимой я хожу редко, летом — часто.` },
    { sprecher: `Саша`, text: `А в воскресенье ты свободна?` },
    { sprecher: `Катя`, text: `Нет, в воскресенье я работаю весь день.` },
    { sprecher: `Саша`, text: `Тогда в понедельник? Мы идём в кино вечером?` },
    { sprecher: `Катя`, text: `Отлично! В понедельник вечером я всегда свободна!` },
  ],
  fragen: [
    {
      q: `Was macht Катя am Samstagabend?`,
      a: [`Sie bleibt zu Hause`, `Sie geht ins Kino`, `Sie geht auf ein Konzert`],
      c: 2,
      m: `Катя говорит: „Вечером иду на концерт." — вечером = abends; иду = ich gehe (идти).`
    },
    {
      q: `Wann geht Катя selten auf Konzerte?`,
      a: [`Im Sommer`, `Im Winter`, `Am Wochenende`],
      c: 1,
      m: `„Зимой я хожу редко, летом — часто." — зимой = im Winter; редко = selten; летом = im Sommer.`
    },
    {
      q: `Wann verabreden sie sich letztlich?`,
      a: [`Am Sonntag`, `Am Samstag`, `Am Montagabend`],
      c: 2,
      m: `„В понедельник вечером я всегда свободна!" — в понедельник = am Montag; вечером = abends.`
    },
  ]
}
