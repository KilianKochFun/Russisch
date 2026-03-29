module.exports = {
  typ: `dialog`,
  titel: `Familie vorstellen`,
  tts: true,
  zeilen: [
    { sprecher: `Анна`, text: `Виктор, это твой брат?`, de: `Viktor, ist das dein Bruder?` },
    { sprecher: `Виктор`, text: `Да, это мой брат Иван. Он врач.`, de: `Ja, das ist mein Bruder Ivan. Er ist Arzt.` },
    { sprecher: `Анна`, text: `А это кто? Красивая женщина!`, de: `Und wer ist das? Eine schöne Frau!` },
    { sprecher: `Виктор`, text: `Это моя бабушка. Ей 78 лет. Она очень активная.`, de: `Das ist meine Großmutter. Sie ist 78 Jahre alt. Sie ist sehr aktiv.` },
    { sprecher: `Анна`, text: `Правда? Молодец! А где твои родители?`, de: `Wirklich? Das ist beeindruckend! Und wo sind deine Eltern?` },
    { sprecher: `Виктор`, text: `Папа дома, он готовит ужин. Мама в городе, она работает.`, de: `Papa ist zu Hause und kocht das Abendessen. Mama ist in der Stadt, sie arbeitet.` },
    { sprecher: `Анна`, text: `Большая семья! У меня нет братьев и сестёр.`, de: `Eine große Familie! Ich habe keine Brüder und Schwestern.` },
    { sprecher: `Виктор`, text: `У меня есть брат, сестра и дедушка. Дедушка — артист!`, de: `Ich habe einen Bruder, eine Schwester und einen Großvater. Mein Großvater ist Künstler!` },
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
