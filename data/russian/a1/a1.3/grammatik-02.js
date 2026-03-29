module.exports = {
  typ: `grammatik`,
  titel: `Genitiv — Besitz & Mengen`,
  fragen: [
    // Genitiv Singular feminin: -а/-я → -ы/-и
    {
      q: `Wie lautet der Genitiv von книга (Buch)?`,
      a: [`книги`, `книге`, `книгу`],
      c: 0,
      m: `Feminina auf -га/-ка/-ха bilden den Genitiv auf -и (nicht -ы): книга → книги.`
    },
    {
      q: `Wie lautet der Genitiv von сестра (Schwester)?`,
      a: [`сестры`, `сестре`, `сестру`],
      c: 0,
      m: `Feminina auf -а bilden den Genitiv auf -ы: сестра → сестры.`
    },
    {
      q: `Wie lautet der Genitiv von школа (Schule)?`,
      a: [`школы`, `школе`, `школу`],
      c: 0,
      m: `Feminina auf -а bilden den Genitiv auf -ы: школа → школы.`
    },
    {
      q: `Wie lautet der Genitiv von газета (Zeitung)?`,
      a: [`газеты`, `газете`, `газету`],
      c: 0,
      m: `Feminina auf -а bilden den Genitiv auf -ы: газета → газеты.`
    },
    {
      q: `Wie lautet der Genitiv von машина (Auto)?`,
      a: [`машины`, `машине`, `машину`],
      c: 0,
      m: `Feminina auf -а bilden den Genitiv auf -ы: машина → машины.`
    },
    {
      q: `Wie lautet der Genitiv von деревня (Dorf)?`,
      a: [`деревни`, `деревне`, `деревню`],
      c: 0,
      m: `Feminina auf -я bilden den Genitiv auf -и: деревня → деревни.`
    },
    // Genitiv Singular maskulin: +а
    {
      q: `Wie lautet der Genitiv von брат (Bruder)?`,
      a: [`брата`, `братe`, `брату`],
      c: 0,
      m: `Maskulina auf Konsonant erhalten im Genitiv die Endung -а: брат → брата.`
    },
    {
      q: `Wie lautet der Genitiv von стол (Tisch)?`,
      a: [`стола`, `столе`, `столу`],
      c: 0,
      m: `Maskulina auf Konsonant erhalten im Genitiv die Endung -а: стол → стола.`
    },
    {
      q: `Wie lautet der Genitiv von город (Stadt)?`,
      a: [`города`, `городе`, `городу`],
      c: 0,
      m: `Maskulina auf Konsonant erhalten im Genitiv die Endung -а: город → города.`
    },
    {
      q: `Wie lautet der Genitiv von журнал (Zeitschrift)?`,
      a: [`журнала`, `журнале`, `журналу`],
      c: 0,
      m: `Maskulina auf Konsonant erhalten im Genitiv die Endung -а: журнал → журнала.`
    },
    {
      q: `Wie lautet der Genitiv von студент (Student)?`,
      a: [`студента`, `студенте`, `студенту`],
      c: 0,
      m: `Maskulina auf Konsonant erhalten im Genitiv die Endung -а: студент → студента.`
    },
    {
      q: `Wie lautet der Genitiv von отец (Vater)?`,
      a: [`отца`, `отце`, `отцу`],
      c: 0,
      m: `Bei отец fällt das flüchtige е aus: отец → отца.`
    },
    // нет + Genitiv
    {
      q: `Wie sagt man auf Russisch: „Ich habe keine Zeit"?`,
      a: [`У меня нет времени`, `У меня нет время`, `У меня нет времено`],
      c: 0,
      m: `нет verlangt den Genitiv: время → времени. Konstruktion: у меня нет + Genitiv.`
    },
    {
      q: `Wie sagt man: „Ich habe kein Geld"?`,
      a: [`У меня нет денег`, `У меня нет деньги`, `У меня нет деньгов`],
      c: 0,
      m: `нет + Genitiv Plural: деньги → денег (unregelmäßig).`
    },
    {
      q: `Wie sagt man: „Es gibt kein Wasser"?`,
      a: [`Нет воды`, `Нет вода`, `Нет воде`],
      c: 0,
      m: `нет + Genitiv: вода → воды.`
    },
    {
      q: `Wie sagt man: „Es gibt kein Brot"?`,
      a: [`Нет хлеба`, `Нет хлеб`, `Нет хлебу`],
      c: 0,
      m: `нет + Genitiv: хлеб → хлеба.`
    },
    {
      q: `Wie sagt man: „Es gibt keinen Platz / Es gibt keinen Platz mehr"?`,
      a: [`Нет места`, `Нет место`, `Нет месте`],
      c: 0,
      m: `нет + Genitiv: место → места.`
    },
    {
      q: `Wie sagt man: „Ich habe kein Buch"?`,
      a: [`У меня нет книги`, `У меня нет книга`, `У меня нет книгу`],
      c: 0,
      m: `нет + Genitiv Singular Feminin: книга → книги.`
    },
    {
      q: `Wie sagt man: „Ich habe keinen Bruder"?`,
      a: [`У меня нет брата`, `У меня нет брат`, `У меня нет брату`],
      c: 0,
      m: `нет + Genitiv Singular Maskulin: брат → брата.`
    },
    // у + Genitiv (Besitz)
    {
      q: `Wie sagt man: „Mein Bruder hat (ein Buch)"?`,
      a: [`У брата есть (книга)`, `Брат имеет (книга)`, `У брат есть (книга)`],
      c: 0,
      m: `Besitz: у + Genitiv + есть. брат → брата: у брата есть.`
    },
    {
      q: `Wie sagt man: „Meine Schwester hat (ein Auto)"?`,
      a: [`У сестры есть (машина)`, `У сестре есть (машина)`, `У сестру есть (машина)`],
      c: 0,
      m: `Besitz: у + Genitiv + есть. сестра → сестры: у сестры есть.`
    },
    {
      q: `Wie sagt man: „Mein Freund hat (Zeit)"?`,
      a: [`У друга есть (время)`, `У друг есть (время)`, `У другу есть (время)`],
      c: 0,
      m: `Besitz: у + Genitiv + есть. друг → друга: у друга есть.`
    },
    {
      q: `Wie sagt man: „Meine Mutter hat (Geld)"?`,
      a: [`У мамы есть (деньги)`, `У маме есть (деньги)`, `У маму есть (деньги)`],
      c: 0,
      m: `Besitz: у + Genitiv + есть. мама → мамы: у мамы есть.`
    },
    // Mengenangaben + Genitiv
    {
      q: `Welche Form ist korrekt: „viel Wasser"?`,
      a: [`много воды`, `много вода`, `много воде`],
      c: 0,
      m: `Mengenangaben (много, мало, немного) verlangen den Genitiv: вода → воды.`
    },
    {
      q: `Welche Form ist korrekt: „wenig Geld"?`,
      a: [`мало денег`, `мало деньги`, `мало деньгам`],
      c: 0,
      m: `мало + Genitiv Plural: деньги → денег.`
    },
    {
      q: `Welche Form ist korrekt: „ein bisschen Brot"?`,
      a: [`немного хлеба`, `немного хлеб`, `немного хлебу`],
      c: 0,
      m: `немного + Genitiv: хлеб → хлеба.`
    },
    // Zahlen + Genitiv
    {
      q: `Was folgt nach den Zahlen 2, 3, 4 — Genitiv Singular oder Plural?`,
      a: [`Genitiv Singular (два брата)`, `Genitiv Plural (два братов)`, `Nominativ (два брат)`],
      c: 0,
      m: `2/3/4 + Genitiv Singular: два брата, три книги, четыре стола.`
    },
    {
      q: `Was folgt nach den Zahlen ab 5 — Genitiv Singular oder Plural?`,
      a: [`Genitiv Plural (пять книг)`, `Genitiv Singular (пять книги)`, `Nominativ (пять книга)`],
      c: 0,
      m: `5 und mehr + Genitiv Plural: пять книг, шесть студентов.`
    },
    // Genitiv bei из/с (Woher)
    {
      q: `Wie sagt man: „Ich komme aus der Stadt"?`,
      a: [`Я из города`, `Я из город`, `Я из городе`],
      c: 0,
      m: `из + Genitiv für Herkunft aus geschlossenen Orten: город → города.`
    },
    {
      q: `Wie sagt man: „Ich komme aus der Schule"?`,
      a: [`Я из школы`, `Я из школа`, `Я из школе`],
      c: 0,
      m: `из + Genitiv: школа → школы.`
    },
    {
      q: `Wie sagt man: „Ich komme von der Arbeit"?`,
      a: [`Я с работы`, `Я с работа`, `Я с работе`],
      c: 0,
      m: `с + Genitiv für Herkunft von offenen Orten / Oberflächen: работа → работы.`
    },
    {
      q: `Wie sagt man: „Ich komme vom Markt"?`,
      a: [`Я с рынка`, `Я с рынок`, `Я с рынку`],
      c: 0,
      m: `с + Genitiv: рынок → рынка (flüchtiges о fällt aus).`
    },
  ]
}
