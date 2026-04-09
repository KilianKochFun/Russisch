module.exports = {
  typ: `grammatik`,
  titel: `Это & Nullkopula (Übungen)`,
  fragen: [
    {
      q: `Übersetze: „Das ist eine Bank."`,
      a: [`Это есть банк.`, `Это банк.`, `Банк это.`],
      c: 1,
      m: `Kein „ist" im Russischen Präsens! Это банк.`
    },
    {
      q: `Übersetze: „Das ist eine Apotheke."`,
      a: [`Это аптека.`, `Аптека это.`, `Это есть аптека.`],
      c: 0,
      m: `Это аптека. Kein „ist" nötig.`
    },
    {
      q: `Übersetze: „Er ist Student."`,
      a: [`Он есть студент.`, `Он студент.`, `Студент он.`],
      c: 1,
      m: `Он студент. Pronomen + Nomen — kein „ist" dazwischen.`
    },
    {
      q: `Übersetze: „Sie ist Ärztin."`,
      a: [`Она врач.`, `Она есть врач.`, `Врач она.`],
      c: 0,
      m: `Она врач. врач bleibt maskulin auch für Frauen — она zeigt das Geschlecht.`
    },
    {
      q: `Übersetze: „Das ist ein Haus."`,
      a: [`Это школа.`, `Это окно.`, `Это дом.`],
      c: 2,
      m: `дом = Haus. школа = Schule, окно = Fenster.`
    },
    {
      q: `Übersetze: „Das ist ein Fenster."`,
      a: [`Это дом.`, `Это окно.`, `Это банк.`],
      c: 1,
      m: `окно = Fenster (neutrum, -о).`
    },
    {
      q: `Was fehlt? „___ студент." — Er ist Student.`,
      a: [`Это`, `Она`, `Он`],
      c: 2,
      m: `Он студент = Er ist Student. Это студент = Das ist ein Student (man zeigt auf jemanden).`
    },
    {
      q: `Was ist der Unterschied: „Это студент." vs. „Он студент."?`,
      a: [`Kein Unterschied`, `Это = Das ist ein Student (zeigen). Он = Er ist Student (über ihn).`, `Это ist falsch`],
      c: 1,
      m: `Это студент = man zeigt auf jemanden. Он студент = man spricht über eine bekannte Person.`
    },
    {
      q: `Übersetze: „Das ist Wein."`,
      a: [`Это вино.`, `Он вино.`, `Это банк.`],
      c: 0,
      m: `Это вино. Вино = Wein (neutrum).`
    },
    {
      q: `Warum sagt man nicht „Это есть банк"?`,
      a: [`есть bedeutet nur „essen"`, `быть (sein) wird im Präsens weggelassen`, `банк braucht kein Verb`],
      c: 1,
      m: `быть (sein) entfällt im Präsens. Это банк. In Vergangenheit/Zukunft kommt быть zurück!`
    },
  ]
}
