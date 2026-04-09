module.exports = {
  typ: `hoeren`,
  titel: `Hörtext: Мой друг`,
  tts: true,
  text: `Это мой друг. Он студент. Это его квартира. Его квартира — не дом. Моя мама — врач. Мой папа — не врач. А это? Это моё письмо.`,
  fragen: [
    {
      q: `Кто он?`,
      a: [`Врач`, `Студент`, `Брат`],
      c: 1,
      m: `„Это мой друг. Он студент." — Er ist Student.`
    },
    {
      q: `Кто мама?`,
      a: [`Студент`, `Не врач`, `Врач`],
      c: 2,
      m: `„Моя мама — врач." — Mama ist Ärztin.`
    },
    {
      q: `Was ist am Ende erwähnt?`,
      a: [`Eine Zeitung`, `Ein Brief`, `Ein Buch`],
      c: 1,
      m: `„Это моё письмо." — Das ist mein Brief.`
    },
  ]
}
