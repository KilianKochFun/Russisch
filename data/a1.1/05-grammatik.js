module.exports = {
  typ: `grammatik`,
  titel: `Verneinung & Haben`,
  fragen: [
    {
      q: `Was ist die korrekte Verneinung von „я знаю"?`,
      a: [`я не знаю`, `я без знаю`, `я нет знаю`],
      c: 0,
      m: `Verneinung = не direkt vor dem Verb: я не знаю, он не говорит. нет steht allein als „Nein".`
    },
    {
      q: `Wie sagt man „Ich habe ein Buch"?`,
      a: [`Я имею книгу`, `У меня есть книга`, `Мне есть книга`],
      c: 1,
      m: `Russisch hat kein haben-Verb! у + Genitiv + есть = „bei mir gibt es". У тебя есть? = Hast du?`
    },
    {
      q: `Was bedeutet „У него нет денег"?`,
      a: [`Er hat viel Geld`, `Er hat kein Geld`, `Er braucht Geld`],
      c: 1,
      m: `нет + Genitiv = es gibt kein... Verneinung von есть ist нет. У него нет = er hat kein.`
    },
    {
      q: `Wie sagt man „Hast du ein Visum?"`,
      a: [`Ты имеешь виза?`, `У тебя есть виза?`, `Ты есть виза?`],
      c: 1,
      m: `Haben-Frage: у + Pronomen (Genitiv) + есть + Nominativ. у тебя = bei dir (von ты).`
    },
    {
      q: `„У нас ___ времени." — Wir haben keine Zeit.`,
      a: [`есть`, `нет`, `не`],
      c: 1,
      m: `нет + Genitiv = kein/keine. У нас нет времени = Wir haben keine Zeit. времени = Genitiv von время.`
    },
    {
      q: `Wie verneint man: „Das ist nicht schön"?`,
      a: [`Это нет красивый`, `Это не красивый`, `Это без красивый`],
      c: 1,
      m: `не steht vor allem was verneint wird: Verb, Adjektiv, Nomen. нет steht nur allein = Nein.`
    },
    {
      q: `Was ist der Unterschied: „не" vs „нет"?`,
      a: [`не = kein, нет = nicht`, `не = vor Verb/Adj, нет = allein oder нет + Genitiv`, `beide bedeuten dasselbe`],
      c: 1,
      m: `не direkt vor Verb oder Adjektiv. нет = Nein allein ODER у меня нет + Genitiv = ich habe kein...`
    },
    {
      q: `Wie fragt man „Hat sie Geld?" auf Russisch?`,
      a: [`Она имеет деньги?`, `У неё есть деньги?`, `Есть она деньги?`],
      c: 1,
      m: `у неё = bei ihr (Genitiv von она). Serie: у меня / у тебя / у него / у неё / у нас / у вас / у них.`
    },
  ]
}
