module.exports = {
  typ: `grammatik`,
  titel: `Bewegungsverben & Wohin`,
  fragen: [
    // --- идти vs ходить ---
    {
      q: `Was bedeutet „идти" im Vergleich zu „ходить"?`,
      a: [`идти = einmalige Bewegung jetzt; ходить = wiederholt/allgemein`, `идти = mit Fahrzeug; ходить = zu Fuß`, `идти = Vergangenheit; ходить = Gegenwart`],
      c: 0,
      m: `идти beschreibt eine einmalige, gerade stattfindende Bewegung zu Fuß. ходить steht für regelmäßige oder allgemeine Bewegung.`
    },
    {
      q: `„Ich gehe gerade zur Schule." (einmalig, jetzt) — welches Verb?`,
      a: [`Я хожу в школу.`, `Я иду в школу.`, `Я еду в школу.`],
      c: 1,
      m: `идти für eine einmalige, laufende Bewegung zu Fuß: Я иду в школу.`
    },
    {
      q: `„Ich gehe jeden Tag zur Schule." (wiederholt) — welches Verb?`,
      a: [`Я иду в школу.`, `Я еду в школу.`, `Я хожу в школу.`],
      c: 2,
      m: `ходить für regelmäßige/wiederholte Bewegung: Я хожу в школу каждый день.`
    },
    {
      q: `„Er geht oft ins Theater." — welches Verb?`,
      a: [`Он идёт в театр.`, `Он ходит в театр.`, `Он едет в театр.`],
      c: 1,
      m: `„Oft" zeigt Wiederholung → ходить: Он ходит в театр.`
    },
    // --- ехать vs ездить ---
    {
      q: `Was bedeutet „ехать" im Vergleich zu „ездить"?`,
      a: [`ехать = zu Fuß; ездить = mit Fahrzeug`, `ехать = einmalige Fahrt jetzt; ездить = regelmäßige Fahrten`, `ехать = Zukunft; ездить = Vergangenheit`],
      c: 1,
      m: `ехать ist die Einweg-/Momentform für Fortbewegung mit einem Fahrzeug. ездить steht für wiederholte oder allgemeine Fahrten.`
    },
    {
      q: `„Der Bus fährt gerade in die Stadt." (einmalig, jetzt) — welches Verb?`,
      a: [`Автобус ездит в город.`, `Автобус едет в город.`, `Автобус идёт в город.`],
      c: 1,
      m: `ехать für eine laufende Fahrt: Автобус едет в город.`
    },
    {
      q: `„Er fährt jede Woche nach Moskau." (wiederholt) — welches Verb?`,
      a: [`Он ездит в Москву каждую неделю.`, `Он едет в Москву каждую неделю.`, `Он идёт в Москву каждую неделю.`],
      c: 0,
      m: `ездить für regelmäßige Fahrten: Он ездит в Москву каждую неделю.`
    },
    // --- Konjugation идти ---
    {
      q: `„Я ___ в школу." — идти, 1. Pers. Sg.`,
      a: [`иду`, `идёшь`, `идёт`],
      c: 0,
      m: `идти: я иду. Das Verb идти ist unregelmäßig.`
    },
    {
      q: `„Ты ___ домой." — идти, 2. Pers. Sg.`,
      a: [`идём`, `идёшь`, `иду`],
      c: 1,
      m: `идти: ты идёшь.`
    },
    {
      q: `„Он ___ в магазин." — идти, 3. Pers. Sg.`,
      a: [`идут`, `идёте`, `идёт`],
      c: 2,
      m: `идти: он/она идёт.`
    },
    {
      q: `„Мы ___ в парк." — идти, 1. Pers. Pl.`,
      a: [`идут`, `идёте`, `идём`],
      c: 2,
      m: `идти: мы идём.`
    },
    {
      q: `„Вы ___ на концерт." — идти, 2. Pers. Pl.`,
      a: [`идёте`, `идут`, `идём`],
      c: 0,
      m: `идти: вы идёте.`
    },
    {
      q: `„Они ___ в университет." — идти, 3. Pers. Pl.`,
      a: [`идёт`, `идём`, `идут`],
      c: 2,
      m: `идти: они идут.`
    },
    // --- Konjugation ехать ---
    {
      q: `„Я ___ в Москву." — ехать, 1. Pers. Sg.`,
      a: [`едешь`, `еду`, `едет`],
      c: 1,
      m: `ехать: я еду.`
    },
    {
      q: `„Ты ___ на работу." — ехать, 2. Pers. Sg.`,
      a: [`едем`, `едешь`, `едут`],
      c: 1,
      m: `ехать: ты едешь.`
    },
    {
      q: `„Она ___ в аэропорт." — ехать, 3. Pers. Sg.`,
      a: [`едешь`, `едут`, `едет`],
      c: 2,
      m: `ехать: он/она едет.`
    },
    {
      q: `„Мы ___ в деревню." — ехать, 1. Pers. Pl.`,
      a: [`едем`, `едете`, `едут`],
      c: 0,
      m: `ехать: мы едем.`
    },
    // --- Wohin = в/на + Akkusativ ---
    {
      q: `„Wohin gehst du?" — „Ich gehe in die Schule." Welche Präposition + Form?`,
      a: [`в школе`, `в школу`, `на школу`],
      c: 1,
      m: `Wohin = в + Akkusativ: в школу. школа → школу.`
    },
    {
      q: `„Ich gehe in den Laden." — Welche Form?`,
      a: [`в магазин`, `в магазине`, `на магазин`],
      c: 0,
      m: `Wohin = в + Akkusativ: в магазин (unbelebtes Maskulinum, unverändert).`
    },
    {
      q: `„Er fährt ins Theater." — Welche Form?`,
      a: [`в театре`, `в театр`, `на театр`],
      c: 1,
      m: `Wohin = в + Akkusativ: в театр.`
    },
    {
      q: `„Sie geht zur Arbeit." — Welche Form?`,
      a: [`в работу`, `на работе`, `на работу`],
      c: 2,
      m: `Arbeit/Arbeitsplatz verwendet на: на работу (Akkusativ). Merke: на работу — auf die Arbeit.`
    },
    {
      q: `„Wir fahren auf den Markt." — Welche Form?`,
      a: [`на рынке`, `на рынок`, `в рынок`],
      c: 1,
      m: `рынок (Markt) verwendet на: на рынок (Akkusativ).`
    },
    {
      q: `„Sie geht nach Hause." — Wie sagt man das auf Russisch?`,
      a: [`в дом`, `домой`, `на дом`],
      c: 1,
      m: `Nach Hause = домой. Das ist ein eigenes Adverb, keine Präposition + Nomen.`
    },
    // --- Wo vs Wohin ---
    {
      q: `Was ist der Unterschied zwischen „в школе" und „в школу"?`,
      a: [`в школе = wohin (Akkusativ); в школу = wo (Präpositiv)`, `в школе = wo (Präpositiv); в школу = wohin (Akkusativ)`, `Beide bedeuten dasselbe`],
      c: 1,
      m: `Wo? = Präpositiv: в школе (in der Schule). Wohin? = Akkusativ: в школу (in die Schule).`
    },
    {
      q: `„Она на работе." — Was bedeutet das?`,
      a: [`Sie geht zur Arbeit.`, `Sie ist auf der Arbeit (gerade dort).`, `Sie fährt von der Arbeit.`],
      c: 1,
      m: `на работе = Präpositiv → Wo? Sie ist bei/auf der Arbeit. Wohin? wäre на работу.`
    },
    // --- Woher = из/с + Genitiv ---
    {
      q: `„Er kommt aus der Schule." — Welche Form?`,
      a: [`из школы`, `из школу`, `с школы`],
      c: 0,
      m: `Woher aus geschlossenen Räumen/Städten = из + Genitiv: из школы (школа → школы).`
    },
    {
      q: `„Sie kommt von der Arbeit." — Welche Form?`,
      a: [`из работы`, `с работы`, `на работы`],
      c: 1,
      m: `Woher von Flächen/на-Orten = с + Genitiv: с работы. Merke: на работу → с работы (Gegenpaar).`
    },
    // --- пойти / поехать ---
    {
      q: `Was bedeutet „пойти" im Unterschied zu „идти"?`,
      a: [`пойти = perfektiv, bedeutet losziehen/sich auf den Weg machen`, `пойти = imperfektiv, beschreibt wiederholte Bewegung`, `пойти = mit Fahrzeug fahren`],
      c: 0,
      m: `пойти ist die perfektive Form von идти und bedeutet: sich einmal auf den Weg machen, losgehen. Я пошёл — ich bin losgegangen.`
    },
  ]
}
