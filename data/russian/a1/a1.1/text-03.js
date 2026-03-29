module.exports = {
  typ: `text`,
  titel: `Lesetext: Erste Begegnung`,
  tts: true,
  inhalt: `Меня зовут Иван. Я студент. Это моя подруга Анна. Она тоже студентка. Мы из России. Анна говорит: «Привет! Я из Москвы.» Я говорю: «А я из Санкт-Петербурга!»`,
  fragen: [
    {
      q: `Was ist Ivan von Beruf?`,
      a: [`Журналист`, `Студент`, `Бизнесмен`],
      c: 1,
      m: `„Я студент." — Берuf mit Nullkopula: Я + Nomen ohne Verb. студент = Student (m.), студентка = Studentin (f.).`
    },
    {
      q: `Woher kommt Anna?`,
      a: [`Из Санкт-Петербурга`, `Из Лондона`, `Из Москвы`],
      c: 2,
      m: `„Я из Москвы." — из + Genitiv = aus ...; Москва → из Москвы. Richtung woher = из.`
    },
    {
      q: `Woher kommt Ivan?`,
      a: [`Из Москвы`, `Из России`, `Из Санкт-Петербурга`],
      c: 2,
      m: `„А я из Санкт-Петербурга!" — а = aber/und; Санкт-Петербург → из Санкт-Петербурга (Genitiv).`
    }
  ]
}
