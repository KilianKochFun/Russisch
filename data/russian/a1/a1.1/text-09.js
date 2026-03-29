module.exports = {
  typ: `text`,
  titel: `Lesetext: Meine Familie`,
  tts: true,
  inhalt: `Меня зовут Борис. Моя мама добрая и красивая. Мой папа умный и добрый. У меня есть сестра. Она молодая и весёлая. Я очень люблю мою семью!`,
  absaetze: [
    { ru: `Меня зовут Борис.`, de: `Mein Name ist Boris.` },
    { ru: `Моя мама добрая и красивая.`, de: `Meine Mutter ist gut und schön.` },
    { ru: `Мой папа умный и добрый.`, de: `Mein Vater ist klug und gut.` },
    { ru: `У меня есть сестра.`, de: `Ich habe eine Schwester.` },
    { ru: `Она молодая и весёлая.`, de: `Sie ist jung und fröhlich.` },
    { ru: `Я очень люблю мою семью!`, de: `Ich liebe meine Familie sehr!` },
  ],
  fragen: [
    {
      q: `Wie wird Borises Mutter beschrieben?`,
      a: [`Умная и молодая`, `Добрая и красивая`, `Весёлая и добрая`],
      c: 1,
      m: `„Моя мама добрая и красивая." — Adjektive ohne Kopula (Nullkopula): Nomen + Adj. ohne ist/ist.`
    },
    {
      q: `Was hat Boris außer seinen Eltern?`,
      a: [`Брата`, `Сестру`, `Друга`],
      c: 1,
      m: `„У меня есть сестра." — сестра = Schwester (f.); у меня есть = ich habe.`
    },
    {
      q: `Wie ist Borises Schwester?`,
      a: [`Добрая и умная`, `Красивая и старая`, `Молодая и весёлая`],
      c: 2,
      m: `„Она молодая и весёлая." — молодой/молодая = jung; весёлый/весёлая = fröhlich.`
    }
  ]
}
