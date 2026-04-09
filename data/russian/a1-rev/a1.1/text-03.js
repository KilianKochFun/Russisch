module.exports = {
  typ: `text`,
  titel: `Lesetext: Это банк`,
  tts: true,
  inhalt: `Это банк. Это аптека. Это школа. Он студент. Она врач. Это дом. Это окно.`,
  absaetze: [
    { ru: `Это банк.`, de: `Das ist eine Bank.` },
    { ru: `Это аптека.`, de: `Das ist eine Apotheke.` },
    { ru: `Это школа.`, de: `Das ist eine Schule.` },
    { ru: `Он студент.`, de: `Er ist Student.` },
    { ru: `Она врач.`, de: `Sie ist Ärztin.` },
    { ru: `Это дом.`, de: `Das ist ein Haus.` },
    { ru: `Это окно.`, de: `Das ist ein Fenster.` },
  ],
  fragen: [
    {
      q: `Was bedeutet „Это аптека"?`,
      a: [`Das ist eine Bank`, `Das ist eine Apotheke`, `Das ist eine Schule`],
      c: 1,
      m: `Это аптека = Das ist eine Apotheke.`
    },
    {
      q: `„Он студент." — Wer ist Student?`,
      a: [`Sie`, `Er`, `Das`],
      c: 1,
      m: `Он = er. Он студент = Er ist Student.`
    },
    {
      q: `„Она врач." — Was ist sie?`,
      a: [`Studentin`, `Ärztin`, `Lehrerin`],
      c: 1,
      m: `врач = Arzt/Ärztin. Она врач = Sie ist Ärztin.`
    },
  ]
}
