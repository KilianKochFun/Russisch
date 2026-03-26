module.exports = {
  typ: `dialog`,
  titel: `Familie vorstellen`,
  tts: true,
  zeilen: [
    { sprecher: `Анна`, text: `Виктор, это твой брат?` },
    { sprecher: `Виктор`, text: `Да, это мой брат Иван. Он врач.` },
    { sprecher: `Анна`, text: `А это кто? Красивая женщина!` },
    { sprecher: `Виктор`, text: `Это моя бабушка. Ей 78 лет. Она очень активная.` },
    { sprecher: `Анна`, text: `Правда? Молодец! А где твои родители?` },
    { sprecher: `Виктор`, text: `Папа дома, он готовит ужин. Мама в городе, она работает.` },
    { sprecher: `Анна`, text: `Большая семья! У меня нет братьев и сестёр.` },
    { sprecher: `Виктор`, text: `У меня есть брат, сестра и дедушка. Дедушка — артист!` },
  ],
  fragen: [
    {
      q: `Was ist Ivans Beruf?`,
      a: [`Architekt`, `Arzt`, `Künstler`],
      c: 1,
      m: `Виктор говорит: „Он врач." — врач = Arzt (für Mann und Frau verwendbar).`
    },
    {
      q: `Was macht Viktors Vater gerade?`,
      a: [`Er ist in der Stadt`, `Er kocht das Abendessen`, `Er arbeitet`],
      c: 1,
      m: `„Папа дома, он готовит ужин." — готовит = er kocht (von готовить); ужин = Abendessen.`
    },
    {
      q: `Was ist Viktors Großvater von Beruf?`,
      a: [`Arzt`, `Architekt`, `Künstler`],
      c: 2,
      m: `„Дедушка — артист!" — Артист = Künstler/Schauspieler. Auch hier: Nullkopula, kein Verb.`
    },
  ]
}
