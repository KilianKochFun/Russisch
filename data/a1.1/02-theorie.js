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
  ]
}
