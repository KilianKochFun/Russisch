module.exports = {
  typ: `text`,
  titel: `Kurztext: Marias Morgen`,
  tts: true,
  inhalt: `Мария встаёт рано. Утром она пьёт воду и читает газету. Потом она слушает музыку и ждёт подругу. Они вместе идут на работу. Мария любит свою работу.`,
  absaetze: [
    { ru: `Мария встаёт рано.`, de: `Maria steht früh auf.` },
    { ru: `Утром она пьёт воду и читает газету.`, de: `Morgens trinkt sie Wasser und liest die Zeitung.` },
    { ru: `Потом она слушает музыку и ждёт подругу.`, de: `Dann hört sie Musik und wartet auf die Freundin.` },
    { ru: `Они вместе идут на работу.`, de: `Sie gehen zusammen zur Arbeit.` },
    { ru: `Мария любит свою работу.`, de: `Maria mag ihre Arbeit.` },
  ],
  fragen: [
    {
      q: `Was macht Maria morgens? (2 Dinge)`,
      a: [`Sie isst und schläft`, `Sie trinkt Wasser und liest Zeitung`, `Sie hört Musik und arbeitet`],
      c: 1,
      m: `„Она пьёт воду и читает газету." — воду (Akk. von вода), газету (Akk. von газета). Beide -а → -у.`
    },
    {
      q: `„Она ждёт подругу." — Warum подругу und nicht подруга?`,
      a: [`Genitiv`, `Weil подруга feminin ist → Akkusativ: -а → -у`, `Dativ`],
      c: 1,
      m: `ждать + Akkusativ: подруга (f. -а) → подругу. Sie wartet auf die Freundin.`
    },
    {
      q: `„Мария любит свою работу." — Was ist свою?`,
      a: [`ein Adjektiv (schön)`, `Possessivpronomen „ihre eigene" (Akk. feminin)`, `ein Verb`],
      c: 1,
      m: `свой/своя/своё = sein/ihr eigener. Akkusativ feminin: свою. Мария любит свою работу = Maria mag ihre (eigene) Arbeit.`
    },
  ]
}
