module.exports = {
  typ: `theorie`,
  titel: `Verneinung & Haben`,
  karten: [
    {
      titel: `Verneinung mit не`,
      erklaerung: `Die Partikel не (nicht) steht direkt vor dem Wort, das verneint wird — Verb, Adjektiv oder Nomen. Sie ist unveränderlich und wird immer klein geschrieben.`,
      tabelle: [
        [`Aussage`, `Verneinung`],
        [`Я знаю. — Ich weiß.`, `Я не знаю. — Ich weiß nicht.`],
        [`Он говорит. — Er spricht.`, `Он не говорит. — Er spricht nicht.`],
        [`Это красиво. — Das ist schön.`, `Это не красиво. — Das ist nicht schön.`],
        [`Это банк. — Das ist eine Bank.`, `Это не банк. — Das ist keine Bank.`],
      ],
      m: `не direkt vor Verb/Adjektiv/Nomen. Wird mit dem folgenden Wort zusammengesprochen.`
    },
    {
      titel: `нет — „Nein" und „es gibt nicht"`,
      erklaerung: `нет hat zwei Verwendungen: Als eigenständiges Wort bedeutet es „Nein". In der Konstruktion у + Genitiv + нет bedeutet es „(jemand) hat kein/keine" — die Verneinung des Haben-Ausdrucks.`,
      beispiele: [
        `Ты знаешь? — Нет. — Weißt du? — Nein.`,
        `У меня нет времени. — Ich habe keine Zeit.`,
        `У него нет денег. — Er hat kein Geld.`,
      ],
      m: `не = nicht (vor einem Wort) · нет = Nein (allein) ODER нет + Genitiv = kein/keine`
    },
    {
      titel: `Haben: у + Genitiv + есть`,
      erklaerung: `Russisch hat kein Verb „haben". Stattdessen sagt man wörtlich: „Bei mir gibt es ein Buch." Die Konstruktion ist: у + Pronomen im Genitiv + есть + Nomen im Nominativ. Die Genitivformen der Personalpronomen muss man auswendig lernen.`,
      tabelle: [
        [`Nominativ`, `Genitiv (bei у)`, `Beispiel`],
        [`я`, `у меня`, `У меня есть книга. — Ich habe ein Buch.`],
        [`ты`, `у тебя`, `У тебя есть виза? — Hast du ein Visum?`],
        [`он`, `у него`, `У него есть машина. — Er hat ein Auto.`],
        [`она`, `у неё`, `У неё есть вопрос. — Sie hat eine Frage.`],
        [`мы`, `у нас`, `У нас нет времени. — Wir haben keine Zeit.`],
        [`вы`, `у вас`, `У вас есть минута? — Haben Sie eine Minute?`],
        [`они`, `у них`, `У них есть дети. — Sie haben Kinder.`],
      ],
      m: `Wichtig: нет nimmt das folgende Nomen immer im Genitiv! У меня нет книги — nicht нет книга. (книга → книги im Genitiv)`
    },
    {
      titel: `Genitiv Singular — Nomen nach нет`,
      erklaerung: `Nach нет steht das Nomen immer im Genitiv Singular. Die Genitiv-Endung hängt von Genus und Nominativ-Endung ab. Es gibt mehrere Muster — je nach Endung des Nomens.`,
      tabelle: [
        [`Genus`, `Nom.-Endung`, `Genitiv-Endung`, `Beispiel`],
        [`männlich`, `Konsonant`, `+ -а`, `брат → брата · друг → друга`],
        [`männlich`, `-й`, `-я`, `музей → музея · трамвай → трамвая`],
        [`weiblich`, `-а`, `-ы`, `сестра → сестры · машина → машины`],
        [`weiblich`, `-я`, `-и`, `семья → семьи · станция → станции`],
        [`weiblich`, `-ь`, `-и`, `дверь → двери · ночь → ночи`],
        [`sächlich`, `-о`, `-а`, `окно → окна · слово → слова`],
        [`sächlich`, `-е / -ие`, `-я / -ия`, `море → моря · здание → здания`],
        [`Ausnahme`, `время`, `времени`, `у меня нет времени`],
      ],
      m: `Plural nach нет: oft auf -ов/-ев (м.р.) oder -∅ (ж./с.р.): нет друзей, нет денег, нет книг. Plural-Genitiv am besten mit jedem Wort mitlernen.`
    },
  ]
}
