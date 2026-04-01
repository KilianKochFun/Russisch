module.exports = {
  typ: `grammatik`,
  titel: `Grammatiktest A1 (25 Fragen)`,
  fragen: [
    // ── Nominativ & Genus ───────────────────────────────────────────────────
    {
      q: `„Это ___ автобус." — Welcher Artikel (Genus)?`,
      a: [`мой (maskulin)`, `моя (feminin)`, `моё (neutrum)`],
      c: 0,
      m: `авто́бус ist maskulin → мой авто́бус. Maskulina auf Konsonant: мой/твой/наш.`
    },
    {
      q: `Welche Form ist richtig: „Это ___ книга."?`,
      a: [`новый`, `новая`, `новое`],
      c: 1,
      m: `кни́га ist feminin → нова́я кни́га. Adjektive feminin Nominativ: -ая/-яя.`
    },
    // ── Akkusativ ───────────────────────────────────────────────────────────
    {
      q: `„Я вижу ___ (стол)." — Akkusativ von стол?`,
      a: [`стола`, `стол`, `столу`],
      c: 1,
      m: `стол (maskulin unbelebt) → Akkusativ = Nominativ: стол. Nur belebte Maskulina ändern sich im Akkusativ.`
    },
    {
      q: `„Я люблю ___." — Akkusativ von сестра?`,
      a: [`сестры`, `сестру`, `сестре`],
      c: 1,
      m: `сестра́ (feminin -а) → Akkusativ: -у → сестру́. Feminina -а/-я → Akkusativ -у/-ю.`
    },
    {
      q: `„Он видит ___." — Akkusativ von она (Personalpronomen)?`,
      a: [`ей`, `её`, `она`],
      c: 1,
      m: `она → Akkusativ = её. После Präposition: её → неё (н-Anlaut). Ich sehe sie = Он видит её.`
    },
    // ── Genitiv ─────────────────────────────────────────────────────────────
    {
      q: `„У меня нет ___ (брат)." — Genitiv von брат?`,
      a: [`брату`, `брата`, `братом`],
      c: 1,
      m: `нет + Genitiv: брат (maskulin auf Konsonant) → Genitiv -а: бра́та. У меня нет брата = Ich habe keinen Bruder.`
    },
    {
      q: `„Два ___ (час)." — Welche Form nach два?`,
      a: [`часов`, `часа`, `часы`],
      c: 1,
      m: `2/3/4 + Genitiv Singular: час → часа́. (5+ → часо́в = Genitiv Plural).`
    },
    {
      q: `„___ Кати нравится музыка." — Genitiv von Катя?`,
      a: [`Кате`, `Кати`, `Катей`],
      c: 1,
      m: `Катя (Name auf -я) → Genitiv: -и → Кати. у Кати = bei Katja / Katja hat...`
    },
    // ── Dativ ───────────────────────────────────────────────────────────────
    {
      q: `„___ нравится кино." — Dativ von я?`,
      a: [`меня`, `мне`, `мной`],
      c: 1,
      m: `я → Dativ = мне. нравиться + Dativ: Мне нравится кино = Mir gefällt das Kino.`
    },
    {
      q: `„Я дал книгу ___ (подруга)." — Dativ von подруга?`,
      a: [`подруги`, `подруге`, `подругу`],
      c: 1,
      m: `подру́га (feminin -а) → Dativ: -е → подру́ге. Ich gab der Freundin das Buch.`
    },
    {
      q: `„___ лет Андрею?" — Was fehlt?`,
      a: [`Как`, `Сколько`, `Чей`],
      c: 1,
      m: `Ско́лько лет + Dativ = Wie alt ist...? Сколько лет Андрею? = Wie alt ist Andrei? (лет = Genitiv Plural von год).`
    },
    // ── Instrumental ────────────────────────────────────────────────────────
    {
      q: `„Она работает ___." — Instrumental von учитель?`,
      a: [`учителя`, `учителем`, `учителю`],
      c: 1,
      m: `рабо́тать + Instrumental (Berufsangabe): учи́тель → учи́телем. Она работает учителем = Sie arbeitet als Lehrerin.`
    },
    {
      q: `„Я еду ___ (автобус)." — Instrumental von автобус?`,
      a: [`автобусом`, `автобуса`, `на автобусе`],
      c: 2,
      m: `Transportmittel: ехать на + Präpositiv: на авто́бусе. (Nicht Instrumental hier — ехать на чём).`
    },
    {
      q: `„Он живёт ___ (я)." — „mit mir" auf Russisch?`,
      a: [`со мной`, `мне`, `меня`],
      c: 0,
      m: `с + Instrumental = mit. я → Instrumental = мной. со мной (со vor мн-Anlaut). Он живёт со мной.`
    },
    // ── Präteritum & Aspekt ─────────────────────────────────────────────────
    {
      q: `„Маша ___ (читать, imperfektiv) книгу весь вечер." — Präteritum feminin?`,
      a: [`читала`, `читал`, `читали`],
      c: 0,
      m: `читать → Präteritum feminin: читала. -л → -ла (feminin). Весь вечер = Prozess → imperfektiv.`
    },
    {
      q: `„Иван ___ (прочитать) книгу." — Was zeigt прочитал?`,
      a: [`Imperfektiv — Prozess`, `Perfektiv — Ergebnis: Buch fertig gelesen`, `Futur`],
      c: 1,
      m: `прочита́ть (perfektiv) → прочита́л = hat das Buch fertig gelesen. Ergebnis abgeschlossen.`
    },
    {
      q: `„Вчера они ___ в кино." — Präteritum Plural von идти (perfektiv пойти)?`,
      a: [`пошли`, `пошёл`, `шли`],
      c: 0,
      m: `пойти́ (perfektiv) → Präteritum Plural: пошли́. вчера + Ergebnis → perfektiv. Они пошли = Sie gingen hin.`
    },
    // ── Futur ───────────────────────────────────────────────────────────────
    {
      q: `„Завтра я ___ читать." — Futur imperfektiv, 1. Sg.?`,
      a: [`читаю`, `буду читать`, `читал`],
      c: 1,
      m: `Futur imperfektiv = буду + Infinitiv. Я буду читать = Ich werde lesen (Prozess, andauernd).`
    },
    {
      q: `„Я ___ письмо." — Futur perfektiv von написать, 1. Sg.?`,
      a: [`буду писать`, `напишу`, `написал`],
      c: 1,
      m: `написа́ть (perfektiv) → Futur: напишу́. Perfektive Verben bilden Futur durch Konjugation (kein буду).`
    },
    // ── Imperativ & Modalwörter ─────────────────────────────────────────────
    {
      q: `„___ (говорить) медленнее, пожалуйста!" — Imperativ, 2. Sg.?`,
      a: [`Говори`, `Говорит`, `Говоришь`],
      c: 0,
      m: `Imperativ Sg.: Stamm + -и (говор- → говори́). Говори медленнее = Sprich langsamer.`
    },
    {
      q: `„___ курить здесь." — Was passt: verboten zu rauchen?`,
      a: [`Можно`, `Нельзя`, `Должен`],
      c: 1,
      m: `нельзя́ + Infinitiv = es ist verboten/nicht möglich. Нельзя курить = Man darf nicht rauchen.`
    },
    // ── Bewegungsverben ─────────────────────────────────────────────────────
    {
      q: `„Каждый день она ___ на работу пешком." — Welches Verb?`,
      a: [`идёт`, `ходит`, `едет`],
      c: 1,
      m: `хо́дит = unidirektional imperfektiv (wiederholte Handlung). Каждый день = Gewohnheit → ходить. идёт wäre einmalig/gerade jetzt.`
    },
    {
      q: `„Сейчас он ___ в библиотеку." — Er ist gerade unterwegs, zu Fuß. Welches Verb?`,
      a: [`ходит`, `идёт`, `едет`],
      c: 1,
      m: `идёт = er geht gerade (einmalig, gerichtet, gerade jetzt). ходит = Gewohnheit. едет = fahren.`
    },
    // ── Demonstrativpronomen ────────────────────────────────────────────────
    {
      q: `„___ книга интересная." — „Diese" für feminin?`,
      a: [`этот`, `это`, `эта`],
      c: 2,
      m: `э́та = diese (feminin Nominativ). э́тот = maskulin. э́то = neutrum / allgemeines „das ist".`
    },
    {
      q: `„___ студенты учатся хорошо." — „Diese" für Plural?`,
      a: [`этот`, `эти`, `эта`],
      c: 1,
      m: `э́ти = diese (Plural, alle Genera). эти студенты = diese Studenten.`
    },
  ]
}
