module.exports = {
  typ: `theorie`,
  titel: `Genitiv — Der 2. Kasus`,
  karten: [
    {
      titel: `Wann steht der Genitiv?`,
      erklaerung: `Der Genitiv (родительный падеж) ist der zweithäufigste Kasus im Russischen. Er erscheint in vier Hauptsituationen, die du als A1-Lerner alle brauchst:`,
      tabelle: [
        [`Situation`, `Konstruktion`, `Beispiel`],
        [`Nicht-Existenz`, `нет + Genitiv`, `У меня нет времени. — Ich habe keine Zeit.`],
        [`Besitz`, `у + Genitiv + есть`, `У сестры есть машина. — Meine Schwester hat ein Auto.`],
        [`Mengenangaben`, `много/мало/немного + Genitiv`, `много воды — viel Wasser`],
        [`Zahlen`, `2–4 + Gen.Sg. · 5+ + Gen.Pl.`, `два брата · пять книг`],
        [`Herkunft`, `из/с + Genitiv`, `из Москвы — aus Moskau`],
      ],
      m: `Merkhilfe: Genitiv = „Wessen?" und „Nicht vorhanden". нет immer mit Genitiv!`
    },
    {
      titel: `Genitiv bilden — Endungsregeln`,
      erklaerung: `Die Endung richtet sich nach dem Genus und der Stammendung des Nomens. Es gibt eine praktische Faustregel für fast alle Fälle:`,
      tabelle: [
        [`Genus`, `Nominativ-Endung`, `Genitiv-Endung`, `Beispiel`],
        [`feminin`, `-а`, `-ы`, `школа → школы`],
        [`feminin (nach г/к/х/ж/ш/щ/ч)`, `-а`, `-и`, `книга → книги`],
        [`feminin`, `-я`, `-и`, `деревня → деревни`],
        [`maskulin`, `Konsonant`, `+а`, `брат → брата · город → города`],
        [`maskulin`, `-ь`, `+я`, `день → дня`],
        [`neutral`, `-о`, `-а`, `окно → окна`],
        [`neutral`, `-е`, `-я`, `поле → поля`],
      ],
      m: `Eselsbrücke: feminin -а→-ы (außer nach г/к/х → -и). Maskulin Konsonant → +а. Neutral -о → -а.`
    },
    {
      titel: `нет + Genitiv — Nicht-Existenz`,
      erklaerung: `нет ist das wichtigste Wort für Nicht-Existenz: „Es gibt kein/nicht" oder „Ich habe kein". Es verlangt immer den Genitiv. Das gilt auch in Kombination mit у + Genitiv (= Besitz-Verneinung).`,
      beispiele: [
        `Нет воды. — Es gibt kein Wasser.`,
        `Нет места. — Es gibt keinen Platz.`,
        `У меня нет денег. — Ich habe kein Geld.`,
        `У него нет времени. — Er hat keine Zeit.`,
        `У сестры нет машины. — Meine Schwester hat kein Auto.`,
      ],
      m: `нет + Genitiv = Verneinung von Besitz/Existenz. Gegenteil: у + Gen + есть (= hat). Nie нет + Nominativ!`
    },
    {
      titel: `Zahlen und Genitiv`,
      erklaerung: `Russische Zahlen steuern den Kasus des folgenden Nomens. Die Regel ist einfach, aber man muss sie auswendig können:`,
      tabelle: [
        [`Zahl`, `Kasus des Nomens`, `Beispiel`],
        [`1 (один)`, `Nominativ Singular`, `один брат, одна книга`],
        [`2, 3, 4`, `Genitiv Singular`, `два брата, три книги, четыре стола`],
        [`5, 6, ... 20`, `Genitiv Plural`, `пять братьев, шесть книг`],
        [`21, 22...`, `wieder wie 1/2/3/4`, `двадцать один брат, двадцать два брата`],
      ],
      beispiele: [
        `У меня два брата и три сестры.`,
        `В классе пять студентов.`,
        `Мне нужно купить два килограмма сахара.`,
      ],
      m: `1 → Nom. · 2/3/4 → Gen.Sg. · 5+ → Gen.Pl. Zahl 11–14 = immer Gen.Pl. (elf = пять по-счёту).`
    },
  ]
}
