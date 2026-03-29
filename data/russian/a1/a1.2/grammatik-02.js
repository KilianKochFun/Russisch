module.exports = {
  typ: `grammatik`,
  titel: `Akkusativ — Objekte`,
  fragen: [
    // --- Femininum: -а/-я → -у/-ю ---
    {
      q: `„Ich lese ein Buch." — книга im Akkusativ?`,
      a: [`книга`, `книги`, `книгу`],
      c: 2,
      m: `Feminine Nomen auf -а bekommen im Akkusativ die Endung -у: книга → книгу.`
    },
    {
      q: `„Er liebt seine Schwester." — сестра im Akkusativ?`,
      a: [`сестру`, `сестры`, `сестра`],
      c: 0,
      m: `Femininum auf -а → Akkusativ auf -у: сестра → сестру.`
    },
    {
      q: `„Ich kaufe eine Zeitung." — газета im Akkusativ?`,
      a: [`газеты`, `газету`, `газета`],
      c: 1,
      m: `газета ist feminin auf -а, Akkusativ: газету.`
    },
    {
      q: `„Er trinkt Wasser." — вода im Akkusativ?`,
      a: [`воду`, `воды`, `вода`],
      c: 0,
      m: `вода (Wasser) → Akkusativ: воду. Alle Feminina auf -а enden im Akkusativ auf -у.`
    },
    {
      q: `„Sie zeigt das Zimmer." — комната im Akkusativ?`,
      a: [`комнаты`, `комната`, `комнату`],
      c: 2,
      m: `комната → Akkusativ: комнату. Endung -а wird zu -у.`
    },
    {
      q: `„Ich sehe den Hund." — собака im Akkusativ?`,
      a: [`собаку`, `собаки`, `собака`],
      c: 0,
      m: `собака (Hund/Hündin) ist feminin: Akkusativ собаку.`
    },
    {
      q: `„Er kauft ein Auto." — машина im Akkusativ?`,
      a: [`машины`, `машину`, `машина`],
      c: 1,
      m: `машина → Akkusativ: машину. Typische Femininendung -а → -у.`
    },
    {
      q: `„Sie liebt die Schule." — школа im Akkusativ?`,
      a: [`школа`, `школе`, `школу`],
      c: 2,
      m: `школа → Akkusativ: школу. Merke: -а wird zu -у.`
    },
    // --- Maskulinum belebt: +а ---
    {
      q: `„Ich sehe den Bruder." — брат im Akkusativ?`,
      a: [`брата`, `брат`, `братов`],
      c: 0,
      m: `Belebte maskuline Nomen bekommen im Akkusativ die Endung -а: брат → брата.`
    },
    {
      q: `„Sie kennt den Studenten." — студент im Akkusativ?`,
      a: [`студент`, `студентов`, `студента`],
      c: 2,
      m: `Belebtes Maskulinum: студент → студента. Endung -а anhängen.`
    },
    {
      q: `„Er ruft den Vater." — отец im Akkusativ?`,
      a: [`отца`, `отцу`, `отец`],
      c: 0,
      m: `отец (Vater) → Akkusativ: отца. Bei belebten Maskulina auf -ец fällt das -е- aus: отец → отца.`
    },
    {
      q: `„Ich warte auf den Freund." — друг im Akkusativ?`,
      a: [`другу`, `друга`, `друг`],
      c: 1,
      m: `Belebtes Maskulinum: друг → друга. Endung -а anhängen.`
    },
    // --- Maskulinum unbelebt: unverändert ---
    {
      q: `„Er sieht den Tisch." — стол im Akkusativ?`,
      a: [`стола`, `стол`, `столу`],
      c: 1,
      m: `Unbelebte maskuline Nomen bleiben im Akkusativ unverändert: стол bleibt стол.`
    },
    {
      q: `„Sie kauft ein Haus." — дом im Akkusativ?`,
      a: [`дом`, `дома`, `дому`],
      c: 0,
      m: `Unbelebtes Maskulinum: дом bleibt im Akkusativ дом.`
    },
    {
      q: `„Ich kenne die Stadt." — город im Akkusativ?`,
      a: [`города`, `городу`, `город`],
      c: 2,
      m: `город (Stadt) ist unbelebt und maskulin → Akkusativ unverändert: город.`
    },
    {
      q: `„Er liest eine Zeitschrift." — журнал im Akkusativ?`,
      a: [`журналу`, `журнала`, `журнал`],
      c: 2,
      m: `Unbelebtes Maskulinum: журнал bleibt im Akkusativ журнал.`
    },
    {
      q: `„Sie trinkt Tee." — чай im Akkusativ?`,
      a: [`чай`, `чаю`, `чая`],
      c: 0,
      m: `чай (Tee) ist unbelebt und maskulin → Akkusativ: чай (unverändert).`
    },
    {
      q: `„Er isst Brot." — хлеб im Akkusativ?`,
      a: [`хлеба`, `хлебу`, `хлеб`],
      c: 2,
      m: `Unbelebtes Maskulinum: хлеб bleibt im Akkusativ хлеб.`
    },
    // --- Neutrum: unverändert ---
    {
      q: `„Ich sehe das Fenster." — окно im Akkusativ?`,
      a: [`окна`, `окну`, `окно`],
      c: 2,
      m: `Sächliche Nomen bleiben im Akkusativ unverändert: окно bleibt окно.`
    },
    {
      q: `„Er schreibt einen Brief." — письмо im Akkusativ?`,
      a: [`письму`, `письмо`, `письма`],
      c: 1,
      m: `Neutrum письмо bleibt im Akkusativ письмо.`
    },
    // --- Verben mit Akkusativ ---
    {
      q: `Welches Verb fordert den Akkusativ? „___ книгу" (lesen)`,
      a: [`читать`, `идти`, `говорить`],
      c: 0,
      m: `читать (lesen) fordert den Akkusativ: Я читаю книгу. идти und говорить verlangen keinen direkten Akkusativ.`
    },
    {
      q: `„Я вижу ___" — Welche Form ist richtig? (сестра)`,
      a: [`сестра`, `сестру`, `сестры`],
      c: 1,
      m: `видеть (sehen) fordert den Akkusativ: Я вижу сестру. Femininum -а → -у.`
    },
    {
      q: `„Он любит ___" — Welche Form ist richtig? (музыка)`,
      a: [`музыку`, `музыка`, `музыки`],
      c: 0,
      m: `любить (lieben) fordert den Akkusativ: Он любит музыку. музыка → музыку.`
    },
    {
      q: `„Я знаю ___" — Welche Form ist richtig? (город)`,
      a: [`города`, `городу`, `город`],
      c: 2,
      m: `знать (kennen) fordert den Akkusativ: Я знаю город. Unbelebtes Maskulinum bleibt unverändert.`
    },
    {
      q: `„Она ждёт ___" — Welche Form ist richtig? (друг)`,
      a: [`друг`, `другу`, `друга`],
      c: 2,
      m: `ждать (warten auf) fordert den Akkusativ: Она ждёт друга. Belebtes Maskulinum: друг → друга.`
    },
    // --- Satzebene & Übersetzung ---
    {
      q: `„Я читаю книгу" — warum steht книгу und nicht книга?`,
      a: [`книга ist das Subjekt`, `читать fordert den Akkusativ, Femininum -а → -у`, `книга ist im Dativ`],
      c: 1,
      m: `читать ist ein transitives Verb und fordert den Akkusativ. Feminines книга wird zu книгу.`
    },
    {
      q: `„Er sieht den Bruder." — Wie lautet die russische Übersetzung?`,
      a: [`Он видит брат.`, `Он видит брата.`, `Он видит братом.`],
      c: 1,
      m: `видеть fordert den Akkusativ. брат ist ein belebtes Maskulinum → Akkusativ: брата.`
    },
    {
      q: `„Ich kaufe Milch." — молоко im Akkusativ?`,
      a: [`молоко`, `молока`, `молоку`],
      c: 0,
      m: `молоко ist Neutrum und bleibt im Akkusativ unverändert: Я покупаю молоко.`
    },
  ]
}
