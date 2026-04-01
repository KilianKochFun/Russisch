module.exports = {
  typ: `hoeren`,
  titel: `Hören: Im Supermarkt`,
  tts: true,
  text: `— У вас есть молоко?
— Да, есть. Сколько вам?
— Мне нужно два литра. И ещё хлеб.
— Хлеба нет. Только батон.
— Хорошо, дайте мне батон, пожалуйста.
— Больше ничего?
— Нет, спасибо. Сколько с меня?`,
  fragen: [
    {
      q: `Wie viel Milch wird gebraucht?`,
      a: [`Ein Liter`, `Zwei Liter`, `Drei Liter`],
      c: 1,
      m: `„Мне нужно два литра." — два + Genitiv Singular: литр → литра. два литра = zwei Liter.`
    },
    {
      q: `Was gibt es nicht im Laden?`,
      a: [`Milch`, `Brot`, `Wurst`],
      c: 1,
      m: `„Хлеба нет." — Genitiv von хлеб nach нет. „Es gibt kein Brot" — nur einen батон (Weißbrot-Laib).`
    },
    {
      q: `„Сколько с меня?" — Was bedeutet das?`,
      a: [`Wie viel haben wir?`, `Was kostet das / Was schulde ich?`, `Wie viele sind wir?`],
      c: 1,
      m: `с меня = von mir (Genitiv von я nach с). Сколько с меня? = Wie viel bin ich schuldig? Typische Kassenfrage.`
    },
  ]
}
