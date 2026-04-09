module.exports = {
  typ: `hoeren`,
  titel: `Hörtext: Что это?`,
  tts: true,
  text: `Что это? Это дом. А это? Это парк. Кто это? Это сестра. Она не врач. Она студент. Что это? Это письмо.`,
  fragen: [
    {
      q: `Was wird zuerst genannt?`,
      a: [`Ein Park`, `Ein Haus`, `Ein Brief`],
      c: 1,
      m: `„Что это? Это дом." — Zuerst wird das Haus genannt.`
    },
    {
      q: `Кто она?`,
      a: [`Врач`, `Студент`, `Брат`],
      c: 1,
      m: `„Она не врач. Она студент." — Sie ist Studentin, nicht Ärztin.`
    },
    {
      q: `Was ist „это" am Ende?`,
      a: [`Eine Zeitung`, `Ein Brief`, `Ein Buch`],
      c: 1,
      m: `„Что это? Это письмо." — Das ist ein Brief.`
    },
  ]
}
