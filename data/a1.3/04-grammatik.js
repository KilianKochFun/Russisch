module.exports = {
  typ: `grammatik`,
  titel: `Dativ — Geben & Fühlen`,
  fragen: [
    // Dativ Singular feminin: -а → -е
    {
      q: `Wie lautet der Dativ von сестра (Schwester)?`,
      a: [`сестре`, `сестры`, `сестру`],
      c: 0,
      m: `Feminina auf -а bilden den Dativ auf -е: сестра → сестре.`
    },
    {
      q: `Wie lautet der Dativ von мама (Mama)?`,
      a: [`маме`, `мамы`, `маму`],
      c: 0,
      m: `Feminina auf -а bilden den Dativ auf -е: мама → маме.`
    },
    {
      q: `Wie lautet der Dativ von школа (Schule)?`,
      a: [`школе`, `школы`, `школу`],
      c: 0,
      m: `Feminina auf -а bilden den Dativ auf -е: школа → школе.`
    },
    {
      q: `Wie lautet der Dativ von подруга (Freundin)?`,
      a: [`подруге`, `подруги`, `подругу`],
      c: 0,
      m: `Feminina auf -а bilden den Dativ auf -е: подруга → подруге.`
    },
    // Dativ Singular maskulin: +у
    {
      q: `Wie lautet der Dativ von брат (Bruder)?`,
      a: [`брату`, `брата`, `брате`],
      c: 0,
      m: `Maskulina auf Konsonant erhalten im Dativ die Endung -у: брат → брату.`
    },
    {
      q: `Wie lautet der Dativ von друг (Freund)?`,
      a: [`другу`, `друга`, `друге`],
      c: 0,
      m: `Maskulina auf Konsonant erhalten im Dativ die Endung -у: друг → другу.`
    },
    {
      q: `Wie lautet der Dativ von отец (Vater)?`,
      a: [`отцу`, `отца`, `отце`],
      c: 0,
      m: `Bei отец fällt das flüchtige е aus, Endung -у: отец → отцу.`
    },
    {
      q: `Wie lautet der Dativ von студент (Student)?`,
      a: [`студенту`, `студента`, `студенте`],
      c: 0,
      m: `Maskulina auf Konsonant erhalten im Dativ die Endung -у: студент → студенту.`
    },
    // Personalpronomen im Dativ
    {
      q: `Wie lautet „mir" (Dativ von я) auf Russisch?`,
      a: [`мне`, `меня`, `мной`],
      c: 0,
      m: `я → мне (Dativ). Beispiel: Дай мне книгу — Gib mir das Buch.`
    },
    {
      q: `Wie lautet „dir" (Dativ von ты) auf Russisch?`,
      a: [`тебе`, `тебя`, `тобой`],
      c: 0,
      m: `ты → тебе (Dativ). Beispiel: Я скажу тебе — Ich sage es dir.`
    },
    {
      q: `Wie lautet „ihm" (Dativ von он) auf Russisch?`,
      a: [`ему`, `его`, `им`],
      c: 0,
      m: `он → ему (Dativ). Beispiel: Помоги ему — Hilf ihm.`
    },
    {
      q: `Wie lautet „ihr" (Dativ von она) auf Russisch?`,
      a: [`ей`, `её`, `ею`],
      c: 0,
      m: `она → ей (Dativ). Beispiel: Позвони ей — Ruf sie an.`
    },
    {
      q: `Wie lautet „uns" (Dativ von мы) auf Russisch?`,
      a: [`нам`, `нас`, `нами`],
      c: 0,
      m: `мы → нам (Dativ). Beispiel: Объясни нам — Erkläre es uns.`
    },
    {
      q: `Wie lautet „euch / Ihnen" (Dativ von вы) auf Russisch?`,
      a: [`вам`, `вас`, `вами`],
      c: 0,
      m: `вы → вам (Dativ). Beispiel: Я пишу вам — Ich schreibe euch/Ihnen.`
    },
    {
      q: `Wie lautet „ihnen" (Dativ von они) auf Russisch?`,
      a: [`им`, `их`, `ими`],
      c: 0,
      m: `они → им (Dativ). Beispiel: Дай им — Gib ihnen.`
    },
    // Verben mit Dativ
    {
      q: `Welche Konstruktion ist korrekt: „Ich gebe meiner Schwester ein Buch"?`,
      a: [`Я дам сестре книгу`, `Я дам сестру книгу`, `Я дам сестры книгу`],
      c: 0,
      m: `дать verlangt den Dativ für die Person: сестра → сестре.`
    },
    {
      q: `Welche Konstruktion ist korrekt: „Ich rufe meinen Freund an"?`,
      a: [`Я звоню другу`, `Я звоню друга`, `Я звоню друге`],
      c: 0,
      m: `звонить verlangt den Dativ: друг → другу. Nicht Akkusativ!`
    },
    {
      q: `Welche Konstruktion ist korrekt: „Ich schreibe meiner Mama"?`,
      a: [`Я пишу маме`, `Я пишу маму`, `Я пишу мамы`],
      c: 0,
      m: `писать (an jemanden) verlangt den Dativ: мама → маме.`
    },
    {
      q: `Welche Konstruktion ist korrekt: „Hilf mir!"?`,
      a: [`Помоги мне!`, `Помоги меня!`, `Помоги мной!`],
      c: 0,
      m: `помочь verlangt den Dativ: я → мне.`
    },
    // нравиться-Konstruktion
    {
      q: `Wie sagt man: „Ich mag das Buch" (mit нравиться)?`,
      a: [`Мне нравится книга`, `Мне нравятся книга`, `Я нравлюсь книгу`],
      c: 0,
      m: `нравиться richtet sich nach dem Subjekt (die Sache): Singular → нравится.`
    },
    {
      q: `Wie sagt man: „Ich mag die Bücher" (Plural, mit нравиться)?`,
      a: [`Мне нравятся книги`, `Мне нравится книги`, `Я нравлюсь книги`],
      c: 0,
      m: `Bei Pluralsubjekt: нравятся (Plural). книги → Мне нравятся книги.`
    },
    // Alter-Konstruktion
    {
      q: `Wie sagt man: „Ich bin 20 Jahre alt"?`,
      a: [`Мне 20 лет`, `Я имею 20 лет`, `Я есть 20 лет`],
      c: 0,
      m: `Alter: Dativpronomen + Zahl + лет/года. мне = mir (Dativ von я).`
    },
    {
      q: `Wie sagt man: „Er ist 35 Jahre alt"?`,
      a: [`Ему 35 лет`, `Он 35 лет`, `Его 35 лет`],
      c: 0,
      m: `Alter: он → ему (Dativ): Ему 35 лет.`
    },
    {
      q: `Wie sagt man: „Sie ist 8 Jahre alt"?`,
      a: [`Ей 8 лет`, `Она 8 лет`, `Её 8 лет`],
      c: 0,
      m: `Alter: она → ей (Dativ): Ей 8 лет.`
    },
    // к + Dativ (Richtung zu Person)
    {
      q: `Wie sagt man: „Ich gehe zum Arzt"?`,
      a: [`Я иду к врачу`, `Я иду к врача`, `Я иду к врач`],
      c: 0,
      m: `к + Dativ für Richtung zu einer Person: врач → врачу.`
    },
    {
      q: `Wie sagt man: „Ich gehe zu meinem Freund"?`,
      a: [`Я иду к другу`, `Я иду к друга`, `Я иду к друге`],
      c: 0,
      m: `к + Dativ: друг → другу: Я иду к другу.`
    },
    {
      q: `Wie sagt man: „Ich gehe zu meiner Mama"?`,
      a: [`Я иду к маме`, `Я иду к мамы`, `Я иду к маму`],
      c: 0,
      m: `к + Dativ: мама → маме: Я иду к маме.`
    },
    // Demonstrativpronomen
    {
      q: `Welche Form passt zu стол (Tisch, maskulin)?`,
      a: [`этот стол`, `эта стол`, `это стол`],
      c: 0,
      m: `этот für maskuline Nomen: этот стол — dieser Tisch.`
    },
    {
      q: `Welche Form passt zu книга (Buch, feminin)?`,
      a: [`эта книга`, `этот книга`, `это книга`],
      c: 0,
      m: `эта für feminine Nomen: эта книга — dieses Buch.`
    },
    {
      q: `Welche Form passt zu письмо (Brief, Neutrum)?`,
      a: [`это письмо`, `этот письмо`, `эта письмо`],
      c: 0,
      m: `это für neutrale Nomen: это письмо — dieser Brief.`
    },
    {
      q: `Welche Form passt zu люди (Menschen, Plural)?`,
      a: [`эти люди`, `этот люди`, `эта люди`],
      c: 0,
      m: `эти für alle Pluralnomen: эти люди — diese Menschen.`
    },
  ]
}
