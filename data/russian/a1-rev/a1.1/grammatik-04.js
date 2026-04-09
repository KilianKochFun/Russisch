module.exports = {
  typ: `grammatik`,
  titel: `Да, Нет & Не (Übungen)`,
  fragen: [
    {
      q: `„Это банк?" — Ja, das ist eine Bank.`,
      a: [`Нет, это банк.`, `Да, это банк.`, `Не, это банк.`],
      c: 1,
      m: `Да = Ja. Да, это банк = Ja, das ist eine Bank.`
    },
    {
      q: `„Это ресторан?" — Nein, das ist ein Geschäft.`,
      a: [`Да, это магазин.`, `Нет, это ресторан.`, `Нет, это магазин.`],
      c: 2,
      m: `Нет = Nein. Нет, это магазин = Nein, das ist ein Geschäft.`
    },
    {
      q: `Übersetze: „Das ist kein Park."`,
      a: [`Это парк.`, `Это не парк.`, `Нет парк.`],
      c: 1,
      m: `не steht vor dem verneinten Wort: Это не парк.`
    },
    {
      q: `Übersetze: „Er ist nicht Arzt."`,
      a: [`Он врач.`, `Он не врач.`, `Нет он врач.`],
      c: 1,
      m: `Он не врач. не steht direkt vor врач.`
    },
    {
      q: `„Это музей?" — Nein, das ist keine Museum, das ist eine Bibliothek.`,
      a: [`Нет, это не музей, это библиотека.`, `Да, это музей.`, `Нет, это музей.`],
      c: 0,
      m: `Нет + Это не X, это Y = Verneinung + Korrektur.`
    },
    {
      q: `„Она студент?" — Nein, sie ist Ärztin.`,
      a: [`Да, она студент.`, `Нет, она врач.`, `Нет, она не студент.`],
      c: 1,
      m: `Нет, она врач. Man kann direkt korrigieren ohne „не" zu wiederholen.`
    },
    {
      q: `Wie bildet man eine Ja/Nein-Frage im Russischen?`,
      a: [`Man stellt das Verb an den Anfang`, `Man hebt die Stimme am Ende (gleiche Wortstellung)`, `Man fügt ли ein`],
      c: 1,
      m: `Einfach die Stimme am Satzende heben! Это банк. → Это банк? Gleiche Wörter, andere Betonung.`
    },
    {
      q: `Übersetze: „Das ist kein Buch."`,
      a: [`Это книга.`, `Это не книга.`, `Нет книга.`],
      c: 1,
      m: `Это не книга. не steht direkt vor книга.`
    },
    {
      q: `„Это автобус?" — Ja.`,
      a: [`Нет.`, `Не.`, `Да.`],
      c: 2,
      m: `Да = Ja. Kurze Antwort reicht.`
    },
    {
      q: `„Это парк?" — „Nein, das ist kein Park. Das ist ein Haus."`,
      a: [`Нет, это не парк. Это дом.`, `Да, это парк.`, `Это не парк, не дом.`],
      c: 0,
      m: `Нет, это не парк. Это дом. Erst verneinen, dann korrigieren.`
    },
  ]
}
