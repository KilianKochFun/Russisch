module.exports = {
  typ: `dialog`,
  titel: `Erste Begegnung`,
  tts: true,
  zeilen: [
    { sprecher: `Анна`, text: `Привет! Меня зовут Анна. Я студентка. А ты?` },
    { sprecher: `Борис`, text: `Привет, Анна! Я Борис. Я архитектор.` },
    { sprecher: `Анна`, text: `Откуда ты, Борис?` },
    { sprecher: `Борис`, text: `Я из России. Я живу в Москве. А ты?` },
    { sprecher: `Анна`, text: `Я немка. Я живу в Берлине. Это далеко!` },
    { sprecher: `Борис`, text: `Да! Ты говоришь по-русски?` },
    { sprecher: `Анна`, text: `Немного. Я учу русский язык.` },
    { sprecher: `Борис`, text: `Отлично! Твой русский уже хороший.` },
  ],
  fragen: [
    {
      q: `Was ist Anna von Beruf?`,
      a: [`Architektin`, `Studentin`, `Ärztin`],
      c: 1,
      m: `Анна говорит: „Я студентка." — студентка = Studentin (weibliche Form von студент).`
    },
    {
      q: `Woher kommt Boris?`,
      a: [`aus Deutschland`, `aus Berlin`, `aus Russland`],
      c: 2,
      m: `Борис говорит: „Я из России." — из = aus; России = Genitiv von Россия.`
    },
    {
      q: `Was macht Anna gerade (lernt sie)?`,
      a: [`Sie lernt Englisch`, `Sie lernt Russisch`, `Sie lebt in Moskau`],
      c: 1,
      m: `Анна говорит: „Я учу русский язык." — учу = ich lerne; язык = Sprache.`
    },
  ]
}
