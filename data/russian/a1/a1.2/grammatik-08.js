module.exports = {
  typ: `grammatik`,
  titel: `Personalpronomen im Akkusativ`,
  fragen: [
    {
      q: `„Ich sehe dich." — ты im Akkusativ?`,
      a: [`тебе`, `тебя`, `тебём`],
      c: 1,
      m: `ты → тебя im Akkusativ. Я вижу тебя. — Ich sehe dich.`
    },
    {
      q: `„Er wartet auf mich." — я im Akkusativ?`,
      a: [`мне`, `мной`, `меня`],
      c: 2,
      m: `я → меня im Akkusativ. Он ждёт меня. — Er wartet auf mich.`
    },
    {
      q: `„Wir lieben sie (она)." — она im Akkusativ?`,
      a: [`она`, `ей`, `её`],
      c: 2,
      m: `она → её im Akkusativ. Мы любим её. — Wir lieben sie.`
    },
    {
      q: `„Kennst du ihn (он)?" — он im Akkusativ?`,
      a: [`его`, `ему`, `него`],
      c: 0,
      m: `он → его im Akkusativ (ohne Präposition). Ты знаешь его? — Kennst du ihn?`
    },
    {
      q: `„Verstehen Sie uns?" — мы im Akkusativ?`,
      a: [`нам`, `нас`, `нами`],
      c: 1,
      m: `мы → нас im Akkusativ. Вы понимаете нас? — Verstehen Sie uns?`
    },
    {
      q: `„Ich höre euch (вы)." — вы im Akkusativ?`,
      a: [`вам`, `вас`, `ими`],
      c: 1,
      m: `вы → вас im Akkusativ. Я слышу вас. — Ich höre euch/Sie.`
    },
    {
      q: `„Er kennt sie nicht (они)." — они im Akkusativ?`,
      a: [`им`, `ими`, `их`],
      c: 2,
      m: `они → их im Akkusativ. Он не знает их. — Er kennt sie nicht.`
    },
    {
      q: `„Ich gehe zu ihm." — он nach Präposition?`,
      a: [`его`, `него`, `нему`],
      c: 1,
      m: `Nach Präposition bekommt die 3. Person ein н-: к + его → к нему. Я иду к нему.`
    },
    {
      q: `„Wir sprechen über sie (они)." — они nach Präposition?`,
      a: [`о их`, `о нём`, `о них`],
      c: 2,
      m: `Präposition + они → них: о них. Мы говорим о них. — Wir sprechen über sie.`
    },
    {
      q: `„Это его книга." — Was bedeutet „его" hier?`,
      a: [`Ihn (Akkusativ von он)`, `Sein (Possessivpronomen)`, `Zu ihm (mit Präposition)`],
      c: 1,
      m: `„его" vor einem Nomen = Possessivpronomen (sein). Nach einem Verb = Akkusativ. Это его книга = Das ist sein Buch.`
    },
    {
      q: `„Я жду ___." — Ergänze: „Ich warte auf sie (она)."`,
      a: [`её`, `ей`, `её него`],
      c: 0,
      m: `ждать (warten auf) fordert den Akkusativ: она → её. Я жду её.`
    },
    {
      q: `„Он живёт у ___." — Ergänze: „Er wohnt bei ihr (она)."`,
      a: [`её`, `неё`, `ней`],
      c: 1,
      m: `у + она → у неё. Präposition + 3. Person → н-Anlaut. Он живёт у неё.`
    },
  ]
}
