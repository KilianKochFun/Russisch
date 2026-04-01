module.exports = {
  typ: `dialog`,
  titel: `Zukunftspläne`,
  tts: true,
  zeilen: [
    { sprecher: `Маша`, text: `Борис, что ты будешь делать летом?` },
    { sprecher: `Борис`, text: `Я поеду в Санкт-Петербург! Я хочу посмотреть Эрмитаж.` },
    { sprecher: `Маша`, text: `Ты уже был там?` },
    { sprecher: `Борис`, text: `Нет, никогда не был. А ты?` },
    { sprecher: `Маша`, text: `Я была там два года назад. Это потрясающе! Ты должен обязательно пойти в Эрмитаж.` },
    { sprecher: `Борис`, text: `Я уже купил билеты онлайн. Ещё я хочу попробовать настоящую питерскую кухню.` },
    { sprecher: `Маша`, text: `Обязательно попробуй! Там есть отличные рестораны рядом с Невским проспектом.` },
    { sprecher: `Борис`, text: `Спасибо за совет! Расскажи мне больше о городе.` },
  ],
  fragen: [
    {
      q: `„Что ты будешь делать летом?" — Was ist die Futurform hier?`,
      a: [`Perfektiv (поедешь)`, `Imperfektiv: будешь + Infinitiv`, `Präsens als Futur`],
      c: 1,
      m: `„будешь делать" = Futur imperfektiv: будешь + делать (Infinitiv). Für andauernde/allgemeine Zukunft.`
    },
    {
      q: `„Ты уже был там?" und „Нет, никогда не был." — Was ist die Präteritum-Form?`,
      a: [`был — maskulin Singular von быть`, `была — feminin Singular`, `были — Plural`],
      c: 0,
      m: `быть → был (maskulin Sg.). Борис ist männlich → был. никогда не был = war dort nie.`
    },
    {
      q: `„Ты должен обязательно пойти в Эрмитаж." — Was bedeutet „должен"?`,
      a: [`du darfst`, `du musst/solltest`, `du kannst`],
      c: 1,
      m: `должен (maskulin) + Infinitiv = muss/sollte. пойти = gehen (perfektiv). Ты должен пойти = Du musst hingehen.`
    },
  ]
}
