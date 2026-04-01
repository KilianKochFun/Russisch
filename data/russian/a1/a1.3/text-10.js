module.exports = {
  typ: `text`,
  titel: `Lesetext: Familie Соколовых`,
  tts: true,
  inhalt: `Это семья Соколовых. У Андрея и Натальи есть двое детей: сын Миша и дочь Катя.

У Миши нет машины, но у него есть велосипед. Он едет на велосипеде каждый день. У Кати нет велосипеда, но у неё есть красивая кошка. Кошку зовут Мурка.

Наталья любит готовить. Она готовит суп, мясо и салаты. Детям нравится её борщ — это их любимое блюдо. Андрею тоже нравится борщ.

Андрей работает в банке. Его коллегам нравится работать с ним. Каждую неделю он дарит жене цветы — Наталье нравятся розы.

В этом году семья едет на море. Детям нравится плавать. Родителям нравится отдыхать вместе.`,
  fragen: [
    {
      q: `„У Миши нет машины." — Welchen Kasus hat „машины" hier?`,
      a: [`Akkusativ`, `Genitiv nach нет`, `Nominativ`],
      c: 1,
      m: `нет + Genitiv: машина → машины (Genitiv Singular Feminin: -а → -ы). У него нет машины = Er hat kein Auto.`
    },
    {
      q: `„Детям нравится её борщ." — Welchen Kasus hat „детям"?`,
      a: [`Nominativ`, `Akkusativ`, `Dativ`],
      c: 2,
      m: `нравиться + Dativ: дети → детям (Dativ Plural). Den Kindern gefällt ihr Borschtsch.`
    },
    {
      q: `„Наталье нравятся розы." — Warum нравятся (Plural)?`,
      a: [`Weil Наталья Plural ist`, `Weil розы das Subjekt ist (Plural)`, `Fehler im Text`],
      c: 1,
      m: `нравиться richtet sich nach dem Subjekt (das Gefallende): розы = Plural → нравятся. Наталье steht im Dativ.`
    },
  ]
}
