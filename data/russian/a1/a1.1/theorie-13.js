module.exports = {
  typ: `theorie`,
  titel: `Verbkonjugation — 1. Konjugation`,
  karten: [
    {
      titel: `Wie funktioniert Konjugation?`,
      erklaerung: `Russische Verben stehen im Wörterbuch immer im Infinitiv — erkennbar an der Endung -ть. Um zu konjugieren, trennt man die Infinitivendung ab und hängt die Personalendung an den Stamm. Es gibt zwei große Gruppen: die 1. und die 2. Konjugation. Die erste Konjugation erkennst du an der Endung -ать oder -ять — und an den е-Endungen in der Konjugation.`,
      beispiele: [
        `читать → Stamm читай- → я читаю, ты читаешь ...`,
        `работать → Stamm работай- → я работаю, ты работаешь ...`,
        `знать → Stamm зна- → я знаю, ты знаешь ...`,
      ],
      m: `Infinitiv endet auf -ть → -ть abschneiden → Stamm + Personalendung. Merke: alle Endungen der 1.Konj. haben den Vokal е (außer я und они).`
    },
    {
      titel: `1. Konjugation — Endungen`,
      erklaerung: `Alle Verben der 1. Konjugation folgen demselben Muster. Der Vokal е zieht sich durch alle Formen — nur bei ich (-ю/-у) und sie (Pl.) (-ют/-ут) ist er nicht sichtbar. Typische Verben: читать, работать, знать, слушать, думать, понимать, ждать.`,
      tabelle: [
        [`Person`, `Endung`, `читать`, `работать`, `знать`],
        [`я`, `-ю`, `читаю`, `работаю`, `знаю`],
        [`ты`, `-ешь`, `читаешь`, `работаешь`, `знаешь`],
        [`он/она`, `-ет`, `читает`, `работает`, `знает`],
        [`мы`, `-ем`, `читаем`, `работаем`, `знаем`],
        [`вы`, `-ете`, `читаете`, `работаете`, `знаете`],
        [`они`, `-ют`, `читают`, `работают`, `знают`],
      ],
      m: `Merkhilfe für die Endungen: -ю · -ешь · -ет · -ем · -ете · -ют. Der е-Vokal ist das Erkennungszeichen der 1. Konjugation.`
    },
    {
      titel: `Konsonantenwechsel: писать (Sonderfall 1. Konjugation)`,
      erklaerung: `Einige 1.Konjugation-Verben haben in der 1. Person Singular (я) einen Konsonantenwechsel im Stammauslaut. Ab der 2. Person (ты) ist der Stamm wieder normal. Dieser Wechsel betrifft NUR die я-Form — das macht ihn leicht zu merken.`,
      tabelle: [
        [`Person`, `писать (с→ш)`, `Endung`],
        [`я`, `пишу`, `-у (nach ш)`],
        [`ты`, `пишешь`, `-ешь (normal)`],
        [`он/она`, `пишет`, `-ет (normal)`],
        [`мы`, `пишем`, `-ем (normal)`],
        [`вы`, `пишете`, `-ете (normal)`],
        [`они`, `пишут`, `-ут (normal)`],
      ],
      beispiele: [
        `Я пишу письмо. — Ich schreibe einen Brief.`,
        `Ты пишешь хорошо. — Du schreibst gut.`,
      ],
      m: `Konsonantenwechsel nur bei я: писать с→ш. Ab ты: normaler Stamm пиш-. Weitere 1.Konj.-Wechsel lernst du später.`
    },
  ]
}
