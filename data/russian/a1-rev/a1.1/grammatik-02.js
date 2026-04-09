module.exports = {
  typ: `grammatik`,
  titel: `Nominativ & Genus (Übungen)`,
  fragen: [
    {
      q: `Welches Genus hat „банк"?`,
      a: [`feminin`, `maskulin`, `neutrum`],
      c: 1,
      m: `банк endet auf Konsonant (к) → maskulin. Alle Nomen auf Konsonant = maskulin.`
    },
    {
      q: `Welches Genus hat „аптека"?`,
      a: [`maskulin`, `neutrum`, `feminin`],
      c: 2,
      m: `аптека endet auf -а → feminin. Nomen auf -а/-я = feminin.`
    },
    {
      q: `Welches Genus hat „вино"?`,
      a: [`neutrum`, `maskulin`, `feminin`],
      c: 0,
      m: `вино endet auf -о → neutrum. Nomen auf -о/-е = neutrum.`
    },
    {
      q: `Welches Genus hat „автобус"?`,
      a: [`feminin`, `neutrum`, `maskulin`],
      c: 2,
      m: `автобус endet auf Konsonant (с) → maskulin.`
    },
    {
      q: `Welches Genus hat „библиотека"?`,
      a: [`feminin`, `maskulin`, `neutrum`],
      c: 0,
      m: `библиотека endet auf -а → feminin.`
    },
    {
      q: `Welches Pronomen passt? „___ — банк." (Das ist eine Bank → er ist eine Bank)`,
      a: [`она`, `он`, `оно`],
      c: 1,
      m: `банк = maskulin → он. Он = er (für maskuline Nomen).`
    },
    {
      q: `Welches Pronomen passt? „___ — аптека."`,
      a: [`он`, `оно`, `она`],
      c: 2,
      m: `аптека = feminin → она. Она = sie (für feminine Nomen).`
    },
    {
      q: `Welches Pronomen passt? „___ — вино."`,
      a: [`оно`, `он`, `она`],
      c: 0,
      m: `вино = neutrum → оно. Оно = es (für neutrale Nomen).`
    },
    {
      q: `Ein Nomen endet auf -а. Was ist es wahrscheinlich?`,
      a: [`maskulin`, `feminin`, `neutrum`],
      c: 1,
      m: `Nomen auf -а/-я = feminin. Das gilt für fast alle Fälle. (Ausnahmen: папа, дядя — aber die kommen später.)`
    },
    {
      q: `Ein Nomen endet auf -о. Was ist es?`,
      a: [`feminin`, `maskulin`, `neutrum`],
      c: 2,
      m: `Nomen auf -о/-е = neutrum. Immer! Вино endet auf -о → neutrum.`
    },
  ]
}
