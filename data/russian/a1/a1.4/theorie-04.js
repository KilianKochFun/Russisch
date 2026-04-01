module.exports = {
  typ: `theorie`,
  titel: `Präteritum & Verbalaspekt`,
  karten: [
    {
      titel: `Präteritum bilden — -л/-ла/-ло/-ли`,
      erklaerung: `Das russische Präteritum ist einfach: Man entfernt die Infinitivendung -ть und hängt die Vergangenheitsendung an. Die Endung richtet sich NICHT nach der Person, sondern nach dem Geschlecht und der Zahl des Subjekts.`,
      tabelle: [
        [`Subjekt`, `Endung`, `читать`, `говорить`, `быть`],
        [`он / масkulines Subjekt`, `-л`, `читал`, `говорил`, `был`],
        [`она / feminines Subjekt`, `-ла`, `читала`, `говорила`, `была`],
        [`оно / neutrales Subjekt`, `-ло`, `читало`, `говорило`, `было`],
        [`они / Plural`, `-ли`, `читали`, `говорили`, `были`],
      ],
      m: `Merke: Im Präteritum ist die Person (ich/du/er...) unwichtig — entscheidend ist nur м./ж./n./Pl. des Subjekts. Я читал (Mann) · Я читала (Frau).`
    },
    {
      titel: `Unregelmäßige Präterita`,
      erklaerung: `Einige sehr häufige Verben bilden das Präteritum unregelmäßig — der Stamm ändert sich komplett. Diese muss man auswendig lernen:`,
      tabelle: [
        [`Infinitiv`, `м. (он)`, `ж. (она)`, `Pl. (они)`, `Bedeutung`],
        [`идти`, `шёл`, `шла`, `шли`, `gehen (einmalig)`],
        [`ехать`, `ехал`, `ехала`, `ехали`, `fahren (einmalig)`],
        [`мочь`, `мог`, `могла`, `могли`, `können`],
        [`помочь`, `помог`, `помогла`, `помогли`, `helfen`],
      ],
      beispiele: [
        `Он шёл домой. — Er ging nach Hause.`,
        `Она ехала в Москву. — Sie fuhr nach Moskau.`,
        `Они могли это сделать. — Sie konnten das tun.`,
      ],
      m: `идти → шёл (unregelmäßig!). ехать → ехал (regelmäßig). Diese vier unbedingt auswendig.`
    },
    {
      titel: `Verbalaspekt — imperfektiv vs. perfektiv`,
      erklaerung: `Jedes russische Verb existiert in zwei Aspekten: imperfektiv (незавершённый, НСВ) beschreibt Prozess, Dauer oder Wiederholung. Perfektiv (завершённый, СВ) beschreibt eine abgeschlossene, einmalige Handlung mit Ergebnis. Im Deutschen gibt es das nicht — aber man kennt es als „ich habe gelesen" (Ergebnis) vs. „ich las" (Prozess).`,
      tabelle: [
        [`Imperfektiv (НСВ)`, `Perfektiv (СВ)`, `Bedeutung`],
        [`читать`, `прочитать`, `lesen / fertig gelesen haben`],
        [`писать`, `написать`, `schreiben / fertig geschrieben haben`],
        [`делать`, `сделать`, `machen / fertiggemacht haben`],
        [`говорить`, `сказать`, `sprechen / gesagt haben`],
        [`покупать`, `купить`, `kaufen / gekauft haben`],
      ],
      beispiele: [
        `Я читал книгу час. — Ich las das Buch eine Stunde lang. (Prozess)`,
        `Я прочитал книгу. — Ich habe das Buch fertig gelesen. (Ergebnis)`,
        `Он писал письмо. — Er schrieb einen Brief (war dabei).`,
        `Он написал письмо. — Er hat den Brief fertig geschrieben.`,
      ],
      m: `НСВ = Prozess/Dauer/Wiederholung. СВ = abgeschlossen/Ergebnis. Im Präteritum: НСВ → Endung -л/-ла. СВ → gleiche Endungen, aber anderer Stamm.`
    },
  ]
}
