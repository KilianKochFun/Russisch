module.exports = {
  typ: `text`,
  titel: `Lesetext: Im Café`,
  tts: true,
  inhalt: `Антон и Катя в кафе. У Антона есть кофе. У Кати нет кофе. Катя говорит: «У меня есть вино!» Антон говорит: «Нет, это не вино. Это сок!»`,
  fragen: [
    {
      q: `Was hat Anton?`,
      a: [`Чай`, `Вино`, `Кофе`],
      c: 2,
      m: `„У Антона есть кофе." — у + Genitiv + есть = jemand hat etwas. Antон → у Антона (Genitiv).`
    },
    {
      q: `Was denkt Katja zu haben?`,
      a: [`Кофе`, `Вино`, `Сок`],
      c: 1,
      m: `„У меня есть вино!" — Katja denkt, sie hat Wein. Aber Anton korrigiert: es ist Saft.`
    },
    {
      q: `Was ist es wirklich?`,
      a: [`Вода`, `Вино`, `Сок`],
      c: 2,
      m: `„Это не вино. Это сок!" — не vor dem Nomen = Verneinung der Identität: es ist kein/keine...`
    }
  ]
}
