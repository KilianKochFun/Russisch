module.exports = {
  typ: `theorie`,
  titel: `Verbkonjugation Präsens`,
  karten: [
    {
      titel: `Das Verb — Infinitiv und Stamm`,
      erklaerung: `Russische Verben stehen im Wörterbuch im Infinitiv. Die meisten Infinitive enden auf -ть. Um zu konjugieren, entfernt man die Infinitivendung und hängt die Personalendung an den Stamm. Es gibt zwei große Konjugationsklassen: die 1. und die 2. Konjugation.`,
      beispiele: [
        `читать → читай- + Endung → я читаю`,
        `говорить → говор- + Endung → я говорю`,
        `работать → работай- + Endung → я работаю`,
      ],
      m: `Infinitiv endet auf -ть → Endung abschneiden → Stamm + Personalendung.`
    },
    {
      titel: `1. Konjugation — Typ читать`,
      erklaerung: `Die 1. Konjugation (auch е-Konjugation) umfasst die meisten Verben auf -ать und -ять. Die Endungen enthalten den Vokal е (außer in der 1. Person Singular und 3. Person Plural).`,
      tabelle: [
        [`Person`, `Endung`, `читать`, `работать`],
        [`я`, `-ю / -у`, `читаю`, `работаю`],
        [`ты`, `-ешь`, `читаешь`, `работаешь`],
        [`он/она`, `-ет`, `читает`, `работает`],
        [`мы`, `-ем`, `читаем`, `работаем`],
        [`вы`, `-ете`, `читаете`, `работаете`],
        [`они`, `-ют / -ут`, `читают`, `работают`],
      ],
      m: `Merkhilfe: -ю · -ешь · -ет · -ем · -ете · -ют — der е-Vokal zieht sich durch.`
    },
    {
      titel: `2. Konjugation — Typ говорить`,
      erklaerung: `Die 2. Konjugation (auch и-Konjugation) umfasst viele Verben auf -ить und -еть. Die Endungen enthalten den Vokal и (außer 1. Person Singular und 3. Person Plural). Achtung: In der 1. Person Singular gibt es oft Konsonantenwechsel.`,
      tabelle: [
        [`Person`, `Endung`, `говорить`, `учить`],
        [`я`, `-ю / -у`, `говорю`, `учу`],
        [`ты`, `-ишь`, `говоришь`, `учишь`],
        [`он/она`, `-ит`, `говорит`, `учит`],
        [`мы`, `-им`, `говорим`, `учим`],
        [`вы`, `-ите`, `говорите`, `учите`],
        [`они`, `-ят / -ат`, `говорят`, `учат`],
      ],
      m: `Merkhilfe: -ю · -ишь · -ит · -им · -ите · -ят — der и-Vokal zieht sich durch.`
    },
    {
      titel: `Wichtige unregelmäßige Verben`,
      erklaerung: `Einige sehr häufige Verben folgen keiner der beiden Konjugationen und müssen auswendig gelernt werden. Diese Verben kommen im Alltag ständig vor — sie lohnen sich.`,
      tabelle: [
        [`Person`, `быть (sein)`, `хотеть (wollen)`, `идти (gehen)`],
        [`я`, `(не используется)`, `хочу`, `иду`],
        [`ты`, `(не используется)`, `хочешь`, `идёшь`],
        [`он/ona`, `(не используется)`, `хочет`, `идёт`],
        [`мы`, `(не используется)`, `хотим`, `идём`],
        [`вы`, `(не используется)`, `хотите`, `идёте`],
        [`они`, `(не используется)`, `хотят`, `идут`],
      ],
      m: `быть hat im Präsens keine konjugierten Formen — das ist die Nullkopula! Erst Vergangenheit (был) und Zukunft (буду) haben Formen. хотеть ist gemischt: Sg. = 1. Konj.-Endungen, Pl. = 2. Konj.-Endungen.`
    },
  ]
}
