module.exports = {
  typ: `text`,
  titel: `Меня зовут Анна`,
  tts: true,
  inhalt: `Меня зовут Анна. Я студентка. Я живу в Берлине, но я из России. Я говорю по-русски и по-немецки. Мой друг — Борис. Он из Германии. Борис студент. Мы вместе учимся в университете.`,
  fragen: [
    {
      q: `Wo lebt Anna?`,
      a: [`In Russland`, `In Berlin`, `In Österreich`],
      c: 1,
      m: `Я живу в Берлине = Ich lebe in Berlin. в + Präpositiv = in (Ort)`
    },
    {
      q: `Welche Sprachen spricht Anna?`,
      a: [`Russisch und Englisch`, `Deutsch und Französisch`, `Russisch und Deutsch`],
      c: 2,
      m: `по-русски = auf Russisch, по-немецки = auf Deutsch`
    },
    {
      q: `Was ist Boris?`,
      a: [`Lehrer`, `Student`, `Arzt`],
      c: 1,
      m: `Борис студент — kein „ist" nötig: Nullkopula im Präsens!`
    },
  ]
}
