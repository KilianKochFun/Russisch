module.exports = {
  typ: `theorie`,
  titel: `Personalpronomen & Nullkopula`,
  karten: [
    {
      titel: `Die Personalpronomen`,
      erklaerung: `Im Russischen gibt es 7 Personalpronomen. Sie entsprechen genau den deutschen ich/du/er/sie/es/wir/ihr/Sie/sie — nur ohne grammatisches Geschlecht in der 1./2. Person.`,
      tabelle: [
        [`Pronomen`, `Deutsch`, `Beispiel`],
        [`я`, `ich`, `Я студент. — Ich bin Student.`],
        [`ты`, `du`, `Ты врач? — Bist du Arzt?`],
        [`он / она / оно`, `er / sie / es`, `Он дома. — Er ist zu Hause.`],
        [`мы`, `wir`, `Мы здесь. — Wir sind hier.`],
        [`вы`, `ihr / Sie (formell)`, `Вы говорите по-русски? — Sprechen Sie Russisch?`],
        [`они`, `sie (Plural)`, `Они студенты. — Sie sind Studenten.`],
      ],
      m: `он/она/оно richtet sich nach dem grammatischen Geschlecht des Nomens — nicht nach der Person.`
    },
    {
      titel: `Die Nullkopula — kein „bin/ist/sind"`,
      erklaerung: `Im Deutschen braucht man immer ein Verb: „Ich bin Arzt." Im Russischen entfällt das Verb быть (sein) im Präsens vollständig. Das nennt man die Nullkopula. Der Satz funktioniert trotzdem einwandfrei — Subjekt und Prädikat stehen einfach nebeneinander.`,
      beispiele: [
        `Я студент. — Ich bin Student.`,
        `Она врач. — Sie ist Ärztin.`,
        `Это аптека. — Das ist eine Apotheke.`,
        `Мы в Москве. — Wir sind in Moskau.`,
      ],
      m: `быть (sein) taucht erst im Präteritum (был/была) und Futur (буду) wieder auf. Im Präsens: weglassen.`
    },
    {
      titel: `Это — „das ist / das sind"`,
      erklaerung: `Это ist ein unveränderliches Wort und bedeutet „das ist" oder „das sind" — unabhängig vom Geschlecht oder der Zahl des folgenden Nomens. Es ist nicht dasselbe wie das Adjektiv этот/эта/это (dieser/diese/dieses).`,
      beispiele: [
        `Это банк. — Das ist eine Bank.`,
        `Это аптека. — Das ist eine Apotheke.`,
        `Это студенты. — Das sind Studenten.`,
        `Что это? — Was ist das?`,
        `Кто это? — Wer ist das?`,
      ],
      m: `Что это? = für Sachen · Кто это? = für Personen. Это bleibt immer gleich — nie этот/эта.`
    },
    {
      titel: `Grammatisches Genus — Endungsregeln`,
      erklaerung: `Jedes russische Nomen hat ein grammatisches Geschlecht (Genus): männlich, weiblich oder sächlich. Das Genus ist wichtig, weil Adjektive und Possessivpronomen sich danach richten. Meistens erkennt man es an der Endung des Nomens.`,
      tabelle: [
        [`Genus`, `Typische Endung`, `Beispiele`],
        [`männlich (м.р.)`, `Konsonant`, `стол, брат, врач, дом, город`],
        [`weiblich (ж.р.)`, `-а / -я`, `книга, сестра, аптека, семья`],
        [`sächlich (с.р.)`, `-о / -е`, `окно, письмо, море, здание`],
        [`Ausnahme ж.р.`, `-ь`, `ночь, дверь, мать, площадь`],
        [`Ausnahme м.р.`, `-ь`, `день, путь, рубль`],
      ],
      m: `Nomen auf -ь können м.р. oder ж.р. sein — muss man auswendig lernen. Pronomen: он/она/оно richtet sich nach dem Genus des Nomens.`
    },
    {
      titel: `Possessivpronomen — мой, твой, его, её, наш, ваш`,
      erklaerung: `Possessivpronomen zeigen Zugehörigkeit (mein, dein, sein, ihr). Sie richten sich nach dem Genus des Nomens, das sie begleiten — nicht nach dem Besitzer. Die Formen его und её sind unveränderlich: sie passen zu allen Genera.`,
      tabelle: [
        [`Besitzer`, `м.р. (Konsonant)`, `ж.р. (-а/-я)`, `с.р. (-о/-е)`],
        [`ich — мой`, `мой брат`, `моя сестра`, `моё окно`],
        [`du — твой`, `твой друг`, `твоя книга`, `твоё слово`],
        [`er — его`, `его брат`, `его сестра`, `его окно`],
        [`sie — её`, `её брат`, `её сестра`, `её окно`],
        [`wir — наш`, `наш дом`, `наша семья`, `наше место`],
        [`ihr/Sie — ваш`, `ваш паспорт`, `ваша виза`, `ваше фото`],
      ],
      m: `его und её sind unveränderlich — kein Genusunterschied! его язык, его книга, его окно — immer его. Endungen мой/наш: -й (м.), -я/-а (ж.), -ё/-е (с.).`
    },
  ]
}
