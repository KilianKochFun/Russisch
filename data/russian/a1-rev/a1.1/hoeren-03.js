module.exports = {
  typ: `hoeren`,
  titel: `Hörtext: Он студент`,
  tts: true,
  text: `Это дом. Это окно. Это школа. Он студент. Она врач. Это банк. Это аптека.`,
  fragen: [
    {
      q: `Was wird zuerst genannt?`,
      a: [`Eine Bank`, `Ein Haus`, `Eine Schule`],
      c: 1,
      m: `„Это дом." — Das ist ein Haus. Zuerst kommt дом.`
    },
    {
      q: `„Он студент." — Was bedeutet das?`,
      a: [`Sie ist Studentin`, `Er ist Student`, `Das ist ein Student`],
      c: 1,
      m: `Он = er. Он студент = Er ist Student.`
    },
    {
      q: `Was kommt nach „Она врач"?`,
      a: [`Это школа`, `Это банк`, `Это дом`],
      c: 1,
      m: `Die Reihenfolge: ...Она врач. Это банк. Это аптека.`
    },
  ]
}
