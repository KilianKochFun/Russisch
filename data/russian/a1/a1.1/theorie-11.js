module.exports = {
  typ: `theorie`,
  titel: `Fragewörter & der Präpositiv`,
  karten: [
    {
      titel: `Fragewörter`,
      erklaerung: `Fragewörter stehen immer am Satzanfang und verändern die Wortstellung nicht weiter — im Russischen gibt es keine Verb-Zweitstellung wie im Deutschen. Das Fragewort bestimmt, welche Art von Information erwartet wird.`,
      tabelle: [
        [`Fragewort`, `Deutsch`, `Beispiel`],
        [`кто`, `wer (Personen)`, `Кто это? — Wer ist das?`],
        [`что`, `was (Sachen)`, `Что это? — Was ist das?`],
        [`где`, `wo (Ort, statisch)`, `Где ты живёшь? — Wo wohnst du?`],
        [`куда`, `wohin (Richtung)`, `Куда ты? — Wohin (gehst du)?`],
        [`когда`, `wann`, `Когда ты придёшь? — Wann kommst du?`],
        [`как`, `wie`, `Как тебя зовут? — Wie heißt du?`],
        [`почему`, `warum`, `Почему ты здесь? — Warum bist du hier?`],
        [`сколько`, `wie viel(e)`, `Сколько стоит? — Was kostet das?`],
      ],
      m: `где = statischer Ort (wo?) · куда = Bewegungsrichtung (wohin?) — nie verwechseln!`
    },
    {
      titel: `Der Präpositiv — 6. Kasus`,
      erklaerung: `Der Präpositiv (russisch: предложный падеж) ist der 6. und letzte Kasus im Russischen. Sein Name sagt alles: Er steht immer mit einer Präposition — nie ohne. Er wird hauptsächlich für Ortsangaben (wo?) und Themen des Denkens/Sprechens (worüber?) verwendet.`,
      tabelle: [
        [`Präposition`, `Bedeutung`, `Kasus`, `Beispiel`],
        [`в`, `in (Ort)`, `Präpositiv`, `в городе — in der Stadt`],
        [`на`, `auf/an/bei (Ort)`, `Präpositiv`, `на работе — bei der Arbeit`],
        [`о / об`, `über (Thema)`, `Präpositiv`, `о книге — über das Buch`],
      ],
      m: `в und на mit Präpositiv = WO? (statisch). в/на + Akkusativ = WOHIN? (Bewegung) — das kommt später.`
    },
    {
      titel: `Präpositiv-Bildung: Endung -е`,
      erklaerung: `Um den Präpositiv zu bilden, hängt man an den meisten Nomen die Endung -е an. Die Grundregel: Endung des Nomens entfernen (bei -а/-о/-е) und -е anhängen, oder bei Konsonant-Endung direkt -е dranhängen. Nomen auf -ия oder -ие haben die Endung -ии.`,
      tabelle: [
        [`Nominativ`, `Präpositiv`, `Präpositiv-Satz`],
        [`город (м.р.)`, `городе`, `в городе — in der Stadt`],
        [`аптека (ж.р.)`, `аптеке`, `в аптеке — in der Apotheke`],
        [`окно (с.р.)`, `окне`, `на окне — auf dem Fenster`],
        [`библиотека (ж.р.)`, `библиотеке`, `в библиотеке — in der Bibliothek`],
        [`станция (ж.р.)`, `станции`, `на станции — an der Station`],
        [`здание (с.р.)`, `здании`, `в здании — in dem Gebäude`],
      ],
      m: `Standard: Endung → -е. Ausnahme: Nomen auf -ия/-ие → -ии (nicht -ие!).`
    },
    {
      titel: `в vs. на — welche Präposition wann?`,
      erklaerung: `Sowohl в als auch на können mit dem Präpositiv Ort angeben. Die Wahl hängt vom Ort ab — es gibt keine absolut logische Regel, man muss es mit den häufigsten Orten lernen. Grob: в für geschlossene Räume/Orte, на für offene Flächen und bestimmte feste Ausdrücke.`,
      tabelle: [
        [`в + Präpositiv`, `на + Präpositiv`],
        [`в городе — in der Stadt`, `на улице — auf der Straße`],
        [`в библиотеке — in der Bibliothek`, `на работе — bei der Arbeit`],
        [`в аптеке — in der Apotheke`, `на вокзале — auf dem Bahnhof`],
        [`в школе — in der Schule`, `на уроке — im Unterricht`],
        [`в Москве — in Moskau`, `на концерте — beim Konzert`],
      ],
      m: `на вокзале, на работе, на улице, на уроке — diese 4 Ausdrücke mit на auswendig lernen.`
    },
    {
      titel: `у + Genitiv — Nähe und Lage`,
      erklaerung: `у + Genitiv drückt räumliche Nähe aus: „bei, neben, an, am". Der Genitiv der Nomen folgt denselben Regeln wie nach нет: м.р. → + -а, ж.р. -а → -ы, с.р. -о → -а. Diese Konstruktion kennt man bereits von у меня есть (= ich habe) — hier dieselbe Präposition für Ortsangaben.`,
      tabelle: [
        [`Nominativ`, `Genitiv`, `Ausdruck`, `Bedeutung`],
        [`вход (м.р.)`, `входа`, `у входа`, `am Eingang`],
        [`банк (м.р.)`, `банка`, `у банка`, `bei der Bank`],
        [`окно (с.р.)`, `окна`, `у окна`, `am Fenster`],
        [`дверь (ж.р.)`, `двери`, `у двери`, `an der Tür`],
        [`остановка (ж.р.)`, `остановки`, `у остановки`, `an der Haltestelle`],
      ],
      m: `у + Genitiv = statisch (WO?). Nicht verwechseln mit в/на + Präpositiv (drinnen/drauf) — у betont Nähe von außen.`
    },
  ]
}
