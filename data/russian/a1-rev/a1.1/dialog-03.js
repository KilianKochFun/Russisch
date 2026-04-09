module.exports = {
  typ: `dialog`,
  titel: `Dialog: Это банк?`,
  tts: true,
  zeilen: [
    { sprecher: `А`, text: `Это банк?`, de: `Ist das eine Bank?` },
    { sprecher: `Б`, text: `Это банк. Это аптека.`, de: `Das ist eine Bank. Das ist eine Apotheke.` },
    { sprecher: `А`, text: `Это школа?`, de: `Ist das eine Schule?` },
    { sprecher: `Б`, text: `Это библиотека.`, de: `Das ist eine Bibliothek.` },
    { sprecher: `А`, text: `Он студент?`, de: `Ist er Student?` },
    { sprecher: `Б`, text: `Он врач.`, de: `Er ist Arzt.` },
  ],
  fragen: [
    {
      q: `Was fragt A zuerst?`,
      a: [`Ist das eine Apotheke?`, `Ist das eine Bank?`, `Ist das ein Haus?`],
      c: 1,
      m: `„Это банк?" — Это + Nomen + ? = Ist das ein(e)...?`
    },
    {
      q: `A fragt „Это школа?" — Was antwortet Б?`,
      a: [`Ja, das ist eine Schule`, `Das ist eine Bibliothek`, `Das ist eine Bank`],
      c: 1,
      m: `„Это библиотека." — Nein, das ist eine Bibliothek (nicht Schule).`
    },
    {
      q: `Ist „он" Student oder Arzt?`,
      a: [`Student`, `Arzt`, `Beides`],
      c: 1,
      m: `„Он врач." — Er ist Arzt. A fragte ob er Student ist, aber Б korrigiert: Arzt.`
    },
  ]
}
